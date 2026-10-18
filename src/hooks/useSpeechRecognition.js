import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Ultra-Reliable Dual-Engine Speech Recognition Hook:
 * - Dynamic instance creation preventing dead/stuck SpeechRecognition states
 * - Dual-layer speech capture: Web Speech API (transcription) + Web Audio VAD (voice energy)
 * - Optimized for Indian English & Hinglish ('en-IN' with browser locale fallback)
 * - Rapid silence detection (1200ms) for snappy, natural conversational turns
 * - Real-time interim transcript streaming so words are immediately displayed
 * - Manual commit and submitText methods for instantaneous responses
 */
export function useSpeechRecognition({
  onResult,
  onInterim,
  onEnd,
  onError,
  silenceDebounceMs = 1600,
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [micNotice, setMicNotice] = useState(null);
  const [language, setLanguage] = useState(() => {
    return 'hi-IN'; // Default to hi-IN so Hindi, Hinglish, and English are all recognized seamlessly
  });
  const languageRef = useRef('hi-IN');
  languageRef.current = language;

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'hi-IN' ? 'en-IN' : 'hi-IN';
      languageRef.current = next;
      console.log('[SpeechRecognition] Switched recognition language to:', next);
      if (activeRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      return next;
    });
  }, []);

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
    const hadEnergy = userSpokeEnergyRef.current;
    userSpokeEnergyRef.current = false;
    voiceFrameCountRef.current = 0;
    quietFrameCountRef.current = 0;

    if (combined.length > 0) {
      if (onResultRef.current) {
        onResultRef.current(combined);
      }
    }
    // If combined is empty, do nothing! Never emit phantom fallback speech.
  }, []);

  // ── Setup Audio Level Meter via Web Audio API ──
  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return;
      if (audioStreamRef.current && audioStreamRef.current.getAudioTracks().some(t => t.readyState === 'live')) {
        return;
      }

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
        // Enhanced sensitivity so even normal talking shows responsive visual feedback
        const normalized = Math.min(100, Math.round((avg / 36) * 100));
        setAudioLevel(normalized);

        // Voice Activity Detection (VAD) logic
        if (activeRef.current) {
          if (normalized > 14) {
            voiceFrameCountRef.current += 1;
            quietFrameCountRef.current = 0;
            if (voiceFrameCountRef.current > 4) {
              userSpokeEnergyRef.current = true;
            }
          } else {
            if (userSpokeEnergyRef.current) {
              quietFrameCountRef.current += 1;
              // User spoke and then was quiet for ~1.3s
              if (quietFrameCountRef.current > 38) {
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

      // Use active language (hi-IN recognizes Hindi, Hinglish, and English words seamlessly)
      rec.lang = languageRef.current || 'hi-IN';
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
        // Clean up reference to ended instance
        try {
          rec.onresult = null;
          rec.onend = null;
          rec.onerror = null;
          rec.abort();
        } catch (e) {}
        recognitionRef.current = null;

        if (activeRef.current) {
          // Restart with a BRAND NEW instance (never call .start() on a dead instance)
          setTimeout(() => {
            if (activeRef.current) {
              try {
                const fresh = createRecognitionInstance();
                if (fresh) {
                  isStartingRef.current = true;
                  fresh.start();
                }
              } catch (e) {
                console.debug('[SpeechRecognition] Auto-restart handled:', e?.message);
                isStartingRef.current = false;
              }
            }
          }, 150);
        } else {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          dispatchFinalSpeech();
          if (onEndRef.current) onEndRef.current();
        }
      };

      rec.onerror = (e) => {
        isStartingRef.current = false;
        if (e.error === 'no-speech') {
          // No speech detected in this window, continue listening
          return;
        }
        if (e.error === 'aborted') return;

        console.warn('[SpeechRecognition] Notice:', e.error);
        if (onErrorRef.current) onErrorRef.current(e.error);

        if (e.error === 'not-allowed') {
          setPermissionDenied(true);
        }

        // For network or audio-capture errors, retry cleanly with fresh instance
        if ((e.error === 'network' || e.error === 'audio-capture') && activeRef.current) {
          setTimeout(() => {
            if (activeRef.current) {
              try {
                const fresh = createRecognitionInstance();
                if (fresh) {
                  isStartingRef.current = true;
                  fresh.start();
                }
              } catch (err) {
                isStartingRef.current = false;
              }
            }
          }, 350);
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
  const startListening = useCallback(async () => {
    activeRef.current = true;
    setPermissionDenied(false);
    accumulatedTextRef.current = '';
    interimTextRef.current = '';
    userSpokeEnergyRef.current = false;
    voiceFrameCountRef.current = 0;
    quietFrameCountRef.current = 0;

    // Start Audio Level visualizer & VAD
    try {
      startAudioMeter();
    } catch (e) {}

    // Always create a clean, fresh instance
    const rec = createRecognitionInstance();
    if (rec && !isStartingRef.current) {
      try {
        isStartingRef.current = true;
        rec.start();
      } catch (e) {
        console.debug('[SpeechRecognition] Start caught (re-instantiating):', e?.message);
        isStartingRef.current = false;
        setTimeout(() => {
          if (activeRef.current) {
            try {
              const fresh = createRecognitionInstance();
              fresh?.start();
            } catch (err) {}
          }
        }, 150);
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

  // ── Submit Text Directly (Fallback for typing) ──
  const submitText = useCallback((text) => {
    const cleaned = text?.trim();
    if (cleaned && onResultRef.current) {
      onResultRef.current(cleaned);
    }
  }, []);

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

  // ── Retry Listening Manually ──
  const retryListening = useCallback(() => {
    setMicNotice(null);
    stopListening();
    setTimeout(() => {
      startListening();
    }, 200);
  }, [startListening, stopListening]);

  const clearMicNotice = useCallback(() => {
    setMicNotice(null);
  }, []);

  return {
    startListening,
    stopListening,
    commitSpeech,
    submitText,
    isSupported,
    permissionDenied,
    audioLevel, // 0-100 real-time volume indicator
    language,
    setLanguage,
    toggleLanguage,
    micNotice,
    clearMicNotice,
    retryListening,
  };
}
