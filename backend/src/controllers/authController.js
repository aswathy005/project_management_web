const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/tokenUtils');
const { logActivity } = require('../utils/activityLogger');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  jobTitle: user.jobTitle,
  department: user.department,
  phone: user.phone,
  bio: user.bio,
  avatarColor: user.avatarColor,
  preferences: user.preferences,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, jobTitle, department } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Allow role selection during registration for demo/test flexibility, defaulting to Team Member
  const allowedRoles = ['Admin', 'Project Manager', 'Team Member'];
  const assignedRole = allowedRoles.includes(role) ? role : 'Team Member';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    jobTitle: jobTitle || (assignedRole === 'Project Manager' ? 'Project Manager' : 'Software Engineer'),
    department: department || 'Engineering',
  });

  await logActivity({
    actor: user._id,
    action: 'user_registered',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} joined ProTrack as ${user.role}`,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: sanitizeUser(user),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact an administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    token,
    user: sanitizeUser(user),
  });
});

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

// @desc    Update current user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, jobTitle, department, phone, bio, avatarColor, preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (name !== undefined) user.name = name;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (department !== undefined) user.department = department;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (avatarColor !== undefined) user.avatarColor = avatarColor;
  if (preferences !== undefined) {
    user.preferences = {
      ...user.preferences.toObject(),
      ...preferences,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: sanitizeUser(user),
  });
});

// @desc    Change current user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
