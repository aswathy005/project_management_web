const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { syncDeadlineNotificationsForUser } = require('../utils/progressUtils');

// @desc    Get real-time dashboard analytics from MongoDB
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  await syncDeadlineNotificationsForUser(req.user._id);

  const projectFilter =
    req.user.role === 'Team Member'
      ? { $or: [{ teamMembers: req.user._id }, { projectManager: req.user._id }] }
      : {};

  const projects = await Project.find(projectFilter)
    .populate('projectManager', 'name avatarColor')
    .sort({ updatedAt: -1 });

  const projectIds = projects.map((p) => p._id);

  const taskFilter =
    req.user.role === 'Team Member'
      ? { $or: [{ project: { $in: projectIds } }, { assignedTo: req.user._id }] }
      : {};

  const [tasks, users, recentActivities, myAssignedTasks] = await Promise.all([
    Task.find(taskFilter)
      .populate('project', 'name status')
      .populate('assignedTo', 'name avatarColor jobTitle')
      .sort({ dueDate: 1 }),
    User.find({ isActive: true }).select('name email role jobTitle avatarColor'),
    Activity.find(
      req.user.role === 'Team Member' ? { project: { $in: projectIds } } : {}
    )
      .populate('actor', 'name avatarColor role')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
    Task.find({ assignedTo: req.user._id })
      .populate('project', 'name status')
      .sort({ dueDate: 1 })
      .limit(6),
  ]);

  const now = new Date();
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && new Date(t.dueDate) < now
  ).length;

  const overallProgress =
    totalProjects === 0
      ? 0
      : Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects);

  // Project progress chart data (top 7 active/recent projects)
  const projectProgressChart = projects.slice(0, 7).map((p) => {
    const pTasks = tasks.filter((t) => t.project && t.project._id.toString() === p._id.toString());
    const pCompleted = pTasks.filter((t) => t.status === 'Completed').length;
    return {
      id: p._id,
      name: p.name.length > 18 ? `${p.name.slice(0, 18)}...` : p.name,
      fullName: p.name,
      progress: p.progress || 0,
      completed: pCompleted,
      total: pTasks.length,
    };
  });

  // Task status distribution chart data
  const statuses = ['To Do', 'In Progress', 'In Review', 'Completed'];
  const statusColors = {
    'To Do': '#64748B',
    'In Progress': '#4F46E5',
    'In Review': '#F59E0B',
    Completed: '#10B981',
  };
  const taskStatusChart = statuses.map((status) => ({
    name: status,
    value: tasks.filter((t) => t.status === status).length,
    color: statusColors[status],
  }));

  // Upcoming deadlines (incomplete tasks ordered by nearest due date)
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  // Team productivity overview
  const teamProductivity = users
    .map((member) => {
      const mTasks = tasks.filter(
        (t) => t.assignedTo && t.assignedTo._id.toString() === member._id.toString()
      );
      const mCompleted = mTasks.filter((t) => t.status === 'Completed').length;
      const mPending = mTasks.length - mCompleted;
      const completionRate =
        mTasks.length === 0 ? 0 : Math.round((mCompleted / mTasks.length) * 100);
      return {
        _id: member._id,
        name: member.name,
        role: member.role,
        jobTitle: member.jobTitle,
        avatarColor: member.avatarColor,
        totalTasks: mTasks.length,
        completedTasks: mCompleted,
        pendingTasks: mPending,
        completionRate,
      };
    })
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 6);

  res.status(200).json({
    success: true,
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      overallProgress,
    },
    charts: {
      projectProgress: projectProgressChart,
      taskStatus: taskStatusChart,
    },
    recentActivities,
    upcomingDeadlines,
    myAssignedTasks,
    teamProductivity,
  });
});

module.exports = { getDashboardStats };
