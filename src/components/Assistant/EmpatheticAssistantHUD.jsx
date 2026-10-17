import React, { useState } from 'react';
import {
  Brain,
  Heart,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Smile,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';

/**
 * EmpatheticAssistantHUD
 *
 * Visual Interface for:
 * 1. Emotional Intelligence Telemetry (Real-time stress, sentiment, and empathy tone)
 * 2. Deep Thought & Reasoning Drawer (Shows AI's step-by-step thinking process)
 * 3. Live Spoken Subtitles & Speech Waves
 */
export default function EmpatheticAssistantHUD({
  assistantState = 'listening', // 'listening' | 'thinking' | 'speaking'
  thoughtProcess = '',
  spokenResponse = '',
  userTranscript = '',
  interimTranscript = '',
  emotionalState = { primaryEmotion: 'neutral', stressScore: 18 },
  mentorName = 'Dr. Ann Vance',
  onSendPresetMessage,
}) {
  const [showThoughtDrawer, setShowThoughtDrawer] = useState(false);

  const isThinking = assistantState === 'thinking';
  const isSpeaking = assistantState === 'speaking';
  const isListening = assistantState === 'listening';

  // Emotion-based Badge Styles & Colors
  const getEmotionBadge = () => {
    switch (emotionalState.primaryEmotion) {
      case 'anxious':
        return {
          label: 'Anxiety Detected',
          color: 'text-amber-300',
          bg: 'bg-amber-950/80 border-amber-500/50',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          advice: 'Soothing Pacing • Reassuring Support',
        };
      case 'sad':
        return {
          label: 'Vulnerability Detected',
          color: 'text-sky-300',
          bg: 'bg-sky-950/80 border-sky-500/50',
          icon: <Heart className="w-3.5 h-3.5 text-sky-400" />,
          advice: 'Emotional Validation • Safe Space',
        };
      case 'frustrated':
        return {
          label: 'Roadblock Detected',
          color: 'text-orange-300',
          bg: 'bg-orange-950/80 border-orange-500/50',
          icon: <Activity className="w-3.5 h-3.5 text-orange-400" />,
          advice: 'De-escalation • Step-by-Step Clarity',
        };
      case 'confident':
        return {
          label: 'Confidence & Flow',
          color: 'text-emerald-300',
          bg: 'bg-emerald-950/80 border-emerald-500/50',
          icon: <Smile className="w-3.5 h-3.5 text-emerald-400" />,
          advice: 'Empowering Momentum • Deep Dive',
        };
      default:
        return {
          label: 'Empathetic Presence',
          color: 'text-teal-300',
          bg: 'bg-slate-900/85 border-teal-500/40',
          icon: <Heart className="w-3.5 h-3.5 text-teal-400" />,
          advice: 'Active Listening • Reassuring Atmosphere',
        };
    }
  };

  const badge = getEmotionBadge();

  return (
    <div className="w-full flex flex-col items-center gap-3 select-none pointer-events-auto">
      {/* ── 1. Top Emotional Intelligence & Thought Status Bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-xl shadow-2xl">
        {/* Real-time Emotional Intelligence Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
          {badge.icon}
          <span className={badge.color}>{badge.label}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            (Stress: {emotionalState.stressScore}%)
          </span>
        </div>

        {/* Empathy Directive Tone */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-300 font-medium">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{badge.advice}</span>
        </div>

        {/* Step-by-Step Thought & Reasoning Toggle Button */}
        {thoughtProcess && (
          <button
            onClick={() => setShowThoughtDrawer((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-all hover:scale-105 cursor-pointer shadow-md"
            title="Inspect AI Mentor's Internal Reasoning Process"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Mentor's Reasoning</span>
            {showThoughtDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* ── 2. Expandable Deep Thought & Reasoning Process Drawer ── */}
      {showThoughtDrawer && thoughtProcess && (
        <div className="w-full max-w-xl p-4 rounded-3xl bg-slate-950/95 border border-indigo-500/40 backdrop-blur-2xl shadow-2xl text-left animate-fade-in space-y-2.5">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-900/60 text-indigo-300">
                <Brain className="w-4 h-4 text-indigo-400" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Dr. Ann Vance • Deep Reasoning & Empathy Chain
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400/80 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Thought Engine Active
            </span>
          </div>

          <div className="text-xs text-indigo-100 font-mono leading-relaxed whitespace-pre-wrap bg-black/50 p-3 rounded-2xl border border-white/5 max-h-48 overflow-y-auto">
            {thoughtProcess}
          </div>
        </div>
      )}

      {/* ── 3. Live Spoken Subtitle Overlay ── */}
      {isSpeaking && spokenResponse && (
        <div className="w-full max-w-2xl px-6 py-3.5 rounded-3xl bg-black/85 border border-cyan-400/40 backdrop-blur-xl shadow-2xl text-center animate-fade-in">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">
              {mentorName} Speaking (Empathetic Voice)
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
            "{spokenResponse}"
          </p>
        </div>
      )}

      {/* ── 4. Thinking State Indicator ── */}
      {isThinking && (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/90 border border-teal-500/40 backdrop-blur-md shadow-xl text-teal-300 text-xs font-bold animate-pulse">
          <Brain className="w-4 h-4 text-teal-400 animate-spin" />
          <span>Understanding your response and reasoning thoughtfully...</span>
        </div>
      )}

      {/* ── 5. User Speaking / Interim Transcript Live Preview ── */}
      {(interimTranscript || (isListening && userTranscript)) && (
        <div className="px-4 py-2 rounded-2xl bg-black/70 border border-emerald-500/30 backdrop-blur-md text-xs font-medium text-emerald-200 animate-fade-in max-w-lg text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
            Your Voice (Live Transcript):
          </span>
          <span>"{interimTranscript || userTranscript}"</span>
        </div>
      )}

      {/* ── 6. Helpful Conversational Quick Prompts ── */}
      {onSendPresetMessage && isListening && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 opacity-90 hover:opacity-100 transition-opacity">
          {[
            { label: '💭 "I feel nervous about system design"', text: 'I am feeling quite nervous about answering system design questions. How should I structure my thinking?' },
            { label: '🌿 "I made a mistake, feeling stuck"', text: 'I feel like I made a mistake in my logic and I am getting stuck. Can you guide me gently?' },
            { label: '✨ "I solved it, how can I scale?"', text: 'I found an optimal O(n) solution using a hash map! How would you scale this for high concurrency?' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSendPresetMessage(chip.text)}
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800/90 border border-white/10 hover:border-teal-400/40 px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
