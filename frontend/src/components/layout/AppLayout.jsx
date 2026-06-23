/**
 * ============================================
 * App Layout — Sidebar Navigation Shell
 * ============================================
 * Provides the main app structure with a
 * responsive sidebar, header, and content area.
 */

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  HiOutlineHome,
  HiOutlineCode,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { to: "/review", label: "New Review", icon: HiOutlineCode },
  { to: "/history", label: "History", icon: HiOutlineClock },
  { to: "/profile", label: "Profile", icon: HiOutlineUser },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-lg text-gray-900  dark:text-white">
              CodeReview AI
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          {/* User info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900  dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <HiOutlineSun className="w-4 h-4" />
              ) : (
                <HiOutlineMoon className="w-4 h-4" />
              )}
              {darkMode ? "Light" : "Dark"}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-gray-900  dark:text-white">
              CodeReview AI
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {darkMode ? (
              <HiOutlineSun className="w-5 h-5" />
            ) : (
              <HiOutlineMoon className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
