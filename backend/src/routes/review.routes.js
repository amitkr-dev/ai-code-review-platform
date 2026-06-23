/**
 * Review Routes — /api/reviews
 * All routes require authentication.
 */
const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getReviewById, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All review routes require auth

router.route('/')
  .post(submitReview)
  .get(getReviews);

router.route('/:id')
  .get(getReviewById)
  .delete(deleteReview);

module.exports = router;