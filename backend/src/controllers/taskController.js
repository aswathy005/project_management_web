const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');
const { recalculateProjectProgress } = require('../utils/progressUtils');

// @desc    Get tasks with optional filters
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { project, status, priority, assignedTo, search } = req.query;
  const query = {};

  if (req.user.role === 'Team Member') {
    const memberProjects = await Project.find({
      $or: [{ teamMembers: req.user._id }, { projectManager: req.user._id }],
    }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    query.$or = [{ project: { $in: projectIds } }, { assignedTo: req.user._id }];
  }

  if (project && project !== 'All') query.project = project;
  if (status && status !== 'All') query.status = status;
  if (priority && priority !== 'All') query.priority = priority;
  if (assignedTo && assignedTo !== 'All') query.assignedTo = assignedTo;

  if (search) {
    const searchFilter = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchFilter }];
      delete query.$or;
    } else {
      query.$or = searchFilter;
    }
  }

  const tasks = await Task.find(query)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email avatarColor jobTitle')
    .populate('createdBy', 'name email avatarColor')
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;
  const query = { assignedTo: req.user._id };

  if (status && status !== 'All') query.status = status;
  if (priority && priority !== 'All') query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(query)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email avatarColor jobTitle')
    .populate('createdBy', 'name')
    .sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

// @desc    Get single task with comments
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name status projectManager teamMembers')
    .populate('assignedTo', 'name email avatarColor jobTitle role')
    .populate('createdBy', 'name email avatarColor role');

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name email avatarColor jobTitle role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    task,
    comments,
  });
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignedTo, priority, status, dueDate } = req.body;

  const parentProject = await Project.findById(project);
  if (!parentProject) {
    throw new ApiError(404, 'Selected project does not exist.');
  }

  if (req.user.role === 'Team Member') {
    const uid = req.user._id.toString();
    const isMember =
      parentProject.projectManager.toString() === uid ||
      parentProject.teamMembers.some((m) => m.toString() === uid);
    if (!isMember) {
      throw new ApiError(403, 'You can only create tasks inside projects you belong to.');
    }
  }

  const task = await Task.create({
    title,
    description: description || '',
    project,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    priority: priority || 'Medium',
    status: status || 'To Do',
    dueDate,
  });

  await recalculateProjectProgress(project);

  await logActivity({
    actor: req.user._id,
    action: 'task_created',
    entityType: 'Task',
    entityId: task._id,
    project: parentProject._id,
    task: task._id,
    description: `${req.user.name} created task "${task.title}" in ${parentProject.name}`,
  });

  if (assignedTo) {
    await createNotification({
      recipient: assignedTo,
      sender: req.user._id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `${req.user.name} assigned you "${task.title}" in ${parentProject.name}.`,
      link: `/projects/${parentProject._id}`,
      relatedProject: parentProject._id,
      relatedTask: task._id,
    });
  }

  const populated = await Task.findById(task._id)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email avatarColor jobTitle')
    .populate('createdBy', 'name email avatarColor');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task: populated,
  });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project', 'name projectManager');
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const { title, description, project, assignedTo, priority, status, dueDate } = req.body;
  const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;
  const previousStatus = task.status;
  const previousProject = task.project._id.toString();

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (project !== undefined) task.project = project;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();

  await recalculateProjectProgress(task.project);
  if (project && project.toString() !== previousProject) {
    await recalculateProjectProgress(previousProject);
  }

  await logActivity({
    actor: req.user._id,
    action: 'task_updated',
    entityType: 'Task',
    entityId: task._id,
    project: task.project._id || task.project,
    task: task._id,
    description: `${req.user.name} updated task "${task.title}"`,
  });

  if (assignedTo && assignedTo.toString() !== previousAssignee) {
    await createNotification({
      recipient: assignedTo,
      sender: req.user._id,
      type: 'task_assigned',
      title: 'Task Assigned to You',
      message: `${req.user.name} assigned you "${task.title}".`,
      link: `/projects/${task.project._id || task.project}`,
      relatedProject: task.project._id || task.project,
      relatedTask: task._id,
    });
  }

  if (status && status !== previousStatus) {
    const notifyTarget = task.assignedTo || task.createdBy;
    await createNotification({
      recipient: notifyTarget,
      sender: req.user._id,
      type: 'task_status',
      title: 'Task Status Changed',
      message: `"${task.title}" moved from ${previousStatus} to ${status}.`,
      link: `/kanban`,
      relatedProject: task.project._id || task.project,
      relatedTask: task._id,
    });
  }

  const populated = await Task.findById(task._id)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email avatarColor jobTitle')
    .populate('createdBy', 'name email avatarColor');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    task: populated,
  });
});

// @desc    Quick update task status (Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, order } = req.body;
  const task = await Task.findById(req.params.id).populate('project', 'name projectManager');

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const previousStatus = task.status;
  task.status = status;
  if (order !== undefined) task.order = order;

  await task.save();
  await recalculateProjectProgress(task.project._id);

  if (previousStatus !== status) {
    await logActivity({
      actor: req.user._id,
      action: 'task_status_changed',
      entityType: 'Task',
      entityId: task._id,
      project: task.project._id,
      task: task._id,
      description: `${req.user.name} moved "${task.title}" from ${previousStatus} to ${status}`,
    });

    const recipients = new Set();
    if (task.createdBy) recipients.add(task.createdBy.toString());
    if (task.assignedTo) recipients.add(task.assignedTo.toString());
    if (task.project?.projectManager) recipients.add(task.project.projectManager.toString());

    for (const recipientId of recipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: 'task_status',
        title: 'Task Status Updated',
        message: `${req.user.name} moved "${task.title}" to ${status}.`,
        link: '/kanban',
        relatedProject: task.project._id,
        relatedTask: task._id,
      });
    }
  }

  const populated = await Task.findById(task._id)
    .populate('project', 'name status priority')
    .populate('assignedTo', 'name email avatarColor jobTitle')
    .populate('createdBy', 'name email avatarColor');

  res.status(200).json({
    success: true,
    message: `Task moved to ${status}`,
    task: populated,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Project Manager, or Task Creator)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (
    req.user.role === 'Team Member' &&
    task.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You can only delete tasks you created.');
  }

  const projectId = task.project;
  await Promise.all([Comment.deleteMany({ task: task._id }), task.deleteOne()]);
  await recalculateProjectProgress(projectId);

  await logActivity({
    actor: req.user._id,
    action: 'task_deleted',
    entityType: 'Task',
    entityId: task._id,
    project: projectId,
    description: `${req.user.name} deleted task "${task.title}"`,
  });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
