const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const recalculateProjectProgress = async (projectId) => {
  if (!projectId) return 0;

  const [totalTasks, completedTasks] = await Promise.all([
    Task.countDocuments({ project: projectId }),
    Task.countDocuments({ project: projectId, status: 'Completed' }),
  ]);

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const project = await Project.findById(projectId);
  if (project) {
    project.progress = progress;
    if (totalTasks > 0 && progress === 100 && project.status !== 'Completed') {
      project.status = 'Completed';
    } else if (project.status === 'Completed' && progress < 100) {
      project.status = 'In Progress';
    }
    await project.save();
  }
  return progress;
};

const syncDeadlineNotificationsForUser = async (userId) => {
  const now = new Date();
  const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const urgentTasks = await Task.find({
    assignedTo: userId,
    status: { $ne: 'Completed' },
    dueDate: { $lte: next48Hours },
  }).populate('project', 'name');

  for (const task of urgentTasks) {
    const isOverdue = new Date(task.dueDate) < now;
    const title = isOverdue ? 'Task Overdue' : 'Upcoming Task Deadline';

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await Notification.findOne({
      recipient: userId,
      relatedTask: task._id,
      type: 'deadline',
      createdAt: { $gte: startOfDay },
    });

    if (!existing) {
      await Notification.create({
        recipient: userId,
        type: 'deadline',
        title,
        message: isOverdue
          ? `"${task.title}" in ${task.project?.name || 'project'} is overdue.`
          : `"${task.title}" in ${task.project?.name || 'project'} is due soon.`,
        link: task.project ? `/projects/${task.project._id}` : '/my-tasks',
        relatedProject: task.project?._id || null,
        relatedTask: task._id,
      });
    }
  }
};

module.exports = { recalculateProjectProgress, syncDeadlineNotificationsForUser };
