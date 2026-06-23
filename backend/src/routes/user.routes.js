/**
 * User Routes — /api/user
 */
const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All user routes require auth

router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;