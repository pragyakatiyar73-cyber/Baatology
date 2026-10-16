import { useCallback, useRef, useEffect } from 'react';

// Prioritized list of high-quality neural voices
const PREFERRED_VOICES = [
  'Google US English',
  'Google UK English Female',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Zira - English (United States)',
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
];

function getBestVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // Fallback: first English-language voice available
  return voices.find((v) => v.lang?.startsWith('en')) || voices[0] || null;
}

/** Add micro-pauses at sentence boundaries for natural cadence */
function addMicroPauses(text) {
  return text
    .replace(/([.!?])\s+/g, '$1  ')   // double space = micro-pause
    .replace(/([,;:])\s+/g, '$1 ');
}

/**
 * Speech synthesis hook with natural high-fidelity voice selection,
 * freeze recovery, and guaranteed callback execution.
 */
export function useSpeechSynthesis({ onStart, onEnd } = {}) {
  const onStartRef = useRef(onStart);
  const onEndRef   = useRef(onEnd);
  onStartRef.current = onStart;
  onEndRef.current   = onEnd;

  const timerRef = useRef(null);

  // Chrome speech pause keeper & resume guard
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const speak = useCallback((text, onComplete) => {
    if (!window.speechSynthesis || !text) {
      if (onComplete) onComplete();
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    const utterance  = new SpeechSynthesisUtterance(addMicroPauses(text));
    utterance.rate   = 1.02;
    utterance.pitch  = 1.04;
    utterance.volume = 1.0;

    const applyVoice = () => {
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      applyVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        applyVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    let hasFinished = false;
    const finish = () => {
      if (hasFinished) return;
      hasFinished = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (onEndRef.current) onEndRef.current();
      if (onComplete) onComplete();
    };

    utterance.onstart = () => {
      if (onStartRef.current) onStartRef.current();
    };

    utterance.onend = () => {
      finish();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.warn('[TTS] Synthesis error:', e.error);
      }
      finish();
    };

    // Safety fallback: if utterance hangs longer than estimated words * 600ms, force finish
    const estimatedMs = Math.max(4000, text.split(/\s+/).length * 600);
    timerRef.current = setTimeout(() => {
      if (!hasFinished) {
        console.debug('[TTS] Speech timeout safety triggered.');
        finish();
      }
    }, estimatedMs + 3000);

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] Speech synthesis speak error:', err);
      finish();
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
    if (onEndRef.current) onEndRef.current();
  }, []);

  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis;
  return { speak, stop, isSupported };
}
