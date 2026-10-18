import { useState, useEffect, useRef, useCallback } from 'react';
import { getEmpatheticAssistantResponse } from '../utils/empatheticAssistant';
import { analyzeSentiment } from '../utils/sentimentAnalyzer';
import { getBestFemaleVoice, configureFemaleUtterance } from '../utils/femaleVoiceManager';

/**
 * useEmpatheticVoiceAssistant
 *
 * Full-stack voice-enabled empathetic conversational assistant hook:
 * - Thought & Deep Reasoning: Exposes internal thinking chain and steps
 * - Emotional Intelligence: Detects user stress, anxiety, sadness, and joy
 * - Voice Integration: STT (Speech-to-Text) + ElevenLabs Neural TTS (with Web Speech fallback)
 * - Real-time Viseme & Lip-Sync bridge for 3D avatar
 */
export function useEmpatheticVoiceAssistant({
  mentorName = 'Dr. Ann Vance',
  onSpeechStart,
  onSpeechEnd,
  autoListen = true,
} = {}) {
  // Conversational Lifecycle States: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [assistantState, setAssistantState] = useState('listening');
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [emotionalState, setEmotionalState] = useState({
    primaryEmotion: 'neutral',
    stressScore: 18,
    valence: 0.1,
  });
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio & API references
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const currentAudioSourceRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);

  // ── 1. Text-to-Speech (TTS): ElevenLabs with Seamless Web Speech Fallback ──
  const playEmpatheticVoice = useCallback(
    async (textToSpeak, emotion = 'neutral') => {
      if (!textToSpeak || !textToSpeak.trim()) return;

      setAssistantState('speaking');
      onSpeechStart?.();

      // Step A: Attempt ElevenLabs Neural TTS through our backend endpoint
      try {
        const res = await fetch('http://localhost:3001/api/assistant/tts/elevenlabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            emotion,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('audio/mpeg')) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);

          currentAudioSourceRef.current = audio;

          audio.onended = () => {
            setAssistantState('listening');
            onSpeechEnd?.();
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            console.warn('[EmpatheticVoice] Audio playback failed, using Web Speech fallback');
            fallbackWebSpeech(textToSpeak);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        // Backend offline or network error, smoothly proceed to fallback
        console.info('[EmpatheticVoice] ElevenLabs unavailable, switching to browser neural voice:', err?.message);
      }

      // Step B: Web Speech API Fallback (Zero delay, high compatibility)
      fallbackWebSpeech(textToSpeak);
    },
    [onSpeechStart, onSpeechEnd]
  );

  const fallbackWebSpeech = useCallback(
    (textToSpeak) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(() => {
          setAssistantState('listening');
          onSpeechEnd?.();
        }, 3000);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      configureFemaleUtterance(utterance);

      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
      }

      utterance.onend = () => {
        setAssistantState('listening');
        onSpeechEnd?.();
      };

      utterance.onerror = () => {
        setAssistantState('listening');
        onSpeechEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [onSpeechEnd]
  );

  // ── 2. Handle Process User Utterance with Deep Reasoning ──
  const processUserSpeech = useCallback(
    async (finalText) => {
      if (!finalText || !finalText.trim()) return;

      const trimmed = finalText.trim();
      setUserTranscript(trimmed);
      setAssistantState('thinking');

      // Stop speech recognition while thinking & speaking
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      try {
        // Evaluate input with sentiment & reasoning engine
        const result = await getEmpatheticAssistantResponse(
          trimmed,
          conversationHistoryRef.current
        );

        setThoughtProcess(result.thoughtProcess || '');
        setSpokenResponse(result.spokenText || '');
        setEmotionalState(result.emotionalState || { primaryEmotion: 'neutral', stressScore: 20 });

        // Update conversation memory
        conversationHistoryRef.current.push({ role: 'student', text: trimmed });
        conversationHistoryRef.current.push({ role: 'mentor', text: result.spokenText });

        // Speak response with empathetic voice
        await playEmpatheticVoice(result.spokenText, result.emotionalState?.primaryEmotion);
      } catch (err) {
        console.error('[EmpatheticVoice] Assistant error:', err);
        const fallback = 'I am right here with you. Take a comfortable breath, and we can continue together.';
        setSpokenResponse(fallback);
        playEmpatheticVoice(fallback, 'neutral');
      }
    },
    [playEmpatheticVoice]
  );

  // ── 3. Speech-to-Text (STT) Setup using Web Speech API ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[EmpatheticVoice] Web Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
        // Real-time sentiment preview
        const liveSentiment = analyzeSentiment(interim);
        setEmotionalState(liveSentiment);
      }

      if (final) {
        setInterimTranscript('');
        processUserSpeech(final);
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        console.warn('[EmpatheticVoice] STT error:', e.error);
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      // Restart if assistant returned to listening state
      if (autoListen && assistantState === 'listening') {
        try {
          recognition.start();
        } catch (_) {}
      }
    };

    recognitionRef.current = recognition;

    if (autoListen) {
      try {
        recognition.start();
      } catch (_) {}
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [autoListen, assistantState, processUserSpeech]);

  // ── 4. Interrupt Assistant Speech ──
  const interrupt = useCallback(() => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.pause();
      currentAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAssistantState('listening');
    onSpeechEnd?.();
    try {
      recognitionRef.current?.start();
    } catch (_) {}
  }, [onSpeechEnd]);

  // ── 5. Trigger Manual User Query ──
  const submitUserMessage = useCallback(
    (text) => {
      interrupt();
      processUserSpeech(text);
    },
    [interrupt, processUserSpeech]
  );

  return {
    assistantState, // 'listening' | 'thinking' | 'speaking'
    isListening: assistantState === 'listening',
    isThinking: assistantState === 'thinking',
    isSpeaking: assistantState === 'speaking',
    userTranscript,
    interimTranscript,
    spokenResponse,
    thoughtProcess,
    emotionalState,
    audioLevel,
    interrupt,
    submitUserMessage,
    playEmpatheticVoice,
  };
}
