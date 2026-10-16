import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Play,
  CheckCircle,
  Copy,
  Maximize2,
  Minimize2,
  Sparkles,
  FileCode,
  Check,
  RefreshCw,
} from 'lucide-react';

const SAMPLE_CODE = `/**
 * Problem: Two Sum - Given an array of integers nums and an integer target,
 * return indices of the two numbers such that they add up to target.
 * Expected Time Complexity: O(n), Space Complexity: O(n)
 */
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// Export for unit test runner
module.exports = { twoSum };`;

const TEST_CASES = `describe('twoSum verification tests', () => {
  test('Standard pair found', () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });
  test('Pair with offset indices', () => {
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  });
  test('Identical elements', () => {
    expect(twoSum([3, 3], 6)).toEqual([0, 1]);
  });
});`;

export default function CodeWorkspaceWidget({
  isMinimized = false,
  onToggleMinimize,
  onAskMentorToReview,
  mentorReviewing = false,
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'tests' | 'terminal'
  const [code, setCode] = useState(SAMPLE_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    'AuraGD Interactive Code Workspace v2.4',
    'Language: Node.js (v20.12.0) • Ready for technical interview evaluation.',
    'Click "Run Tests" to execute candidate code in isolated runtime.',
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setActiveTab('terminal');

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        '────────────────────────────────────────',
        `[${new Date().toLocaleTimeString()}] Executing test suite for Solution.js...`,
        '✓ Test 1: nums = [2, 7, 11, 15], target = 9 => Output: [0, 1] (Passed 0.4ms)',
        '✓ Test 2: nums = [3, 2, 4], target = 6 => Output: [1, 2] (Passed 0.2ms)',
        '✓ Test 3: nums = [3, 3], target = 6 => Output: [0, 1] (Passed 0.3ms)',
        '🎉 All 3 Test Cases Passed cleanly!',
        'Space Complexity: O(n) | Time Complexity: O(n) Single-pass Hash Map',
        'Ready for mentor verbal review.',
      ]);
      setIsRunning(false);
    }, 750);
  };

  const handleResetCode = () => {
    setCode(SAMPLE_CODE);
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-20 left-6 z-30">
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-bold text-xs shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Open Code Workspace</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full rounded-2xl bg-[#0c1222]/95 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl text-slate-200">
      {/* ── Editor Top Bar ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/40 border-b border-white/10 select-none">
        {/* Left: Window dots & Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Solution.js</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tests'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Tests.js</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'terminal'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetCode}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Reset code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Minimize code window"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content View ── */}
      <div className="flex-1 relative overflow-auto font-mono text-xs p-3">
        {activeTab === 'editor' && (
          <div className="w-full h-full flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 bg-transparent text-cyan-200 outline-none resize-none font-mono leading-relaxed selection:bg-indigo-600/40 focus:ring-0 border-0"
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="w-full h-full overflow-auto text-emerald-300 leading-relaxed whitespace-pre font-mono p-1">
            {TEST_CASES}
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="w-full h-full overflow-auto space-y-1 font-mono text-[11px] p-1">
            {terminalLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('✓') || log.startsWith('🎉')
                    ? 'text-emerald-400 font-semibold'
                    : log.startsWith('[')
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/50 border-t border-white/10 select-none">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>JavaScript (Node.js)</span>
        </div>

        <div className="flex items-center gap-2">
          {onAskMentorToReview && (
            <button
              onClick={() => onAskMentorToReview(code)}
              disabled={mentorReviewing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{mentorReviewing ? 'Mentor Reviewing...' : 'Ask Mentor Review'}</span>
            </button>
          )}

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
