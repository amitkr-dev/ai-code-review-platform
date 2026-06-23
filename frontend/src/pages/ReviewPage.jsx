/**
 * ============================================
 * Review Page — Code Editor & Submission
 * ============================================
 * Allows users to paste code, select a language,
 * upload files, and submit for AI review.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import { LANGUAGES } from '../utils/helpers';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);

const SAMPLE_CODE = {
  javascript: `function bubbleSort(arr) {
  var n = arr.length;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        var temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

function findMax(arr) {
  var m = arr[0];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > m) {
      m = arr[i];
    }
  }
  return m;
}

var data = [64, 34, 25, 12, 22, 11, 90];
console.log(bubbleSort(data));
console.log(findMax(data));`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def find_max(arr):
    m = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > m:
            m = arr[i]
    return m

data = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(data))
print(find_max(data))`,
  java: `public class Sorting {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    public static int findMax(int[] arr) {
        int m = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > m) {
                m = arr[i];
            }
        }
        return m;
    }

    public static void main(String[] args) {
        int[] data = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(data);
        System.out.println(findMax(data));
    }
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int findMax(vector<int>& arr) {
    int m = arr[0];
    for (int i = 1; i < arr.size(); i++) {
        if (arr[i] > m) {
            m = arr[i];
        }
    }
    return m;
}

int main() {
    vector<int> data = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(data);
    cout << findMax(data) << endl;
    return 0;
}`
};

export default function ReviewPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Auto-detect from file extension
    if (fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      const langMap = { js: 'javascript', py: 'python', java: 'java', cpp: 'cpp' };
      if (langMap[ext]) setLanguage(langMap[ext]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['js', 'py', 'java', 'cpp'];
    if (!validExts.includes(ext)) {
      setError('Invalid file type. Please upload .js, .py, .java, or .cpp files.');
      return;
    }

    if (file.size > 50000) {
      setError('File too large. Maximum size is 50KB.');
      return;
    }

    setError('');
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));

    const langMap = { js: 'javascript', py: 'python', java: 'java', cpp: 'cpp' };
    setLanguage(langMap[ext] || 'javascript');

    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target.result);
    reader.readAsText(file);
  };

  const loadSample = () => {
    setCode(SAMPLE_CODE[language]);
    if (!title) setTitle(`${language} Sample Code`);
    setFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 10) {
      setError('Please enter at least 10 characters of code.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for this review.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await reviewsAPI.submit({
        title: title.trim(),
        language,
        code: code.trim(),
        fileName: fileName || null
      });
      navigate(`/review/${res.data.data.review._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit code for review.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const lines = code.split('\n').length;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900  dark:text-white">New Code Review</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Paste your code or upload a file for AI analysis</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Language row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Review Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sorting Algorithm Review"
              className="input-field"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="input-field"
            >
              {Object.entries(LANGUAGES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadSample}
            className="btn-secondary text-sm"
          >
            Load Sample Code
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-sm"
          >
            📁 Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.py,.java,.cpp"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileName && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              📄 {fileName}
            </span>
          )}
          <span className="text-sm text-gray-400 ml-auto">
            {lines} lines
          </span>
        </div>

        {/* Code editor area */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            spellCheck={false}
            className="w-full h-96 font-mono text-sm bg-gray-900 text-gray-100 rounded-xl p-4 border-2 border-gray-700 focus:border-primary-500 focus:outline-none resize-y"
            style={{ tabSize: 2 }}
          />
          {/* Syntax preview toggle */}
          {code && (
            <button
              type="button"
              onClick={() => {
                // Simple toggle between textarea and preview
                const ta = document.querySelector('textarea');
                const preview = document.getElementById('syntax-preview');
                if (preview) {
                  preview.classList.toggle('hidden');
                  ta.classList.toggle('hidden');
                }
              }}
              className="absolute top-3 right-3 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded hover:text-gray-900 dark:text-white transition-colors"
            >
              Preview
            </button>
          )}
          <div id="syntax-preview" className="hidden absolute inset-0 overflow-auto rounded-xl">
            <SyntaxHighlighter
              language={language}
              style={atomOneDark}
              customStyle={{
                margin: 0,
                borderRadius: '0.75rem',
                height: '100%',
                fontSize: '0.875rem'
              }}
              showLineNumbers
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="btn-primary px-8 py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Analyzing with AI...
              </span>
            ) : (
              '🔍 Analyze Code'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}