/**
 * ============================================
 * Review Result Page — Full AI Output
 * ============================================
 * Displays the complete AI code review with
 * all sections, PDF download, and copy to clipboard.
 */
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import {
  LANGUAGES, SEVERITY_COLORS, getScoreColor, getScoreRingColor, getScoreLabel,
  formatDate, formatProcessingTime, copyToClipboard, reviewToPlainText
} from '../utils/helpers';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import jsPDF from 'jspdf';
import {
  HiOutlineClipboardCopy,
  HiOutlineDownload,
  HiOutlineArrowLeft,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineTag,
  HiOutlineShieldExclamation,
  HiOutlineClock,
  HiOutlineCode,
  HiOutlineStar,
  HiOutlineDocumentText,
} from 'react-icons/hi';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);

export default function ReviewResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resultRef = useRef(null);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const res = await reviewsAPI.getById(id);
      setReview(res.data.data.review);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load review.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = reviewToPlainText(review);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const text = reviewToPlainText(review);
    const doc = new jsPDF();
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(text, 180);
    let y = 15;
    const pageHeight = 280;

    lines.forEach((line) => {
      if (y > pageHeight) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 5;
    });

    doc.save(`${review.title.replace(/\s+/g, '_')}_review.pdf`);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="page-container text-center py-20">
        <HiOutlineExclamation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Review not found'}</p>
        <Link to="/review" className="btn-primary">Start New Review</Link>
      </div>
    );
  }

  const r = review;

  return (
    <div className="page-container animate-fade-in" ref={resultRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900  dark:text-white">{r.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {LANGUAGES[r.language]?.label} • {r.linesOfCode} lines • {formatDate(r.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-secondary text-sm">
            {copied ? <><HiOutlineCheckCircle className="w-4 h-4 mr-1" /> Copied!</> : <><HiOutlineClipboardCopy className="w-4 h-4 mr-1" /> Copy</>}
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary text-sm">
            <HiOutlineDownload className="w-4 h-4 mr-1" /> PDF
          </button>
        </div>
      </div>

      {/* Score & Summary row */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Score circle */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                className={getScoreRingColor(r.qualityScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(r.qualityScore / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(r.qualityScore)}`}>{r.qualityScore}</span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
          <span className={`text-sm font-medium ${getScoreColor(r.qualityScore)}`}>{getScoreLabel(r.qualityScore)}</span>
          <span className="text-xs text-gray-400 mt-1">Quality Score</span>
        </div>

        {/* Summary */}
        <div className="card p-6 md:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900  dark:text-white mb-2">
            <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-primary-500" /> Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.summary}</p>

          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {formatProcessingTime(r.processingTime)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <HiOutlineCode className="w-3.5 h-3.5" />
              {r.linesOfCode} lines
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <HiOutlineExclamation className="w-3.5 h-3.5" />
              {r.bugs?.length || 0} bugs
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <HiOutlineShieldExclamation className="w-3.5 h-3.5" />
              {r.securityIssues?.length || 0} security issues
            </div>
          </div>
        </div>
      </div>

      {/* Functionality explanation */}
      <div className="card p-6 mb-6">
        <h3 className="flex items-center gap-2 section-title">
          <HiOutlineLightBulb className="w-5 h-5 text-yellow-500" /> Functionality Explanation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{r.functionality}</p>
      </div>

      {/* Grid: Bugs, Improvements, Naming */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Bugs */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 section-title">
            <HiOutlineExclamation className="w-5 h-5 text-red-500" /> Bugs ({r.bugs?.length || 0})
          </h3>
          {r.bugs?.length > 0 ? (
            <div className="space-y-3">
              {r.bugs.map((bug, i) => (
                <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${SEVERITY_COLORS[bug.severity]}`}>{bug.severity}</span>
                    {bug.line && bug.line !== 'N/A' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Line {bug.line}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{bug.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No bugs detected! 🎉</p>
          )}
        </div>

        {/* Improvements */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 section-title">
            <HiOutlineLightBulb className="w-5 h-5 text-blue-500" /> Improvements ({r.improvements?.length || 0})
          </h3>
          {r.improvements?.length > 0 ? (
            <div className="space-y-3">
              {r.improvements.map((imp, i) => (
                <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{imp.description}</p>
                  {imp.example && (
                    <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                      <code>{imp.example}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No improvement suggestions — code looks good!</p>
          )}
        </div>
      </div>

      {/* Naming Suggestions */}
      {r.namingSuggestions?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="flex items-center gap-2 section-title">
            <HiOutlineTag className="w-5 h-5 text-purple-500" /> Naming Suggestions ({r.namingSuggestions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Current</th>
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Suggested</th>
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {r.namingSuggestions.map((n, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 font-mono text-red-600 dark:text-red-400">{n.original}</td>
                    <td className="py-2 px-3 font-mono text-green-600 dark:text-green-400">{n.suggested}</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{n.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid: Code Smells, Security */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Code Smells */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 section-title">
            🔥 Code Smells ({r.codeSmells?.length || 0})
          </h3>
          {r.codeSmells?.length > 0 ? (
            <div className="space-y-2">
              {r.codeSmells.map((smell, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 mt-0.5 flex-shrink-0">
                    {smell.type}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{smell.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No code smells detected!</p>
          )}
        </div>

        {/* Security Issues */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 section-title">
            <HiOutlineShieldExclamation className="w-5 h-5 text-red-500" /> Security Issues ({r.securityIssues?.length || 0})
          </h3>
          {r.securityIssues?.length > 0 ? (
            <div className="space-y-3">
              {r.securityIssues.map((sec, i) => (
                <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${SEVERITY_COLORS[sec.severity]}`}>{sec.severity}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{sec.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No security issues found! 🔒</p>
          )}
        </div>
      </div>

      {/* Complexity Analysis */}
      <div className="card p-6 mb-6">
        <h3 className="flex items-center gap-2 section-title">
          <HiOutlineClock className="w-5 h-5 text-green-500" /> Complexity Analysis
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Complexity</p>
            <p className="text-xl font-bold font-mono text-gray-900  dark:text-white">{r.timeComplexity}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Space Complexity</p>
            <p className="text-xl font-bold font-mono text-gray-900  dark:text-white">{r.spaceComplexity}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.complexityExplanation}</p>
      </div>

      {/* Strengths */}
      {r.strengths?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="flex items-center gap-2 section-title">
            <HiOutlineStar className="w-5 h-5 text-yellow-500" /> Strengths
          </h3>
          <ul className="space-y-2">
            {r.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overall Feedback */}
      <div className="card p-6 mb-6">
        <h3 className="flex items-center gap-2 section-title">
          <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-primary-500" /> Overall Feedback
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{r.overallFeedback}</p>
      </div>

      {/* Original Code (collapsible) */}
      <div className="card overflow-hidden mb-6">
        <button
          onClick={() => setShowCode(!showCode)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <HiOutlineCode className="w-4 h-4" /> Original Code
          </span>
          <span className="text-gray-400 text-sm">{showCode ? '▲' : '▼'}</span>
        </button>
        {showCode && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            <SyntaxHighlighter
              language={r.language}
              style={atomOneDark}
              customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}
              showLineNumbers
            >
              {r.code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/review" className="btn-primary">
          🔄 New Review
        </Link>
        <Link to="/history" className="btn-secondary">
          View History
        </Link>
      </div>
    </div>
  );
}