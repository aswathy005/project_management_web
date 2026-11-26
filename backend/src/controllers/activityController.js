const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get recent workspace or project activities
// @route   GET /api/activities
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  const { project, limit = 30 } = req.query;
  const query = {};
  if (project) query.project = project;

  const activities = await Activity.find(query)
    .populate('actor', 'name email avatarColor role')
    .populate('project', 'name')
    .populate('task', 'title status')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: activities.length,
    activities,
  });
});

module.exports = { getActivities };
