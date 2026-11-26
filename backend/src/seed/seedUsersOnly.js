const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

const seedUsersOnly = async () => {
  try {
    await connectDB();
    console.log('Resetting database to clean state with requested user accounts...');

    await Promise.all([
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);

    await User.create([
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin@123',
        role: 'Admin',
        jobTitle: 'Workspace Administrator',
        department: 'Administration',
        avatarColor: '#4F46E5',
      },
      {
        name: 'Project Manager',
        email: 'ProjectManager@gmail.com',
        password: 'ProjectManager@123',
        role: 'Project Manager',
        jobTitle: 'Project Manager',
        department: 'Product Delivery',
        avatarColor: '#0EA5E9',
      },
      {
        name: 'Team Member',
        email: 'TeamMember@gmail.com',
        password: 'TeamMember@123',
        role: 'Team Member',
        jobTitle: 'Team Member',
        department: 'Engineering',
        avatarColor: '#10B981',
      },
    ]);

    console.log('User accounts created successfully (projects/tasks left empty):');
    console.log('  Admin:           admin@gmail.com / admin@123');
    console.log('  Project Manager: ProjectManager@gmail.com / ProjectManager@123');
    console.log('  Team Member:     TeamMember@gmail.com / TeamMember@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed users:', error);
    process.exit(1);
  }
};

seedUsersOnly();
