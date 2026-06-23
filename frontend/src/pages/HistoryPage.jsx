/**
 * ============================================
 * History Page — Search, Filter, Pagination
 * ============================================
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import { LANGUAGES, getScoreColor, formatDate } from '../utils/helpers';
import {
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';

export default function HistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, languageFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (languageFilter) params.language = languageFilter;
      if (search.trim()) params.search = search.trim();

      const res = await reviewsAPI.getAll(params);
      setReviews(res.data.data.reviews);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReviews();
  };

  const handleDelete = async (id) => {
    try {
      await reviewsAPI.delete(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900  dark:text-white">Review History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {pagination.total} total review{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or summary..."
            className="input-field pl-10"
          />
        </form>
        <select
          value={languageFilter}
          onChange={(e) => {
            setLanguageFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="input-field sm:w-48"
        >
          <option value="">All Languages</option>
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-1">Lines</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map(review => (
              <div
                key={review._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors items-center"
              >
                {/* Title */}
                <div className="md:col-span-4">
                  <Link
                    to={`/review/${review._id}`}
                    className="text-sm font-medium text-gray-900  dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {review.title}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate md:hidden">
                    {LANGUAGES[review.language]?.label} • {review.linesOfCode} lines
                  </p>
                </div>

                {/* Language */}
                <div className="md:col-span-2 hidden md:block">
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {LANGUAGES[review.language]?.label || review.language}
                  </span>
                </div>

                {/* Lines */}
                <div className="md:col-span-1 hidden md:block text-sm text-gray-500 dark:text-gray-400">
                  {review.linesOfCode}
                </div>

                {/* Score */}
                <div className="md:col-span-2 hidden md:block">
                  <span className={`text-lg font-bold ${getScoreColor(review.qualityScore)}`}>
                    {review.qualityScore}
                  </span>
                </div>

                {/* Date */}
                <div className="md:col-span-2 hidden md:block text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-center gap-2">
                  <Link
                    to={`/review/${review._id}`}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    View
                  </Link>
                  {deleteConfirm === review._id ? (
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(review._id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete review"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <HiOutlineExclamation className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No reviews found</p>
          {search && <p className="text-gray-400 text-xs mb-4">Try adjusting your search or filter</p>}
          <Link to="/review" className="btn-primary text-sm">Start Your First Review</Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter(page => {
              // Show first, last, and pages near current
              return page === 1 || page === pagination.pages ||
                     Math.abs(page - pagination.page) <= 1;
            })
            .map((page, i, arr) => (
              <span key={page} className="flex items-center">
                {i > 0 && arr[i - 1] !== page - 1 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <button
                  onClick={() => goToPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pagination.page
                      ? 'bg-primary-600 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              </span>
            ))}

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}