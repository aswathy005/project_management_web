const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

const clearDatabase = async () => {
  try {
    await connectDB();
    console.log('Clearing all collections in ProTrack database...');

    await Promise.all([
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);

    const [users, projects, tasks, comments, notifications, activities] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Comment.countDocuments(),
      Notification.countDocuments(),
      Activity.countDocuments(),
    ]);

    console.log('All data cleared successfully. Current document counts:');
    console.log({ users, projects, tasks, comments, notifications, activities });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
};

clearDatabase();
