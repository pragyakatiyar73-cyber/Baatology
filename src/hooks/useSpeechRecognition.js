import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Enhanced Cross-Browser Speech Recognition Hook with:
 * - Real-time Audio Level Detection (so user sees their voice being picked up)
 * - Silence Detection Debounce (finalizes response when user pauses for 1.8s)
 * - Dual Interim & Final Text Accumulation (prevents words from being dropped)
 * - Robust Auto-Restart on silence or network drops
 */
export function useSpeechRecognition({ onResult, onInterim, onEnd, onError } = {}) {
  const recognitionRef = useRef(null);
  const activeRef      = useRef(false);
  const silenceTimerRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // Audio Context for Voice Activity / Volume detection
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100

  // Callback refs to prevent stale closures
  const onResultRef    = useRef(onResult);
  const onInterimRef   = useRef(onInterim);
  const onEndRef       = useRef(onEnd);
  const onErrorRef     = useRef(onError);
  onResultRef.current  = onResult;
  onInterimRef.current = onInterim;
  onEndRef.current     = onEnd;
  onErrorRef.current   = onError;

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ── Setup Audio Level Meter via Web Audio API ──
  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.debug('Audio meter permission/support notice:', e?.message);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // ── Setup Continuous Web Speech API ──
  useEffect(() => {
    if (!isSupported) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    // en-IN allows English + Indian accents & Hinglish conversational words
    rec.lang = 'en-IN';
    rec.maxAlternatives = 3;

    const dispatchFinalSpeech = () => {
      const fullText = accumulatedTextRef.current.trim();
      if (fullText.length > 0) {
        accumulatedTextRef.current = '';
        if (onResultRef.current) {
          onResultRef.current(fullText);
        }
      }
    };

    rec.onresult = (event) => {
      let currentSessionFinal = '';
      let currentSessionInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentSessionFinal += transcript + ' ';
        } else {
          currentSessionInterim += transcript;
        }
      }

      if (currentSessionFinal) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + currentSessionFinal).trim();
      }

      const displayInterim = (accumulatedTextRef.current + ' ' + currentSessionInterim).trim();
      if (onInterimRef.current) {
        onInterimRef.current(displayInterim);
      }

      // Reset silence timer on every new speech token
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      // If user pauses for 1.8 seconds after speaking, finalize the statement
      if (accumulatedTextRef.current.length > 0 || currentSessionInterim.length > 0) {
        silenceTimerRef.current = setTimeout(() => {
          if (activeRef.current) {
            dispatchFinalSpeech();
          }
        }, 1800);
      }
    };

    rec.onend = () => {
      if (activeRef.current) {
        // Keep continuous listener alive
        try {
          rec.start();
        } catch (e) {
          // ignore if already starting
        }
      } else {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        dispatchFinalSpeech();
        if (onEndRef.current) onEndRef.current();
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      console.warn('[Speech Recognition notice]:', e.error);
      if (onErrorRef.current) onErrorRef.current(e.error);
    };

    recognitionRef.current = rec;

    return () => {
      activeRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopAudioMeter();
      try {
        rec.abort();
      } catch (e) {}
    };
  }, [isSupported, stopAudioMeter]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || activeRef.current) return;
    activeRef.current = true;
    accumulatedTextRef.current = '';
    startAudioMeter();
    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [startAudioMeter]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    activeRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopAudioMeter();
    try {
      recognitionRef.current.stop();
    } catch (e) {}
  }, [stopAudioMeter]);

  return {
    startListening,
    stopListening,
    isSupported,
    audioLevel, // Real-time volume meter for user confidence
  };
}
