import { useState, useEffect, useRef, useCallback } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import { getBestFemaleVoice, configureFemaleUtterance } from '../utils/femaleVoiceManager';

/**
 * useRealisticAvatarStream
 *
 * Connects directly to HeyGen Interactive Avatar SDK (@heygen/streaming-avatar):
 * 1. Step 1 (Token Fetch): Requests HeyGen session token from POST /api/get-heygen-token
 * 2. Step 2 (Session Creation): Registers StreamingEvents.STREAM_READY listener BEFORE createStartAvatar
 * 3. Step 3 (STREAM_READY): Attaches event.detail directly to videoRef.current.srcObject and plays video
 * 4. Error Handling: Records exact error message for UI display
 */

export function useRealisticAvatarStream({
  onSpeechStart,
  onSpeechEnd,
  mentorName = 'Dr. Ann Vance',
  avatarId = 'Ann_Doctor_Sitting',
} = {}) {
  const [avatarState, setAvatarState] = useState('idle'); // 'idle' | 'speaking' | 'listening' | 'thinking'
  const [hasLiveWebRTC, setHasLiveWebRTC] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamError, setStreamError] = useState(null);
  const [speakingText, setSpeakingText] = useState('');
  const [mediaStream, setMediaStream] = useState(null);

  const videoRef = useRef(null);
  const avatarSdkRef = useRef(null);
  const sessionInfoRef = useRef(null);
  const isConnectingRef = useRef(false);

  // ── 1. Initialize Real HeyGen Streaming Avatar ──
  const startAvatarStream = useCallback(async () => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;
    setIsInitializing(true);
    setStreamError(null);

    try {
      // Step 1: Token fetch
      console.log('[useRealisticAvatarStream] 1. Token fetch: Requesting HeyGen token from /api/get-heygen-token...');
      const tokenResponse = await fetch('/api/get-heygen-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData?.token) {
        const errorMsg =
          tokenData?.error ||
          (tokenResponse.status === 404
            ? 'HeyGen API 404: Your current plan lacks the Interactive Streaming Avatar feature.'
            : `Failed to fetch HeyGen streaming token (HTTP ${tokenResponse.status}).`);
        throw new Error(errorMsg);
      }

      const token = tokenData.token;
      console.log(
        '[useRealisticAvatarStream] 2. Token fetch SUCCESS: Acquired token:',
        token.slice(0, 10) + '...'
      );

      // Initialize StreamingAvatar SDK instance
      const avatar = new StreamingAvatar({ token });
      avatarSdkRef.current = avatar;

      // Step 2 & 3: Register STREAM_READY event listener BEFORE createStartAvatar
      console.log(
        '[useRealisticAvatarStream] 3. Session creation: Registering STREAM_READY event listener BEFORE createStartAvatar...'
      );

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(
          '[useRealisticAvatarStream] 5. STREAM_READY event fired! Binding media stream to videoRef.current.srcObject:',
          event.detail
        );
        const stream = event.detail;
        setMediaStream(stream);
        setHasLiveWebRTC(true);
        setIsConnected(true);
        setIsInitializing(false);
        setAvatarState('listening');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('[useRealisticAvatarStream] video.play() warning:', err);
            // Autoplay fallback if browser audio restriction triggers
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(console.error);
            }
          });
        }
      });

      // Event: Avatar start talking
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('[useRealisticAvatarStream] Avatar started talking');
        setAvatarState('speaking');
        onSpeechStart?.();
      });

      // Event: Avatar stop talking
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('[useRealisticAvatarStream] Avatar stopped talking');
        setAvatarState('listening');
        onSpeechEnd?.();
      });

      // Event: Stream disconnected
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, (reason) => {
        console.warn('[useRealisticAvatarStream] STREAM_DISCONNECTED:', reason);
        setHasLiveWebRTC(false);
        setIsConnected(false);
        setAvatarState('idle');
      });

      // Selected realistic female avatar ID (Ann_Doctor_Sitting or Angela_Office)
      const selectedAvatar =
        import.meta.env.VITE_HEYGEN_AVATAR_NAME || avatarId || 'Ann_Doctor_Sitting';

      console.log(
        '[useRealisticAvatarStream] 4. Session creation: Calling createStartAvatar with avatar ID:',
        selectedAvatar
      );

      const sessionInfo = await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: selectedAvatar,
        voice: {
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: 'en',
      });

      sessionInfoRef.current = sessionInfo;
      console.log('[useRealisticAvatarStream] Session creation SUCCESS:', sessionInfo);
      setIsConnected(true);
      setIsInitializing(false);
    } catch (err) {
      console.error('[useRealisticAvatarStream] WebRTC connection error:', err.message);
      setStreamError(err.message);
      setIsInitializing(false);
      setHasLiveWebRTC(false);
      setIsConnected(false);
    } finally {
      isConnectingRef.current = false;
    }
  }, [avatarId, onSpeechStart, onSpeechEnd]);

  // ── Auto-start on mount ──
  useEffect(() => {
    startAvatarStream();

    return () => {
      if (avatarSdkRef.current) {
        try {
          avatarSdkRef.current.stopAvatar();
        } catch (e) {
          console.debug('Cleanup avatar:', e);
        }
      }
    };
  }, [startAvatarStream]);

  // ── Speak text via HeyGen avatar ──
  const speakText = useCallback(
    async (text, onComplete) => {
      if (!text) return;
      setSpeakingText(text);
      setAvatarState('speaking');
      onSpeechStart?.();

      if (avatarSdkRef.current && sessionInfoRef.current) {
        try {
          await avatarSdkRef.current.speak({
            text,
            taskType: TaskType.TALK,
            taskMode: TaskMode.ASYNC,
          });
          return;
        } catch (err) {
          console.warn('[useRealisticAvatarStream] SDK speak failed, falling back to speech synthesis:', err.message);
        }
      }

      // Synchronized speech synthesis fallback if SDK task is unavailable
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        configureFemaleUtterance(utterance);

        const preferred = getBestFemaleVoice();
        if (preferred) {
          utterance.voice = preferred;
          if (preferred.lang) utterance.lang = preferred.lang;
        }

        utterance.onend = () => {
          setAvatarState('listening');
          onSpeechEnd?.();
          onComplete?.();
        };

        utterance.onerror = () => {
          setAvatarState('listening');
          onSpeechEnd?.();
          onComplete?.();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setAvatarState('listening');
          onSpeechEnd?.();
          onComplete?.();
        }, Math.max(2000, (text.split(' ').length / 2.5) * 1000));
      }
    },
    [onSpeechStart, onSpeechEnd]
  );

  // ── Interrupt AI ──
  const interrupt = useCallback(async () => {
    if (avatarSdkRef.current) {
      try {
        await avatarSdkRef.current.interrupt();
      } catch (e) {
        console.debug('HeyGen interrupt:', e);
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAvatarState('listening');
    onSpeechEnd?.();
  }, [onSpeechEnd]);

  return {
    videoRef,
    mediaStream,
    hasLiveWebRTC,
    isConnected,
    isInitializing,
    avatarState,
    setAvatarState,
    streamError,
    speakingText,
    speakText,
    interrupt,
    mentorName,
    reconnect: startAvatarStream,
  };
}
