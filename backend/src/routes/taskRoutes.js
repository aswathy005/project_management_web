const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/my-tasks', getMyTasks);
router.get('/:id', getTaskById);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters'),
    body('project').notEmpty().withMessage('Project is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Urgent'])
      .withMessage('Invalid task priority'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'In Review', 'Completed'])
      .withMessage('Invalid task status'),
  ],
  validateRequest,
  createTask
);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Urgent'])
      .withMessage('Invalid task priority'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'In Review', 'Completed'])
      .withMessage('Invalid task status'),
  ],
  validateRequest,
  updateTask
);

router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['To Do', 'In Progress', 'In Review', 'Completed'])
      .withMessage('Invalid task status'),
  ],
  validateRequest,
  updateTaskStatus
);

router.delete('/:id', deleteTask);

module.exports = router;
