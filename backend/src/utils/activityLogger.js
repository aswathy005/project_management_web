const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const logActivity = async ({
  actor,
  action,
  entityType,
  entityId,
  project = null,
  task = null,
  description,
}) => {
  try {
    return await Activity.create({
      actor,
      action,
      entityType,
      entityId,
      project,
      task,
      description,
    });
  } catch (err) {
    console.error('Activity logging error:', err.message);
    return null;
  }
};

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '/notifications',
  relatedProject = null,
  relatedTask = null,
}) => {
  try {
    if (!recipient) return null;
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }
    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedProject,
      relatedTask,
    });
  } catch (err) {
    console.error('Notification creation error:', err.message);
    return null;
  }
};

module.exports = { logActivity, createNotification };
