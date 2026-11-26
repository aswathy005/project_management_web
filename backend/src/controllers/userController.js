const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get all team members with task workload stats
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const query = {};

  if (role && role !== 'All') {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { jobTitle: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, tasks, projects] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }),
    Task.find({}).select('assignedTo status dueDate'),
    Project.find({}).select('projectManager teamMembers'),
  ]);

  const now = new Date();
  const enrichedUsers = users.map((user) => {
    const uid = user._id.toString();
    const userTasks = tasks.filter((t) => t.assignedTo && t.assignedTo.toString() === uid);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = userTasks.filter(
      (t) => t.status !== 'Completed' && new Date(t.dueDate) < now
    ).length;

    const projectCount = projects.filter(
      (p) =>
        (p.projectManager && p.projectManager.toString() === uid) ||
        p.teamMembers.some((m) => m.toString() === uid)
    ).length;

    // Workload percentage capped at 100 (assuming 8 active tasks = 100% capacity)
    const workloadPercent = Math.min(100, Math.round((pendingTasks / 8) * 100));

    return {
      ...user.toObject(),
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        projectCount,
        workloadPercent,
      },
    };
  });

  res.status(200).json({
    success: true,
    count: enrichedUsers.length,
    users: enrichedUsers,
  });
});

// @desc    Add a new team member (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, jobTitle, department, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password: password || 'Password@123',
    role: role || 'Team Member',
    jobTitle: jobTitle || 'Team Member',
    department: department || 'Engineering',
    phone: phone || '',
  });

  await logActivity({
    actor: req.user._id,
    action: 'member_added',
    entityType: 'User',
    entityId: user._id,
    description: `${req.user.name} added ${user.name} (${user.role}) to the team`,
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    user: userObj,
  });
});

// @desc    Get single member profile with assigned tasks and projects
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'Team member not found.');
  }

  const [tasks, projects] = await Promise.all([
    Task.find({ assignedTo: user._id })
      .populate('project', 'name status')
      .sort({ dueDate: 1 }),
    Project.find({
      $or: [{ projectManager: user._id }, { teamMembers: user._id }],
    }).select('name status priority progress deadline'),
  ]);

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.length - completedTasks;

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      stats: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        projectCount: projects.length,
        workloadPercent: Math.min(100, Math.round((pendingTasks / 8) * 100)),
      },
    },
    tasks,
    projects,
  });
});

// @desc    Update member role or active status (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role, jobTitle, department, isActive } = req.body;

  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'Team member not found.');
  }

  if (user._id.toString() === req.user._id.toString() && role && role !== 'Admin') {
    throw new ApiError(400, 'You cannot downgrade your own Admin role.');
  }

  const previousRole = user.role;
  if (role) user.role = role;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (department !== undefined) user.department = department;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  if (role && role !== previousRole) {
    await logActivity({
      actor: req.user._id,
      action: 'role_updated',
      entityType: 'User',
      entityId: user._id,
      description: `${req.user.name} changed ${user.name}'s role from ${previousRole} to ${role}`,
    });

    await createNotification({
      recipient: user._id,
      sender: req.user._id,
      type: 'role_updated',
      title: 'Role Updated',
      message: `Your ProTrack workspace role was updated to ${role} by ${req.user.name}.`,
      link: '/profile',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Member details updated successfully',
    user,
  });
});

// @desc    Delete team member (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  await Task.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } });
  await Project.updateMany(
    { teamMembers: user._id },
    { $pull: { teamMembers: user._id } }
  );
  await user.deleteOne();

  await logActivity({
    actor: req.user._id,
    action: 'member_removed',
    entityType: 'User',
    entityId: user._id,
    description: `${req.user.name} removed ${user.name} from the workspace`,
  });

  res.status(200).json({
    success: true,
    message: 'Team member removed successfully',
  });
});

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserRole,
  deleteUser,
};
