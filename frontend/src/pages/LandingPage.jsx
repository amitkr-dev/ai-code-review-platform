/**
 * ============================================
 * Landing Page — Hero, Features, CTA
 * ============================================
 * Public-facing marketing page with project
 * description and call-to-action buttons.
 */

import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineCode,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineClock,
  HiOutlineDocumentText,
} from "react-icons/hi";

const FEATURES = [
  {
    icon: HiOutlineShieldCheck,
    title: "Bug Detection",
    description:
      "Identifies bugs with severity ratings and exact line numbers for quick fixes.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Security Scanning",
    description:
      "Detects SQL injection, XSS, data exposure, and other vulnerabilities.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Complexity Analysis",
    description: "Big O time and space complexity with detailed explanations.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Smart Suggestions",
    description:
      "Actionable improvements with code examples and naming recommendations.",
  },
  {
    icon: HiOutlineCode,
    title: "Code Smell Detection",
    description:
      "Finds anti-patterns like magic numbers, deep nesting, and duplication.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "PDF Reports",
    description:
      "Download comprehensive review reports as PDF for documentation.",
  },
];

const STATS = [
  { value: "4", label: "Languages" },
  { value: "10+", label: "Analysis Types" },
  { value: "<15s", label: "Review Time" },
  { value: "0-100", label: "Quality Score" },
];

export default function LandingPage() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-lg text-gray-900  dark:text-white">
                CodeReview AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? (
                  <HiOutlineSun className="w-5 h-5" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5" />
                )}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors"
              >
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
            <HiOutlineLightningBolt className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Intelligent Code Review
            <span className="block text-blue-600">in Seconds</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Paste your code and get instant AI-powered analysis — bug detection,
            security scanning, complexity analysis, and actionable improvement
            suggestions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Start Reviewing Code — Free
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 bg-gray-100 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900  dark:text-white">
                  {value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900  dark:text-white mb-4">
              Everything You Need for Code Quality
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI analyzes your code across multiple dimensions to provide
              comprehensive, actionable feedback.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="card p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900  dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* How it works */}
      <section className="py-20 bg-gray-900 border-y border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-300">
              Review your code in four simple steps.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Paste or Upload Code",
                desc: "Type your code directly or upload .js, .py, .java, or .cpp files.",
              },
              {
                step: "2",
                title: "Select Language",
                desc: "Choose from JavaScript, Python, Java, or C++ for optimized analysis.",
              },
              {
                step: "3",
                title: "Get AI Review",
                desc: "Gemini AI analyzes your code and returns a detailed review in seconds.",
              },
              {
                step: "4",
                title: "Download Report",
                desc: "Export your review as PDF or copy it to clipboard for sharing.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-4 p-5 rounded-xl bg-gray-800 border border-gray-700"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {step}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>

                  <p className="mt-1 text-gray-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900  dark:text-white mb-4">
            Ready to Improve Your Code?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join now and start getting AI-powered code reviews instantly. No
            credit card required.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <span>🤖</span>
            <span>
              CodeReview AI — Built with React, Node.js, MongoDB & Gemini
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
