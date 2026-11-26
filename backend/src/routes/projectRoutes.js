const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post(
  '/',
  authorize('Admin', 'Project Manager'),
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
    body('description').trim().notEmpty().withMessage('Project description is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('deadline').notEmpty().withMessage('Deadline is required'),
    body('status')
      .optional()
      .isIn(['Planning', 'In Progress', 'On Hold', 'Completed'])
      .withMessage('Invalid project status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Urgent'])
      .withMessage('Invalid project priority'),
  ],
  validateRequest,
  createProject
);

router.put(
  '/:id',
  authorize('Admin', 'Project Manager'),
  [
    body('name').optional().trim().isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
    body('status')
      .optional()
      .isIn(['Planning', 'In Progress', 'On Hold', 'Completed'])
      .withMessage('Invalid project status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Urgent'])
      .withMessage('Invalid project priority'),
  ],
  validateRequest,
  updateProject
);

router.delete('/:id', authorize('Admin', 'Project Manager'), deleteProject);

module.exports = router;
