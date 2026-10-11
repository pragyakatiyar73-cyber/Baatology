import { useCallback, useRef } from 'react';

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
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: first English-language voice available
  return voices.find(v => v.lang?.startsWith('en')) || voices[0] || null;
}

/** Add micro-pauses at sentence boundaries for natural cadence */
function addMicroPauses(text) {
  return text
    .replace(/([\\.!?])\s+/g, '$1  ')   // double space = micro-pause
    .replace(/([,;:])\s+/g,  '$1 ');
}

/**
 * Speech synthesis hook with natural high-fidelity voice selection.
 * Picks Google/Microsoft neural voices automatically.
 */
export function useSpeechSynthesis({ onStart, onEnd } = {}) {
  const onStartRef = useRef(onStart);
  const onEndRef   = useRef(onEnd);
  onStartRef.current = onStart;
  onEndRef.current   = onEnd;

  const speak = useCallback((text, onComplete) => {
    if (!window.speechSynthesis || !text) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance    = new SpeechSynthesisUtterance(addMicroPauses(text));
    utterance.rate     = 1.02;
    utterance.pitch    = 1.04;
    utterance.volume   = 1.0;

    // Voice selection — may need to wait for voices to load
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

    utterance.onstart = () => {
      if (onStartRef.current) onStartRef.current();
    };

    utterance.onend = () => {
      if (onEndRef.current)  onEndRef.current();
      if (onComplete)        onComplete();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') console.warn('[TTS] Error:', e.error);
      if (onEndRef.current) onEndRef.current();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (onEndRef.current) onEndRef.current();
  }, []);

  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis;
  return { speak, stop, isSupported };
}
