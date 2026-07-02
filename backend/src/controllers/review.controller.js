/**
 * ============================================
 * Review Controller — Code Review CRUD
 * ============================================
 * Handles submitting code for AI review,
 * fetching reviews, and deleting reviews.
 */

const { body, query, validationResult } = require("express-validator");
const Review = require("../models/Review.model");
console.log(
  "RUNTIME SCHEMA:",
  Review.schema.path("codeSmells")
);
const User = require("../models/User.model");
const { analyzeCode, streamReview } = require("../utils/groq.service");

/**
 * POST /api/reviews
 * Submit code for AI analysis and store results.
 */
exports.submitReview = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title is required (1-100 chars)"),
  body("language")
    .isIn(["javascript", "python", "java", "cpp"])
    .withMessage("Invalid language"),
  body("code")
    .trim()
    .isLength({ min: 10, max: 50000 })
    .withMessage("Code must be 10-50,000 characters"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { title, language, code, fileName } = req.body;
      const startTime = Date.now();

      // Count lines of code
      const linesOfCode = code
        .split("\n")
        .filter((l) => l.trim().length > 0).length;

      // Create review record in 'pending' state
      const review = await Review.create({
        user: req.user.id,
        title,
        language,
        code,
        fileName: fileName || null,
        linesOfCode,
        status: "pending",
      });

      try {
        // Call Groq AI for analysis
        const analysis = await analyzeCode(code, language);
        const processingTime = Date.now() - startTime;

        // Update review with AI results
        review.qualityScore = analysis.qualityScore;
        review.summary = analysis.summary;
        review.functionality = analysis.functionality;
        review.bugs = analysis.bugs;
        review.improvements = analysis.improvements;
        review.namingSuggestions = analysis.namingSuggestions;
        console.log("================================");
        console.log("TYPE:", typeof analysis.codeSmells);
        console.log("VALUE:", analysis.codeSmells);
        console.log("================================");

        review.codeSmells = analysis.codeSmells || [];
        review.securityIssues = analysis.securityIssues;
        review.timeComplexity = analysis.timeComplexity;
        review.spaceComplexity = analysis.spaceComplexity;
        review.complexityExplanation = analysis.complexityExplanation;
        review.strengths = analysis.strengths;
        review.overallFeedback = analysis.overallFeedback;
        review.processingTime = processingTime;
        review.status = "completed";

        await review.save();

        // Increment user's total review count
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { totalReviews: 1 },
        });

        res.json({
          success: true,
          message: "Code review completed successfully",
          data: { review },
        });
      } catch (aiError) {
        // Mark review as failed if AI analysis errors out
        review.status = "failed";
        review.processingTime = Date.now() - startTime;
        await review.save();
        next(aiError);
      }
    } catch (error) {
      next(error);
    }
  },
];

/**
 * GET /api/reviews
 * List reviews for the authenticated user with pagination, search, and filter.
 */
exports.getReviews = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be 1-50"),
  query("language")
    .optional()
    .isIn(["javascript", "python", "java", "cpp"])
    .withMessage("Invalid language filter"),
  query("search").optional().trim(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array().map((e) => e.msg),
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter = { user: req.user.id, status: "completed" };

      if (req.query.language) {
        filter.language = req.query.language;
      }

      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: "i" } },
          { summary: { $regex: req.query.search, $options: "i" } },
        ];
      }

      // Execute parallel queries for efficiency
      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .select("-code") // Exclude code from list for performance
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Review.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * GET /api/reviews/:id
 * Fetch a single review with full details (includes code).
 */
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id, // Ensure user owns this review
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review (user can only delete their own).
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Decrement user's total review count
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalReviews: -1 } });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


