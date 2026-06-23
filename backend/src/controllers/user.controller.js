/**
 * ============================================
 * User Controller — Profile Management
 * ============================================
 * Handles updating user profile info and
 * changing passwords securely.
 */

const { body, validationResult } = require('express-validator');
const User = require('../models/User.model');

/**
 * PUT /api/user/profile
 * Update name, bio, and preferred language.
 */
exports.updateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().trim().isLength({ max: 200 }).withMessage('Bio must be at most 200 characters'),
  body('preferredLanguage').optional().isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Invalid language'),

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

      // Build update object with only provided fields
      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.bio !== undefined) updates.bio = req.body.bio;
      if (req.body.preferredLanguage !== undefined) updates.preferredLanguage = req.body.preferredLanguage;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true } // Return updated doc
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * PUT /api/user/password
 * Change the user's password (requires current password).
 */
exports.changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),

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

      const { currentPassword, newPassword } = req.body;

      // Fetch user WITH password
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password (pre-save hook will hash it)
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];