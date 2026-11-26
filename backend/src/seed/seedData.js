const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const { recalculateProjectProgress } = require('../utils/progressUtils');

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Clearing existing ProTrack data...');

    await Promise.all([
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('Creating demo users...');
    const users = await User.create([
      {
        name: 'Elena Vance',
        email: 'admin@gmail.com',
        password: 'admin@123',
        role: 'Admin',
        jobTitle: 'VP of Engineering',
        department: 'Executive & Engineering',
        phone: '+1 (555) 210-4400',
        bio: 'Overseeing product delivery, engineering excellence, and cross-functional velocity across ProTrack workspaces.',
        avatarColor: '#4F46E5',
      },
      {
        name: 'Marcus Chen',
        email: 'ProjectManager@gmail.com',
        password: 'ProjectManager@123',
        role: 'Project Manager',
        jobTitle: 'Senior Technical PM',
        department: 'Product Delivery',
        phone: '+1 (555) 392-8812',
        bio: 'Agile delivery lead specializing in SaaS platform launches, sprint planning, and stakeholder alignment.',
        avatarColor: '#0EA5E9',
      },
      {
        name: 'Priya Nair',
        email: 'priya@protrack.io',
        password: 'Password@123',
        role: 'Project Manager',
        jobTitle: 'Product Operations Manager',
        department: 'Product & Design',
        phone: '+1 (555) 488-9021',
        bio: 'Coordinating design systems, customer portal migrations, and quality assurance milestones.',
        avatarColor: '#8B5CF6',
      },
      {
        name: 'Liam OConnor',
        email: 'TeamMember@gmail.com',
        password: 'TeamMember@123',
        role: 'Team Member',
        jobTitle: 'Full Stack Developer',
        department: 'Core Platform',
        phone: '+1 (555) 614-7730',
        bio: 'Building scalable REST APIs, React interfaces, and real-time analytics workflows.',
        avatarColor: '#10B981',
      },
      {
        name: 'Sofia Martinez',
        email: 'sofia@protrack.io',
        password: 'Password@123',
        role: 'Team Member',
        jobTitle: 'Senior UI/UX Designer',
        department: 'Design Studio',
        phone: '+1 (555) 741-5529',
        bio: 'Crafting accessible component libraries, interaction animations, and enterprise user flows.',
        avatarColor: '#EC4899',
      },
      {
        name: 'Noah Patel',
        email: 'noah@protrack.io',
        password: 'Password@123',
        role: 'Team Member',
        jobTitle: 'Backend & DevOps Engineer',
        department: 'Cloud Infrastructure',
        phone: '+1 (555) 892-3318',
        bio: 'Focused on database indexing, JWT security hardening, CI/CD pipelines, and observability.',
        avatarColor: '#F59E0B',
      },
    ]);

    const [elena, marcus, priya, liam, sofia, noah] = users;

    console.log('Creating demo projects...');
    const projects = await Project.create([
      {
        name: 'NextGen Cloud Portal v2.0',
        description:
          'Complete redesign and architectural upgrade of our customer-facing SaaS analytics portal with role-based workspaces and automated billing.',
        startDate: daysFromNow(-28),
        deadline: daysFromNow(18),
        status: 'In Progress',
        priority: 'Urgent',
        projectManager: marcus._id,
        teamMembers: [marcus._id, liam._id, sofia._id, noah._id],
        createdBy: elena._id,
        tags: ['SaaS', 'React', 'API'],
      },
      {
        name: 'Enterprise SSO & Security Hardening',
        description:
          'Implement SAML 2.0 SSO, RBAC audit trails, token rotation, and SOC2 compliance checks across all core microservices.',
        startDate: daysFromNow(-20),
        deadline: daysFromNow(10),
        status: 'In Progress',
        priority: 'High',
        projectManager: marcus._id,
        teamMembers: [marcus._id, noah._id, liam._id],
        createdBy: marcus._id,
        tags: ['Security', 'Auth', 'Compliance'],
      },
      {
        name: 'Aura Design System 3.0',
        description:
          'Unified Figma-to-React component library featuring WCAG AA accessibility, micro-interactions, and responsive dashboard templates.',
        startDate: daysFromNow(-45),
        deadline: daysFromNow(-3),
        status: 'Completed',
        priority: 'Medium',
        projectManager: priya._id,
        teamMembers: [priya._id, sofia._id, liam._id],
        createdBy: elena._id,
        tags: ['Design System', 'UI/UX'],
      },
      {
        name: 'Mobile Companion App (iOS & Android)',
        description:
          'Cross-platform mobile client for push notifications, quick task approvals, and offline Kanban board synchronization.',
        startDate: daysFromNow(-5),
        deadline: daysFromNow(42),
        status: 'Planning',
        priority: 'Medium',
        projectManager: priya._id,
        teamMembers: [priya._id, liam._id, sofia._id],
        createdBy: priya._id,
        tags: ['Mobile', 'Notifications'],
      },
      {
        name: 'Automated Data Warehouse Sync',
        description:
          'Real-time ETL pipeline streaming operational MongoDB collections into Snowflake for executive BI reporting.',
        startDate: daysFromNow(-16),
        deadline: daysFromNow(25),
        status: 'On Hold',
        priority: 'Low',
        projectManager: marcus._id,
        teamMembers: [marcus._id, noah._id],
        createdBy: elena._id,
        tags: ['Data', 'ETL'],
      },
    ]);

    const [pCloud, pSecurity, pDesign, pMobile, pData] = projects;

    console.log('Creating demo tasks...');
    const tasks = await Task.create([
      // Cloud Portal tasks
      {
        title: 'Design executive analytics dashboard wireframes',
        description: 'Finalize KPI cards, chart layouts, and responsive breakpoints for desktop and tablet.',
        project: pCloud._id,
        assignedTo: sofia._id,
        createdBy: marcus._id,
        priority: 'High',
        status: 'Completed',
        dueDate: daysFromNow(-10),
        completedAt: daysFromNow(-11),
      },
      {
        title: 'Implement JWT refresh & role guard middleware',
        description: 'Enforce role-based permissions on project mutation routes and validate payloads.',
        project: pCloud._id,
        assignedTo: noah._id,
        createdBy: marcus._id,
        priority: 'Urgent',
        status: 'Completed',
        dueDate: daysFromNow(-6),
        completedAt: daysFromNow(-7),
      },
      {
        title: 'Build interactive Kanban drag-and-drop board',
        description: 'Connect @hello-pangea/dnd column transitions to PATCH /api/tasks/:id/status.',
        project: pCloud._id,
        assignedTo: liam._id,
        createdBy: marcus._id,
        priority: 'Urgent',
        status: 'In Progress',
        dueDate: daysFromNow(2),
      },
      {
        title: 'Integrate Recharts project progress visualizations',
        description: 'Connect live MongoDB aggregation endpoints to BarChart and DonutChart widgets.',
        project: pCloud._id,
        assignedTo: liam._id,
        createdBy: marcus._id,
        priority: 'High',
        status: 'In Review',
        dueDate: daysFromNow(4),
      },
      {
        title: 'Create onboarding empty states & micro-animations',
        description: 'Add smooth fade/slide transitions and helpful action prompts on empty views.',
        project: pCloud._id,
        assignedTo: sofia._id,
        createdBy: marcus._id,
        priority: 'Medium',
        status: 'To Do',
        dueDate: daysFromNow(7),
      },

      // Enterprise SSO tasks
      {
        title: 'Audit password hashing & bcrypt cost factor',
        description: 'Verify salt rounds and prevent timing leaks on authentication endpoints.',
        project: pSecurity._id,
        assignedTo: noah._id,
        createdBy: marcus._id,
        priority: 'High',
        status: 'Completed',
        dueDate: daysFromNow(-4),
        completedAt: daysFromNow(-5),
      },
      {
        title: 'Configure automated deadline alert cron job',
        description: 'Notify assignees 48 hours before task due dates and flag overdue items.',
        project: pSecurity._id,
        assignedTo: liam._id,
        createdBy: marcus._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: daysFromNow(-1), // Overdue task for realistic dashboard testing!
      },
      {
        title: 'Penetration test RBAC endpoints for Team Members',
        description: 'Ensure Team Member tokens receive 403 Forbidden on Admin-only endpoints.',
        project: pSecurity._id,
        assignedTo: noah._id,
        createdBy: elena._id,
        priority: 'Urgent',
        status: 'To Do',
        dueDate: daysFromNow(1),
      },

      // Aura Design System (All completed -> 100%)
      {
        title: 'Publish typography, spacing & color tokens',
        description: 'Standardize Tailwind config palette across all SaaS modules.',
        project: pDesign._id,
        assignedTo: sofia._id,
        createdBy: priya._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: daysFromNow(-18),
        completedAt: daysFromNow(-19),
      },
      {
        title: 'Build accessible modal & confirmation dialog kit',
        description: 'Support keyboard Escape handling and focus states.',
        project: pDesign._id,
        assignedTo: liam._id,
        createdBy: priya._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: daysFromNow(-8),
        completedAt: daysFromNow(-9),
      },

      // Mobile Companion App tasks
      {
        title: 'Draft push notification payload architecture',
        description: 'Map task assignment and comment events to mobile notification channels.',
        project: pMobile._id,
        assignedTo: liam._id,
        createdBy: priya._id,
        priority: 'Medium',
        status: 'To Do',
        dueDate: daysFromNow(12),
      },
      {
        title: 'Prototype mobile task card swipe gestures',
        description: 'Explore quick complete and reassign interactions for small viewports.',
        project: pMobile._id,
        assignedTo: sofia._id,
        createdBy: priya._id,
        priority: 'Low',
        status: 'In Progress',
        dueDate: daysFromNow(16),
      },

      // Data Warehouse Sync tasks
      {
        title: 'Benchmark MongoDB change stream throughput',
        description: 'Measure replication lag under 5k writes/sec synthetic load.',
        project: pData._id,
        assignedTo: noah._id,
        createdBy: marcus._id,
        priority: 'Low',
        status: 'To Do',
        dueDate: daysFromNow(20),
      },
    ]);

    // Recalculate project progress from tasks
    for (const p of projects) {
      await recalculateProjectProgress(p._id);
    }

    console.log('Creating demo comments...');
    await Comment.create([
      {
        content: 'Column transitions are hooked up to the backend PATCH route and project progress updates automatically!',
        task: tasks[2]._id,
        project: pCloud._id,
        author: liam._id,
      },
      {
        content: 'Awesome work Liam! Remember to verify the priority & assignee filter state while dragging cards.',
        task: tasks[2]._id,
        project: pCloud._id,
        author: marcus._id,
      },
      {
        content: 'Added responsive tooltip styling to both the BarChart and DonutChart components.',
        task: tasks[3]._id,
        project: pCloud._id,
        author: sofia._id,
      },
    ]);

    console.log('Creating demo activities...');
    await Activity.create([
      {
        actor: elena._id,
        action: 'project_created',
        entityType: 'Project',
        entityId: pCloud._id,
        project: pCloud._id,
        description: 'Elena Vance created project "NextGen Cloud Portal v2.0"',
      },
      {
        actor: sofia._id,
        action: 'task_status_changed',
        entityType: 'Task',
        entityId: tasks[0]._id,
        project: pCloud._id,
        task: tasks[0]._id,
        description: 'Sofia Martinez moved "Design executive analytics dashboard wireframes" to Completed',
      },
      {
        actor: noah._id,
        action: 'task_status_changed',
        entityType: 'Task',
        entityId: tasks[1]._id,
        project: pCloud._id,
        task: tasks[1]._id,
        description: 'Noah Patel moved "Implement JWT refresh & role guard middleware" to Completed',
      },
      {
        actor: liam._id,
        action: 'comment_added',
        entityType: 'Comment',
        entityId: tasks[2]._id,
        project: pCloud._id,
        task: tasks[2]._id,
        description: 'Liam OConnor commented on "Build interactive Kanban drag-and-drop board"',
      },
      {
        actor: priya._id,
        action: 'project_updated',
        entityType: 'Project',
        entityId: pDesign._id,
        project: pDesign._id,
        description: 'Priya Nair marked project "Aura Design System 3.0" as Completed',
      },
    ]);

    console.log('Creating demo notifications...');
    await Notification.create([
      {
        recipient: liam._id,
        sender: marcus._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'Marcus Chen assigned you "Build interactive Kanban drag-and-drop board".',
        link: '/kanban',
        relatedProject: pCloud._id,
        relatedTask: tasks[2]._id,
        isRead: false,
      },
      {
        recipient: liam._id,
        sender: marcus._id,
        type: 'comment_added',
        title: 'New Comment on Task',
        message: 'Marcus Chen commented on "Build interactive Kanban drag-and-drop board".',
        link: `/projects/${pCloud._id}`,
        relatedProject: pCloud._id,
        relatedTask: tasks[2]._id,
        isRead: false,
      },
      {
        recipient: marcus._id,
        sender: sofia._id,
        type: 'task_status',
        title: 'Task Completed',
        message: 'Sofia Martinez completed "Design executive analytics dashboard wireframes".',
        link: `/projects/${pCloud._id}`,
        relatedProject: pCloud._id,
        relatedTask: tasks[0]._id,
        isRead: false,
      },
      {
        recipient: elena._id,
        sender: priya._id,
        type: 'task_status',
        title: 'Milestone Reached',
        message: 'Aura Design System 3.0 reached 100% task completion.',
        link: `/projects/${pDesign._id}`,
        relatedProject: pDesign._id,
        isRead: false,
      },
    ]);

    console.log('Seed completed successfully!');
    console.log('Demo Accounts:');
    console.log('  Admin:           admin@gmail.com / admin@123');
    console.log('  Project Manager: ProjectManager@gmail.com / ProjectManager@123');
    console.log('  Team Member:     TeamMember@gmail.com / TeamMember@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
