/**
 * ============================================
 * Auth Middleware — JWT Verification
 * ============================================
 * Protects routes by verifying the JWT token
 * from the Authorization header.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Middleware: Require authentication
 * Attaches req.user with the decoded JWT payload + fresh DB user data
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated — no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

module.exports = { protect };