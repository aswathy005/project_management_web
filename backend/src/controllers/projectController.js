const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get all projects with filters & task counts
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const { search, status, priority } = req.query;
  const query = {};

  if (req.user.role === 'Team Member') {
    query.$or = [{ teamMembers: req.user._id }, { projectManager: req.user._id }];
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (priority && priority !== 'All') {
    query.priority = priority;
  }

  if (search) {
    const searchFilter = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchFilter }];
      delete query.$or;
    } else {
      query.$or = searchFilter;
    }
  }

  const projects = await Project.find(query)
    .populate('projectManager', 'name email avatarColor jobTitle role')
    .populate('teamMembers', 'name email avatarColor jobTitle role')
    .populate('createdBy', 'name')
    .sort({ updatedAt: -1 });

  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: { $in: projectIds } }).select('project status');

  const enriched = projects.map((project) => {
    const pTasks = tasks.filter((t) => t.project.toString() === project._id.toString());
    const completedCount = pTasks.filter((t) => t.status === 'Completed').length;
    return {
      ...project.toObject(),
      taskStats: {
        total: pTasks.length,
        completed: completedCount,
      },
    };
  });

  res.status(200).json({
    success: true,
    count: enriched.length,
    projects: enriched,
  });
});

// @desc    Get single project details, tasks, and activities
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('projectManager', 'name email avatarColor jobTitle role department')
    .populate('teamMembers', 'name email avatarColor jobTitle role department')
    .populate('createdBy', 'name email');

  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  if (req.user.role === 'Team Member') {
    const uid = req.user._id.toString();
    const isMember =
      project.projectManager?._id.toString() === uid ||
      project.teamMembers.some((m) => m._id.toString() === uid);
    if (!isMember) {
      throw new ApiError(403, 'You do not have access to this project.');
    }
  }

  const [tasks, activities] = await Promise.all([
    Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatarColor jobTitle')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 }),
    Activity.find({ project: project._id })
      .populate('actor', 'name avatarColor role')
      .sort({ createdAt: -1 })
      .limit(25),
  ]);

  res.status(200).json({
    success: true,
    project,
    tasks,
    activities,
  });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin, Project Manager)
const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    startDate,
    deadline,
    status,
    priority,
    projectManager,
    teamMembers = [],
    tags = [],
  } = req.body;

  if (new Date(deadline) < new Date(startDate)) {
    throw new ApiError(400, 'Project deadline cannot be earlier than the start date.');
  }

  const managerId = projectManager || req.user._id;
  const uniqueMembers = Array.from(
    new Set([...teamMembers.map((id) => id.toString()), managerId.toString()])
  );

  const project = await Project.create({
    name,
    description,
    startDate,
    deadline,
    status: status || 'Planning',
    priority: priority || 'Medium',
    projectManager: managerId,
    teamMembers: uniqueMembers,
    createdBy: req.user._id,
    tags,
  });

  await logActivity({
    actor: req.user._id,
    action: 'project_created',
    entityType: 'Project',
    entityId: project._id,
    project: project._id,
    description: `${req.user.name} created project "${project.name}"`,
  });

  // Notify project manager & assigned team members
  for (const memberId of uniqueMembers) {
    await createNotification({
      recipient: memberId,
      sender: req.user._id,
      type: 'project_assigned',
      title: 'Added to New Project',
      message: `${req.user.name} added you to project "${project.name}".`,
      link: `/projects/${project._id}`,
      relatedProject: project._id,
    });
  }

  const populated = await Project.findById(project._id)
    .populate('projectManager', 'name email avatarColor jobTitle role')
    .populate('teamMembers', 'name email avatarColor jobTitle role');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    project: populated,
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Project Manager owner)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  if (
    req.user.role === 'Project Manager' &&
    project.projectManager.toString() !== req.user._id.toString() &&
    project.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You can only edit projects you manage or created.');
  }

  const {
    name,
    description,
    startDate,
    deadline,
    status,
    priority,
    projectManager,
    teamMembers,
    tags,
  } = req.body;

  const effectiveStart = startDate || project.startDate;
  const effectiveDeadline = deadline || project.deadline;
  if (new Date(effectiveDeadline) < new Date(effectiveStart)) {
    throw new ApiError(400, 'Project deadline cannot be earlier than the start date.');
  }

  const prevMembers = new Set(project.teamMembers.map((id) => id.toString()));

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (startDate !== undefined) project.startDate = startDate;
  if (deadline !== undefined) project.deadline = deadline;
  if (status !== undefined) project.status = status;
  if (priority !== undefined) project.priority = priority;
  if (projectManager !== undefined) project.projectManager = projectManager;
  if (tags !== undefined) project.tags = tags;

  if (teamMembers !== undefined) {
    const managerId = (projectManager || project.projectManager).toString();
    project.teamMembers = Array.from(
      new Set([...teamMembers.map((id) => id.toString()), managerId])
    );
  }

  await project.save();

  await logActivity({
    actor: req.user._id,
    action: 'project_updated',
    entityType: 'Project',
    entityId: project._id,
    project: project._id,
    description: `${req.user.name} updated project "${project.name}"`,
  });

  // Notify newly added team members
  for (const memberId of project.teamMembers) {
    if (!prevMembers.has(memberId.toString())) {
      await createNotification({
        recipient: memberId,
        sender: req.user._id,
        type: 'project_assigned',
        title: 'Added to Project Team',
        message: `${req.user.name} added you to "${project.name}".`,
        link: `/projects/${project._id}`,
        relatedProject: project._id,
      });
    }
  }

  const populated = await Project.findById(project._id)
    .populate('projectManager', 'name email avatarColor jobTitle role')
    .populate('teamMembers', 'name email avatarColor jobTitle role');

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    project: populated,
  });
});

// @desc    Delete project and cascade its tasks/comments
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Project Manager owner)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  if (
    req.user.role === 'Project Manager' &&
    project.projectManager.toString() !== req.user._id.toString() &&
    project.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You can only delete projects you manage or created.');
  }

  await Promise.all([
    Task.deleteMany({ project: project._id }),
    Comment.deleteMany({ project: project._id }),
    Activity.deleteMany({ project: project._id }),
    project.deleteOne(),
  ]);

  await logActivity({
    actor: req.user._id,
    action: 'project_deleted',
    entityType: 'Project',
    entityId: project._id,
    description: `${req.user.name} deleted project "${project.name}"`,
  });

  res.status(200).json({
    success: true,
    message: 'Project and related tasks deleted successfully',
  });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
