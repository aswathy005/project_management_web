const express = require('express');
const { body } = require('express-validator');
const {
  getTaskComments,
  addComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/task/:taskId', getTaskComments);
router.post(
  '/task/:taskId',
  [body('content').trim().notEmpty().withMessage('Comment text cannot be empty')],
  validateRequest,
  addComment
);
router.delete('/:id', deleteComment);

module.exports = router;
