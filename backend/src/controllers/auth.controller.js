/**
 * ============================================
 * Auth Controller — Registration & Login
 * ============================================
 * Handles user signup, login, and fetching
 * the currently authenticated user.
 */

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.model');

/**
 * Generate a signed JWT token for a user.
 * @param {string} id - User's MongoDB _id
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

/**
 * POST /api/auth/register
 * Register a new user account.
 */
exports.register = [
  // Input validation rules
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(e => e.msg)
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      // Create user (password is auto-hashed by pre-save hook)
      const user = await User.create({ name, email, password });

      // Generate token and respond
      const token = signToken(user._id);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            preferredLanguage: user.preferredLanguage
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * POST /api/auth/login
 * Authenticate user and return JWT.
 */
exports.login = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(e => e.msg)
        });
      }

      const { email, password } = req.body;

      // Fetch user WITH password (select is false by default in schema)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = signToken(user._id);
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            preferredLanguage: user.preferredLanguage,
            totalReviews: user.totalReviews
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};