/**
 * ============================================
 * Review Model — Mongoose Schema
 * ============================================
 * Stores AI analysis results including bugs,
 * improvements, complexity, and quality score.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Optimized for user-based queries
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title must be at most 100 characters']
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    required: [true, 'Language is required']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [50000, 'Code is too long (max 50,000 characters)']
  },
  fileName: {
    type: String,
    trim: true
  },

  /* ---------- AI Analysis Results ---------- */
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  functionality: {
    type: String,
    default: ''
  },
  bugs: [{
    description: String,
    line: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  improvements: [{
    description: String,
    example: String
  }],
  namingSuggestions: [{
    original: String,
    suggested: String,
    reason: String
  }],
  codeSmells: [{
    description: String,
    type: String
  }],
  securityIssues: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  timeComplexity: {
    type: String,
    default: 'N/A'
  },
  spaceComplexity: {
    type: String,
    default: 'N/A'
  },
  complexityExplanation: {
    type: String,
    default: ''
  },
  strengths: [{
    type: String
  }],
  overallFeedback: {
    type: String,
    default: ''
  },

  /* ---------- Metadata ---------- */
  processingTime: {
    type: Number, // Milliseconds
    default: 0
  },
  linesOfCode: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for efficient history queries
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ user: 1, language: 1 });

console.log(
  "CODE SMELLS SCHEMA:",
  reviewSchema.path("codeSmells")
);

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);