/**
 * ============================================
 * Dashboard Controller — Aggregated Statistics
 * ============================================
 * Provides summary stats, language breakdown,
 * and weekly trend data for the dashboard.
 */

const Review = require('../models/Review.model');

/**
 * GET /api/dashboard/stats
 * Returns all data needed to populate the dashboard.
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Run all aggregation queries in parallel for speed
    const [
      totalReviews,
      avgScoreResult,
      languageBreakdown,
      weeklyTrends,
      recentReviews,
      bugStats,
      securityStats
    ] = await Promise.all([
      // 1. Total completed reviews
      Review.countDocuments({ user: userId, status: 'completed' }),

      // 2. Average quality score
      Review.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$qualityScore' } } }
      ]),

      // 3. Reviews per language
      Review.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: '$language', count: { $sum: 1 }, avgScore: { $avg: '$qualityScore' } } },
        { $sort: { count: -1 } }
      ]),

      // 4. Weekly review trends (last 8 weeks)
      getWeeklyTrends(userId),

      // 5. 5 most recent reviews
      Review.find({ user: userId, status: 'completed' })
        .select('title language qualityScore createdAt linesOfCode')
        .sort({ createdAt: -1 })
        .limit(5),

      // 6. Bug severity distribution
      Review.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $unwind: '$bugs' },
        { $group: { _id: '$bugs.severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // 7. Security issue count
      Review.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $unwind: { path: '$securityIssues', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: 1 } } }
      ])
    ]);

    // Format language breakdown for charts
    const languageLabels = { javascript: 'JavaScript', python: 'Python', java: 'Java', cpp: 'C++' };
    const languages = languageBreakdown.map(l => ({
      language: languageLabels[l._id] || l._id,
      key: l._id,
      count: l.count,
      avgScore: Math.round(l.avgScore)
    }));

    // Format weekly trends
    const weeks = weeklyTrends.map(w => ({
      week: w.label,
      reviews: w.count,
      avgScore: Math.round(w.avgScore)
    }));

    // Count total security issues
    const totalSecurityIssues = securityStats.length > 0 ? securityStats[0].total : 0;

    res.json({
      success: true,
      data: {
        totalReviews,
        avgScore: avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0,
        languages,
        weeklyTrends: weeks,
        recentReviews,
        bugStats,
        totalSecurityIssues
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Get review counts and avg scores for the last 8 weeks.
 * Uses a pipeline that groups by week buckets.
 */
async function getWeeklyTrends(userId) {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const results = await Review.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed',
        createdAt: { $gte: eightWeeksAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$qualityScore' },
        oldest: { $min: '$createdAt' }
      }
    },
    { $sort: { oldest: 1 } },
    { $limit: 8 }
  ]);

  // Format week labels
  return results.map(r => {
    const date = new Date(r.oldest);
    const label = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return { label, count: r.count, avgScore: r.avgScore || 0 };
  });
}