import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import FemaleMentor3DAvatar from '../Mentorship/FemaleMentor3DAvatar';
import { Sparkles, Bot, ShieldCheck } from 'lucide-react';

/**
 * HeyGenMentorAvatar (Now powered by standalone 3D FemaleMentor3DAvatar)
 *
 * Standalone, Reliable 3D Photorealistic Female Mentor:
 * - Powered by Three.js, @react-three/fiber, and @react-three/drei
 * - Uses Ready Player Me female .glb model with 15 Oculus facial visemes & morph targets
 * - Natural breathing, attentive listening head movements, and synchronized lip-sync
 * - Completely eliminates black screens and paid video API failures
 */
const HeyGenMentorAvatar = forwardRef(function HeyGenMentorAvatar(
  {
    isSpeaking = false,
    isListening = false,
    isThinking = false,
    isConcluding = false,
    mode = 'presentation',
    onSpeechStart,
    onSpeechEnd,
    mentorName = 'Dr. Ann Vance',
  },
  ref
) {
  // ── Imperative Speak and Interrupt Methods for App.jsx ──
  useImperativeHandle(
    ref,
    () => ({
      speak: (text, onComplete) => {
        if (!text) return;

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Zira'))
          );
          if (femaleVoice) utterance.voice = femaleVoice;

          utterance.onstart = () => {
            onSpeechStart?.();
          };
          utterance.onend = () => {
            onSpeechEnd?.();
            onComplete?.();
          };
          utterance.onerror = () => {
            onSpeechEnd?.();
            onComplete?.();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          onSpeechStart?.();
          setTimeout(() => {
            onSpeechEnd?.();
            onComplete?.();
          }, Math.max(2500, (text.split(' ').length / 2.8) * 1000));
        }
      },

      interrupt: () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onSpeechEnd?.();
      },

      reconnect: () => {},
    }),
    [onSpeechStart, onSpeechEnd]
  );

  return (
    <div className="relative w-full h-full bg-[#080d1a] overflow-hidden select-none flex items-center justify-center">
      {/* ── Studio Ambient Rim Glows ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-16 -right-16 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/4 -left-16 w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(30,41,59,0.3)_0%,rgba(8,13,26,0.98)_100%)]" />
      </div>

      {/* ── Top-Left Floating Avatar Telemetry Pill ── */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-xl shadow-2xl">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
                : isListening
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
                : isThinking
                ? 'bg-sky-400 animate-pulse shadow-[0_0_10px_#38bdf8]'
                : 'bg-emerald-400'
            }`}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white tracking-wide">{mentorName}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                3D AI Mentor
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Ready Player Me 3D Engine • Oculus Visemes Synced
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/60 border border-teal-500/30 text-teal-300 text-[10px] font-bold backdrop-blur-md shadow-lg">
          <Bot className="w-3.5 h-3.5 text-teal-400" />
          <span>Standalone 60 FPS</span>
        </div>
      </div>

      {/* ── Main 3D Canvas Container ── */}
      <div className="relative w-full h-full flex items-center justify-center">
        <FemaleMentor3DAvatar
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          mentorName={mentorName}
        />
      </div>
    </div>
  );
});

export default HeyGenMentorAvatar;
