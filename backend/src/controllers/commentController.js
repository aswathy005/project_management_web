const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('author', 'name email avatarColor jobTitle role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    comments,
  });
});

// @desc    Add a comment to a task
// @route   POST /api/comments/task/:taskId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const task = await Task.findById(req.params.taskId).populate('project', 'name');
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  const comment = await Comment.create({
    content,
    task: task._id,
    project: task.project._id,
    author: req.user._id,
  });

  await logActivity({
    actor: req.user._id,
    action: 'comment_added',
    entityType: 'Comment',
    entityId: comment._id,
    project: task.project._id,
    task: task._id,
    description: `${req.user.name} commented on "${task.title}"`,
  });

  const recipients = new Set();
  if (task.assignedTo) recipients.add(task.assignedTo.toString());
  if (task.createdBy) recipients.add(task.createdBy.toString());

  for (const recipientId of recipients) {
    await createNotification({
      recipient: recipientId,
      sender: req.user._id,
      type: 'comment_added',
      title: 'New Comment on Task',
      message: `${req.user.name} commented on "${task.title}": "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
      link: `/projects/${task.project._id}`,
      relatedProject: task.project._id,
      relatedTask: task._id,
    });
  }

  const populated = await Comment.findById(comment._id).populate(
    'author',
    'name email avatarColor jobTitle role'
  );

  res.status(201).json({
    success: true,
    message: 'Comment added',
    comment: populated,
  });
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author or Admin)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (
    req.user.role !== 'Admin' &&
    comment.author.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Comment deleted',
  });
});

module.exports = { getTaskComments, addComment, deleteComment };
