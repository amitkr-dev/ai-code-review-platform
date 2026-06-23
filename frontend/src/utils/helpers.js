/**
 * ============================================
 * Helper Utilities
 * ============================================
 * Shared functions for formatting, colors,
 * and common UI operations.
 */

/** Language display names and file extensions */
export const LANGUAGES = {
    javascript: { label: 'JavaScript', extension: '.js', syntax: 'javascript' },
    python: { label: 'Python', extension: '.py', syntax: 'python' },
    java: { label: 'Java', extension: '.java', syntax: 'java' },
    cpp: { label: 'C++', extension: '.cpp', syntax: 'cpp' }
  };
  
  /** Color mapping for severity levels */
  export const SEVERITY_COLORS = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };
  
  /** Color mapping for quality score ranges */
  export function getScoreColor(score) {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }
  
  /** Score ring color classes */
  export function getScoreRingColor(score) {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  }
  
  /** Get score label */
  export function getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  }
  
  /** Language chart colors */
  export const LANGUAGE_COLORS = {
    javascript: '#f7df1e',
    python: '#3776ab',
    java: '#ed8b00',
    cpp: '#00599c'
  };
  
  /** Format date to readable string */
  export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /** Format processing time */
  export function formatProcessingTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
  
  /** Truncate text */
  export function truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  /** Copy text to clipboard with feedback */
  export async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }
  
  /** Generate a plain-text version of a review for clipboard/PDF */
  export function reviewToPlainText(review) {
    let text = `CODE REVIEW REPORT\n${'='.repeat(50)}\n\n`;
    text += `Title: ${review.title}\n`;
    text += `Language: ${LANGUAGES[review.language]?.label || review.language}\n`;
    text += `Date: ${formatDate(review.createdAt)}\n`;
    text += `Quality Score: ${review.qualityScore}/100 (${getScoreLabel(review.qualityScore)})\n`;
    text += `Lines of Code: ${review.linesOfCode}\n`;
    text += `Processing Time: ${formatProcessingTime(review.processingTime)}\n\n`;
  
    text += `SUMMARY\n${'-'.repeat(30)}\n${review.summary}\n\n`;
    text += `FUNCTIONALITY\n${'-'.repeat(30)}\n${review.functionality}\n\n`;
  
    if (review.bugs?.length > 0) {
      text += `BUGS (${review.bugs.length})\n${'-'.repeat(30)}\n`;
      review.bugs.forEach((b, i) => {
        text += `${i + 1}. [${b.severity.toUpperCase()}] Line ${b.line}: ${b.description}\n`;
      });
      text += '\n';
    }
  
    if (review.improvements?.length > 0) {
      text += `IMPROVEMENTS (${review.improvements.length})\n${'-'.repeat(30)}\n`;
      review.improvements.forEach((imp, i) => {
        text += `${i + 1}. ${imp.description}\n`;
        if (imp.example) text += `   Example: ${imp.example}\n`;
      });
      text += '\n';
    }
  
    if (review.namingSuggestions?.length > 0) {
      text += `NAMING SUGGESTIONS (${review.namingSuggestions.length})\n${'-'.repeat(30)}\n`;
      review.namingSuggestions.forEach((n, i) => {
        text += `${i + 1}. "${n.original}" → "${n.suggested}" — ${n.reason}\n`;
      });
      text += '\n';
    }
  
    if (review.codeSmells?.length > 0) {
      text += `CODE SMELLS (${review.codeSmells.length})\n${'-'.repeat(30)}\n`;
      review.codeSmells.forEach((c, i) => {
        text += `${i + 1}. [${c.type}] ${c.description}\n`;
      });
      text += '\n';
    }
  
    if (review.securityIssues?.length > 0) {
      text += `SECURITY ISSUES (${review.securityIssues.length})\n${'-'.repeat(30)}\n`;
      review.securityIssues.forEach((s, i) => {
        text += `${i + 1}. [${s.severity.toUpperCase()}] ${s.description}\n`;
      });
      text += '\n';
    }
  
    text += `COMPLEXITY\n${'-'.repeat(30)}\n`;
    text += `Time: ${review.timeComplexity}\n`;
    text += `Space: ${review.spaceComplexity}\n`;
    text += `${review.complexityExplanation}\n\n`;
  
    if (review.strengths?.length > 0) {
      text += `STRENGTHS\n${'-'.repeat(30)}\n`;
      review.strengths.forEach((s, i) => text += `${i + 1}. ${s}\n`);
      text += '\n';
    }
  
    text += `OVERALL FEEDBACK\n${'-'.repeat(30)}\n${review.overallFeedback}\n`;
  
    return text;
  }