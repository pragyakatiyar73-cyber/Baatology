import React, { useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import DigitalRobotAvatar from '../Mentorship/DigitalRobotAvatar';
import { Smile, Heart, Sparkles, Volume2, Mic, Brain } from 'lucide-react';

/**
 * HeyGenMentorAvatar (Now upgraded to Digital AI Robot Companion: Aura)
 *
 * 100% Pure Black (#000000) Face-to-Face Robot Conversation:
 * - Direct, empathetic connection ("Aamne-saamne ek dusre se baat kar rahe hain")
 * - 4 Expressive Emotional States: listening, speaking, empathetic, thinking
 * - Pure Black Background with zero clutter (No 3D desk, chair, laptop, or room)
 * - Safe space & zero judgement for students to speak freely
 * - Reliable Voice Output: ElevenLabs Neural Voice with instant Web Speech fallback
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
    mentorName = 'Aura',
    speakingText = '',
  },
  ref
) {
  const currentAudioRef = useRef(null);

  // Fallback to browser SpeechSynthesis
  const fallbackSpeak = useCallback(
    (text, onComplete) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onSpeechStart?.();
        setTimeout(() => {
          onSpeechEnd?.();
          onComplete?.();
        }, Math.max(2000, (text.split(' ').length / 2.5) * 1000));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Zira'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

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
    },
    [onSpeechStart, onSpeechEnd]
  );

  // Imperative Speak and Interrupt Methods for App.jsx
  useImperativeHandle(
    ref,
    () => ({
      speak: async (text, onComplete) => {
        if (!text || !text.trim()) return;

        // Step 1: Try ElevenLabs Neural TTS endpoint
        try {
          const res = await fetch('http://localhost:3001/api/assistant/tts/elevenlabs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              emotion: mode === 'casual' ? 'warm' : 'supportive',
            }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('audio/mpeg')) {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            onSpeechStart?.();
            audio.onended = () => {
              onSpeechEnd?.();
              onComplete?.();
              URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
              fallbackSpeak(text, onComplete);
            };

            await audio.play();
            return;
          }
        } catch (e) {
          // Fallback if backend is unreachable
        }

        // Step 2: Smooth fallback to Web Speech
        fallbackSpeak(text, onComplete);
      },

      interrupt: () => {
        if (currentAudioRef.current) {
          try {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
          } catch (e) {}
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onSpeechEnd?.();
      },

      reconnect: () => {},
    }),
    [fallbackSpeak, mode, onSpeechStart, onSpeechEnd]
  );

  // Determine avatar emotional state
  const robotState = useMemo(() => {
    if (isConcluding) return 'empathetic';
    if (isSpeaking) {
      const lower = (speakingText || '').toLowerCase();
      if (
        mode === 'casual' ||
        lower.includes('proud') ||
        lower.includes('great job') ||
        lower.includes('no problem') ||
        lower.includes('mistake') ||
        lower.includes('empathy') ||
        lower.includes('relax') ||
        lower.includes('comfort')
      ) {
        return 'empathetic';
      }
      return 'speaking';
    }
    if (isThinking) return 'thinking';
    return 'listening';
  }, [isConcluding, isSpeaking, isThinking, mode, speakingText]);

  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden select-none flex items-center justify-center">
      {/* ── Top-Left Floating Avatar Identity Pill ── */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-xl shadow-2xl">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
                : isListening
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
                : isThinking
                ? 'bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]'
                : 'bg-cyan-400'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide">{mentorName}</span>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <Smile className="w-2.5 h-2.5 text-cyan-400" />
                <span>AI Robot Companion</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              Zero Judgement • Direct Face-to-Face Conversation
            </span>
          </div>
        </div>
      </div>

      {/* ── Center Stage: Digital AI Robot Avatar on Pure Black ── */}
      <div className="relative w-full h-full flex items-center justify-center bg-[#000000]">
        <DigitalRobotAvatar
          avatarState={robotState}
          speakingText={speakingText}
          mentorName={mentorName}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          emotionalTone={robotState}
        />
      </div>
    </div>
  );
});

export default HeyGenMentorAvatar;
