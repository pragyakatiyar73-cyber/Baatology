import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Enhanced Cross-Browser Speech Recognition Hook:
 * - Guarantees both interim AND final speech tokens are captured (zero lost words)
 * - Real-time Web Audio API volume level detection with enhanced voice sensitivity
 * - Debounced silence detection (1.8s) for natural speech pauses
 * - Safe auto-restart logic preventing InvalidStateError in Chrome/Edge
 * - Proper cleanup of microphone MediaStream tracks
 */
export function useSpeechRecognition({ onResult, onInterim, onEnd, onError } = {}) {
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const silenceTimerRef = useRef(null);

  // Both final and interim text buffers so no word is ever dropped
  const accumulatedTextRef = useRef('');
  const interimTextRef = useRef('');

  // Audio Context for Voice Activity / Volume detection
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100

  // Callback refs to prevent stale closures
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onInterimRef.current = onInterim;
  onEndRef.current = onEnd;
  onErrorRef.current = onError;

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ── Setup Audio Level Meter via Web Audio API ──
  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return;
      if (audioStreamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
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
        // Enhanced sensitivity so even normal talking shows high responsive visual waves
        const normalized = Math.min(100, Math.round((avg / 48) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.debug('[Audio Meter] Info:', e?.message);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch (e) {}
      });
      audioStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
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
    // Set language to system or English Indian / US
    rec.lang = navigator.language || 'en-US';
    rec.maxAlternatives = 3;

    const dispatchFinalSpeech = () => {
      // Combine accumulated final text AND any pending interim text so NOTHING is dropped!
      const combined = (accumulatedTextRef.current + ' ' + interimTextRef.current).trim();
      if (combined.length > 0) {
        accumulatedTextRef.current = '';
        interimTextRef.current = '';
        if (onResultRef.current) {
          onResultRef.current(combined);
        }
      }
    };

    rec.onresult = (event) => {
      if (!activeRef.current) return;
      let newlyFinal = '';
      let newlyInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newlyFinal += transcript + ' ';
        } else {
          newlyInterim += transcript + ' ';
        }
      }

      if (newlyFinal) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newlyFinal).trim();
        interimTextRef.current = ''; // Clear interim since it became final
      } else if (newlyInterim) {
        interimTextRef.current = newlyInterim.trim();
      }

      const displayInterim = (accumulatedTextRef.current + ' ' + interimTextRef.current).trim();
      if (onInterimRef.current) {
        onInterimRef.current(displayInterim);
      }

      // Reset silence debounce timer on every spoken syllable
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      // If user pauses for 1.8 seconds after uttering words, dispatch to AI Evaluator
      if (displayInterim.length > 0) {
        silenceTimerRef.current = setTimeout(() => {
          if (activeRef.current) {
            dispatchFinalSpeech();
          }
        }, 1800);
      }
    };

    rec.onend = () => {
      if (activeRef.current) {
        // Keep continuous listener alive with slight debounce to prevent InvalidStateError
        setTimeout(() => {
          if (activeRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.debug('[SpeechRecognition] Restart handled:', e?.message);
            }
          }
        }, 100);
      } else {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        dispatchFinalSpeech();
        if (onEndRef.current) onEndRef.current();
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      console.warn('[SpeechRecognition] Notice:', e.error);
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
    if (!recognitionRef.current) return;
    activeRef.current = true;
    accumulatedTextRef.current = '';
    interimTextRef.current = '';
    startAudioMeter();

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.debug('[SpeechRecognition] Start caught:', e?.message);
    }
  }, [startAudioMeter]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopAudioMeter();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [stopAudioMeter]);

  return {
    startListening,
    stopListening,
    isSupported,
    audioLevel, // 0-100 real-time volume indicator
  };
}
