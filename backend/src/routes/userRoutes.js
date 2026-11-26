const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  createUser,
  getUserById,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post(
  '/',
  authorize('Admin'),
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('role')
      .optional()
      .isIn(['Admin', 'Project Manager', 'Team Member'])
      .withMessage('Invalid role'),
  ],
  validateRequest,
  createUser
);

router.get('/:id', getUserById);
router.patch(
  '/:id/role',
  authorize('Admin'),
  [
    body('role')
      .optional()
      .isIn(['Admin', 'Project Manager', 'Team Member'])
      .withMessage('Invalid role'),
  ],
  validateRequest,
  updateUserRole
);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
