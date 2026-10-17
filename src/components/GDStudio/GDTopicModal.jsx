import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Edit3,
  Copy,
  Check,
  Brain,
  Lightbulb,
  Mic,
  PenTool,
  CheckCircle,
} from 'lucide-react';

const AI_SUGGESTED_TOPICS = [
  {
    id: 'gd-ai-healthcare',
    title: 'Artificial Intelligence in Healthcare: Boon or Threat?',
    category: 'Technology & Ethics',
    description: 'Debating diagnostic precision, doctor displacement, data privacy, and ethical accountability in automated medical care.',
    keyPoints: [
      'Early cancer detection and radiological precision save thousands of lives.',
      'Risk of algorithmic bias in patient diagnosis and insurance underwriting.',
      'Human doctor empathy vs robotic decision making.',
    ],
  },
  {
    id: 'gd-ev-vs-hydrogen',
    title: 'Electric Vehicles vs Hydrogen Fuel: Which is the Real Green Future?',
    category: 'Sustainability & Tech',
    description: 'Evaluating lithium mining impact, grid capacity, hydrogen infrastructure, and life-cycle carbon footprint.',
    keyPoints: [
      'EV charging infrastructure is already scaling rapidly across urban centers.',
      'Hydrogen fuel cells offer zero refuel latency for heavy commercial transport.',
      'Battery recycling and environmental toll of lithium extraction.',
    ],
  },
  {
    id: 'gd-wfh-culture',
    title: 'Remote Work vs In-Office Collaboration for Early Career Engineers',
    category: 'Corporate Culture',
    description: 'Assessing mentorship speed, serendipitous innovation, work-life balance, and cross-timezone collaboration.',
    keyPoints: [
      'In-person hallway conversations accelerate onboarding and peer mentorship.',
      'Remote work eliminates burnout commutes and democratizes global hiring.',
      'Hybrid model as a compromise with structured anchor days.',
    ],
  },
  {
    id: 'gd-social-media',
    title: 'Has Social Media Strengthened or Fragmented Human Connection?',
    category: 'Society & Mental Health',
    description: 'Analyzing global awareness, algorithmic polarization, attention spans, and genuine real-world empathy.',
    keyPoints: [
      'Instant global solidarity during international crises and knowledge dissemination.',
      'Dopamine loop optimization fueling teenage anxiety and cognitive echo chambers.',
      'Paradox of hyper-connectivity leading to social isolation.',
    ],
  },
];

export default function GDTopicModal({
  isOpen,
  onClose,
  onSelectTopic,
  currentTopic,
  inviteCode = 'GD-741-KLP',
  onCopyInviteCode,
  codeCopied = false,
}) {
  const [topicMode, setTopicMode] = useState('ai'); // 'ai' | 'custom'
  const [selectedAiTopicIndex, setSelectedAiTopicIndex] = useState(0);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customTopicDescription, setCustomTopicDescription] = useState('');

  if (!isOpen) return null;

  const handleStartSession = () => {
    if (topicMode === 'ai') {
      const chosen = AI_SUGGESTED_TOPICS[selectedAiTopicIndex];
      onSelectTopic(chosen);
    } else {
      const customTopic = {
        id: `gd-custom-${Date.now()}`,
        title: customTopicTitle.trim() || 'Custom Group Discussion Topic',
        category: 'Student Custom Motion',
        description: customTopicDescription.trim() || 'Open floor technical and collaborative debate.',
        keyPoints: [
          'Opening statements: Define scope and operational definitions.',
          'Core arguments with empirical evidence and counter-arguments.',
          'Closing synthesis: Formulating a shared consensus or roadmap.',
        ],
      };
      onSelectTopic(customTopic);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      {/* ── Modal Container matching exact screenshot ── */}
      <div className="relative w-full max-w-lg bg-[#181d29]/95 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5">
        {/* Header: Title and Close (X) */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            GD Topic Selection
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Two Topic Choice Cards Grid ── */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {/* Card 1: AI Suggested Topic */}
          <div
            onClick={() => setTopicMode('ai')}
            className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 ${
              topicMode === 'ai'
                ? 'border-blue-500 bg-blue-950/35 shadow-lg shadow-blue-500/20 scale-[1.02]'
                : 'border-blue-500/40 bg-blue-950/15 hover:border-blue-400/80 hover:bg-blue-950/25'
            }`}
          >
            {/* Brain & Lightbulb Graphic */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-yellow-500/20 flex items-center justify-center relative mb-2.5">
              <span className="text-2xl">🧠</span>
              <span className="text-xl -ml-2 -mt-2">💡</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              AI Suggested Topic
            </span>
          </div>

          {/* Card 2: Custom Student Topic */}
          <div
            onClick={() => setTopicMode('custom')}
            className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 ${
              topicMode === 'custom'
                ? 'border-purple-500 bg-purple-950/35 shadow-lg shadow-purple-500/20 scale-[1.02]'
                : 'border-purple-500/40 bg-purple-950/15 hover:border-purple-400/80 hover:bg-purple-950/25'
            }`}
          >
            {/* Pencil & Mic Graphic */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-blue-500/20 flex items-center justify-center relative mb-2.5">
              <span className="text-2xl">✏️</span>
              <span className="text-xl -ml-1 -mt-1 text-cyan-400">🎙️</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Custom Student Topic
            </span>
          </div>
        </div>

        {/* ── Active Selection Form ── */}
        {topicMode === 'ai' ? (
          <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="uppercase font-bold text-cyan-400">Trending Placement Topic:</span>
              <button
                onClick={() =>
                  setSelectedAiTopicIndex((prev) => (prev + 1) % AI_SUGGESTED_TOPICS.length)
                }
                className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
              >
                Next Topic ➔
              </button>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
              "{AI_SUGGESTED_TOPICS[selectedAiTopicIndex].title}"
            </p>
            <span className="inline-block text-[10px] font-semibold text-blue-300 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800/40">
              {AI_SUGGESTED_TOPICS[selectedAiTopicIndex].category}
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-purple-900/40 space-y-2.5">
            <input
              type="text"
              value={customTopicTitle}
              onChange={(e) => setCustomTopicTitle(e.target.value)}
              placeholder="Enter your custom GD motion or topic..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              value={customTopicDescription}
              onChange={(e) => setCustomTopicDescription(e.target.value)}
              placeholder="Brief context or key debate question..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        )}

        {/* ── Student Invite Code Box (Matching Screenshot) ── */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-slate-300 block">
            Student Invite Code:
          </label>

          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0f1422] border border-white/15 shadow-inner">
            <span className="font-mono text-sm sm:text-base font-bold text-cyan-300 tracking-wider">
              {inviteCode}
            </span>

            <button
              onClick={onCopyInviteCode}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                codeCopied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#232938] hover:bg-[#2d3546] text-slate-200 border-white/10 shadow-sm'
              }`}
              title="Copy Room Invite Code"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{codeCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Invite students to join the session using this code.
          </p>
        </div>

        {/* ── Bottom Action Buttons (Matching Screenshot) ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
          >
            Cancel
          </button>

          <button
            onClick={handleStartSession}
            className="px-6 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
