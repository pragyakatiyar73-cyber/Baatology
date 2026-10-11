import { useEffect, useRef, useCallback } from 'react';

/**
 * Cross-browser continuous speech recognition hook.
 * Supports Hinglish (en-IN locale) and auto-restarts on silence.
 */
export function useSpeechRecognition({ onResult, onInterim, onEnd, onError } = {}) {
  const recognitionRef = useRef(null);
  const activeRef      = useRef(false);

  // Keep callback refs fresh to avoid stale closures
  const onResultRef  = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onEndRef     = useRef(onEnd);
  const onErrorRef   = useRef(onError);
  onResultRef.current  = onResult;
  onInterimRef.current = onInterim;
  onEndRef.current     = onEnd;
  onErrorRef.current   = onError;

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-IN'; // Hinglish support
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final   += text;
        else                           interim += text;
      }
      if (interim && onInterimRef.current) onInterimRef.current(interim);
      if (final   && onResultRef.current)  onResultRef.current(final.trim());
    };

    rec.onend = () => {
      // Auto-restart to maintain continuous listening session
      if (activeRef.current) {
        try { rec.start(); } catch { /* already starting */ }
      } else {
        if (onEndRef.current) onEndRef.current();
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      console.warn('[STT] Error:', e.error);
      if (onErrorRef.current) onErrorRef.current(e.error);
    };

    recognitionRef.current = rec;

    return () => {
      activeRef.current = false;
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || activeRef.current) return;
    activeRef.current = true;
    try { recognitionRef.current.start(); } catch { /* already running */ }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    activeRef.current = false;
    try { recognitionRef.current.stop(); } catch { /* ignore */ }
  }, []);

  return { startListening, stopListening, isSupported };
}
