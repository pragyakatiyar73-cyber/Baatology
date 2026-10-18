import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import FemaleMentor3DAvatar from '../Mentorship/FemaleMentor3DAvatar';
import { Volume2, Bot } from 'lucide-react';
import { getBestFemaleVoice, configureFemaleUtterance } from '../../utils/femaleVoiceManager';

/**
 * HeyGenMentorAvatar (3D Photorealistic AI Mentor)
 *
 * Standalone, Reliable 3D Photorealistic Female Mentor:
 * - Powered by Three.js, @react-three/fiber, and @react-three/drei
 * - Uses Ready Player Me female 3D model with 15 Oculus facial visemes & morph targets
 * - Natural breathing, attentive listening head movements, and synchronized lip-sync
 * - Realistic executive office background, walnut wood desk, laptop, and ceramic coffee mug
 * - ElevenLabs Neural TTS with instant Web Speech API fallback
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
      configureFemaleUtterance(utterance);

      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
      }

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

            audio.onplay = () => {
              onSpeechStart?.();
            };
            audio.onended = () => {
              onSpeechEnd?.();
              onComplete?.();
            };
            audio.onerror = () => {
              fallbackSpeak(text, onComplete);
            };

            await audio.play();
            return;
          }
        } catch (err) {
          console.warn('[ElevenLabs TTS] Falling back to Web Speech API:', err.message);
        }

        // Step 2: Fallback to high quality Web Speech API
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
    [fallbackSpeak, mode, onSpeechEnd, onSpeechStart]
  );

  return (
    <div className="relative w-full h-full bg-[#080d1a] overflow-hidden select-none flex items-center justify-center">
      {/* ── Main 3D Photorealistic Female Mentor & Executive Office ── */}
      <div className="relative w-full h-full flex items-center justify-center">
        <FemaleMentor3DAvatar
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          mentorName={mentorName}
        />

        {/* Live Spoken Subtitle Overlay */}
        {isSpeaking && speakingText && (
          <div className="absolute bottom-16 left-6 right-6 z-30 flex justify-center pointer-events-none animate-fade-in">
            <div className="max-w-xl px-5 py-2.5 rounded-2xl bg-black/85 border border-cyan-400/40 backdrop-blur-xl shadow-2xl text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-0.5 flex items-center justify-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{mentorName} • Spoken Feedback</span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
                "{speakingText}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default HeyGenMentorAvatar;
