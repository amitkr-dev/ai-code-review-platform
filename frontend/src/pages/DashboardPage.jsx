/**
 * ============================================
 * Dashboard Page — Stats, Charts, Recent Reviews
 * ============================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import {
  LANGUAGES,
  LANGUAGE_COLORS,
  getScoreColor,
  formatDate,
  formatProcessingTime,
} from "../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  HiOutlineCode,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineShieldExclamation,
  HiOutlineArrowRight,
  HiOutlineExclamation,
} from "react-icons/hi";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <HiOutlineExclamation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={fetchStats} className="btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const langData = (stats.languages || []).map((l) => ({
    name: l.language,
    count: l.count,
    avgScore: l.avgScore,
    color: LANGUAGE_COLORS[l.key] || "#6366f1",
  }));

  const trendData = stats.weeklyTrends || [];

  // Stat cards
  const statCards = [
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: HiOutlineCode,
      color:
        "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30",
    },
    {
      label: "Avg. Quality Score",
      value: stats.avgScore,
      icon: HiOutlineStar,
      color:
        "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
      suffix: "/100",
    },
    {
      label: "Languages Used",
      value: stats.languages?.length || 0,
      icon: HiOutlineChartBar,
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Security Issues",
      value: stats.totalSecurityIssues || 0,
      icon: HiOutlineShieldExclamation,
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900  dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your code review analytics at a glance
          </p>
        </div>
        <Link to="/review" className="btn-primary">
          <HiOutlineCode className="w-4 h-4 mr-2" />
          New Review
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, suffix }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900  dark:text-white">
              {value}
              {suffix || ""}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Language breakdown chart */}
        <div className="card p-6">
          <h3 className="section-title">Reviews by Language</h3>
          {langData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={langData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {langData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {langData.map((l) => (
                  <div key={l.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: l.color }}
                    ></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {l.name}:
                    </span>
                    <span className="font-medium text-gray-900  dark:text-white">
                      {l.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">
              No reviews yet. Start by analyzing some code!
            </p>
          )}
        </div>

        {/* Weekly trends chart */}
        <div className="card p-6">
          <h3 className="section-title">Weekly Trends</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reviews"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Reviews"
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">
              No trend data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Language scores bar chart */}
      {langData.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="section-title">Average Score by Language</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={langData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.2}
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <Tooltip />
              <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                {langData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent reviews */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="section-title mb-0">Recent Reviews</h3>
          <Link
            to="/history"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View all <HiOutlineArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats.recentReviews?.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentReviews.map((review) => (
              <Link
                key={review._id}
                to={`/review/${review._id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900  dark:text-white truncate">
                    {review.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {LANGUAGES[review.language]?.label || review.language} •{" "}
                    {review.linesOfCode} lines • {formatDate(review.createdAt)}
                  </p>
                </div>
                <div
                  className={`text-lg font-bold ml-4 ${getScoreColor(review.qualityScore)}`}
                >
                  {review.qualityScore}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <HiOutlineCode className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              No reviews yet
            </p>
            <Link to="/review" className="btn-primary text-sm">
              Start Your First Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
