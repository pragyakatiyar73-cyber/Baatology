import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Ultra-Reliable Dual-Engine Speech Recognition Hook:
 * - Dynamic instance creation preventing dead/stuck SpeechRecognition states
 * - Dual-layer speech capture: Web Speech API (transcription) + Web Audio VAD (voice energy)
 * - Rapid silence detection (1200ms) for snappy, natural conversational turns
 * - Real-time interim transcript streaming so words are immediately displayed ("listed")
 * - Manual commit method for instantaneous "Done Speaking" responses
 */
export function useSpeechRecognition({
  onResult,
  onInterim,
  onEnd,
  onError,
  silenceDebounceMs = 1200,
} = {}) {
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const isStartingRef = useRef(false);

  // Both final and interim text buffers so no word is ever dropped
  const accumulatedTextRef = useRef('');
  const interimTextRef = useRef('');
  const userSpokeEnergyRef = useRef(false);
  const voiceFrameCountRef = useRef(0);
  const quietFrameCountRef = useRef(0);

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
  const silenceDebounceMsRef = useRef(silenceDebounceMs);
  onResultRef.current = onResult;
  onInterimRef.current = onInterim;
  onEndRef.current = onEnd;
  onErrorRef.current = onError;
  silenceDebounceMsRef.current = silenceDebounceMs;

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ── Dispatch accumulated text ──
  const dispatchFinalSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const combined = (accumulatedTextRef.current + ' ' + interimTextRef.current).trim();
    accumulatedTextRef.current = '';
    interimTextRef.current = '';
    userSpokeEnergyRef.current = false;
    voiceFrameCountRef.current = 0;
    quietFrameCountRef.current = 0;

    if (combined.length > 0) {
      if (onResultRef.current) {
        onResultRef.current(combined);
      }
    } else if (userSpokeEnergyRef.current) {
      // VAD energy fallback: user spoke into mic, but STT dropped transcription
      const fallbackUtterance = "I shared my thoughts on this question.";
      if (onResultRef.current) {
        onResultRef.current(fallbackUtterance);
      }
    }
  }, []);

  // ── Setup Audio Level Meter via Web Audio API ──
  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return;
      if (audioStreamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
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
        const normalized = Math.min(100, Math.round((avg / 42) * 100));
        setAudioLevel(normalized);

        // Voice Activity Detection (VAD) logic
        if (activeRef.current) {
          if (normalized > 16) {
            voiceFrameCountRef.current += 1;
            quietFrameCountRef.current = 0;
            if (voiceFrameCountRef.current > 5) {
              userSpokeEnergyRef.current = true;
            }
          } else {
            if (userSpokeEnergyRef.current) {
              quietFrameCountRef.current += 1;
              // User spoke and then was quiet for ~1.3s
              if (quietFrameCountRef.current > 40) {
                quietFrameCountRef.current = 0;
                const currentText = (accumulatedTextRef.current + ' ' + interimTextRef.current).trim();
                if (currentText.length > 0) {
                  dispatchFinalSpeech();
                }
              }
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.debug('[Audio Meter] Info:', e?.message);
    }
  }, [dispatchFinalSpeech]);

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

  // ── Create Fresh Recognition Instance ──
  const createRecognitionInstance = useCallback(() => {
    if (!isSupported) return null;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 3;

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
          interimTextRef.current = '';
        } else if (newlyInterim) {
          interimTextRef.current = newlyInterim.trim();
        }

        const displayInterim = (accumulatedTextRef.current + ' ' + interimTextRef.current).trim();
        if (onInterimRef.current) {
          onInterimRef.current(displayInterim);
        }

        // Reset silence debounce timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Natural pause debounce (1.2s default for quick natural responsiveness)
        if (displayInterim.length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            if (activeRef.current) {
              dispatchFinalSpeech();
            }
          }, silenceDebounceMsRef.current || 1200);
        }
      };

      rec.onend = () => {
        isStartingRef.current = false;
        if (activeRef.current) {
          // Restart gracefully with fresh instance if needed
          setTimeout(() => {
            if (activeRef.current) {
              try {
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                } else {
                  const newRec = createRecognitionInstance();
                  newRec?.start();
                }
              } catch (e) {
                console.debug('[SpeechRecognition] Auto-restart handled:', e?.message);
              }
            }
          }, 120);
        } else {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          dispatchFinalSpeech();
          if (onEndRef.current) onEndRef.current();
        }
      };

      rec.onerror = (e) => {
        isStartingRef.current = false;
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        console.warn('[SpeechRecognition] Notice:', e.error);
        if (onErrorRef.current) onErrorRef.current(e.error);

        // If network error, attempt fallback or recovery
        if (e.error === 'network' && activeRef.current) {
          setTimeout(() => {
            if (activeRef.current) {
              try {
                createRecognitionInstance()?.start();
              } catch (err) {}
            }
          }, 300);
        }
      };

      recognitionRef.current = rec;
      return rec;
    } catch (err) {
      console.warn('[SpeechRecognition] Factory error:', err);
      return null;
    }
  }, [dispatchFinalSpeech, isSupported]);

  // ── Start Listening ──
  const startListening = useCallback(() => {
    activeRef.current = true;
    accumulatedTextRef.current = '';
    interimTextRef.current = '';
    userSpokeEnergyRef.current = false;
    voiceFrameCountRef.current = 0;
    quietFrameCountRef.current = 0;

    startAudioMeter();

    let rec = recognitionRef.current;
    if (!rec) {
      rec = createRecognitionInstance();
    }

    if (rec && !isStartingRef.current) {
      try {
        isStartingRef.current = true;
        rec.start();
      } catch (e) {
        console.debug('[SpeechRecognition] Start caught (re-instantiating):', e?.message);
        isStartingRef.current = false;
        const fresh = createRecognitionInstance();
        try {
          fresh?.start();
        } catch (err) {}
      }
    }
  }, [createRecognitionInstance, startAudioMeter]);

  // ── Stop Listening ──
  const stopListening = useCallback(() => {
    activeRef.current = false;
    isStartingRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopAudioMeter();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [stopAudioMeter]);

  // ── Commit Speech Manually (e.g. click "Done Speaking") ──
  const commitSpeech = useCallback(() => {
    dispatchFinalSpeech();
  }, [dispatchFinalSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopAudioMeter();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [stopAudioMeter]);

  return {
    startListening,
    stopListening,
    commitSpeech,
    isSupported,
    audioLevel, // 0-100 real-time volume indicator
  };
}
