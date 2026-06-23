/**
 * ============================================
 * Login Page
 * ============================================
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function LoginPage() {
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-16">
            <span className="text-3xl">🤖</span>
            <span className="font-bold text-xl">CodeReview AI</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Welcome back.<br />Your code is waiting.
          </h1>
          <p className="text-primary-100 text-lg">
            Sign in to continue analyzing code with AI-powered insights.
          </p>
        </div>
        <p className="text-primary-200 text-sm">
          Built with React, Node.js, MongoDB & Google Gemini
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-lg text-gray-900  dark:text-white">CodeReview AI</span>
            </div>
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
              {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900  dark:text-white mb-2">Sign in</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Create one
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}