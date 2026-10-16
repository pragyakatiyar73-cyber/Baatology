import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import {
  Sparkles,
  Volume2,
  Video,
  VideoOff,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  Play,
} from 'lucide-react';

/**
 * HeyGenMentorAvatar
 *
 * Real Photorealistic Interactive Human Female Mentor Video Container:
 * - Powered by HeyGen Streaming Avatar SDK (@heygen/streaming-avatar)
 * - Step 1: Fetches session token from backend POST /api/get-heygen-token
 * - Step 2: Registers STREAM_READY event listener BEFORE createStartAvatar
 * - Step 3: Binds event.detail directly to videoRef.current.srcObject and calls videoRef.current.play()
 * - Real HTML5 <video> element with autoPlay, playsInline, muted={false}, width: 100%, height: 100%
 * - Displays comprehensive Error State UI with exact error message instead of a black screen
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
  },
  ref
) {
  const videoRef = useRef(null);
  const avatarRef = useRef(null);
  const sessionDataRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [fallbackActive, setFallbackActive] = useState(false);

  // ── 1. Initialize HeyGen Streaming Avatar Session ──
  const initHeyGenSession = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setErrorMessage(null);
      setStreamActive(false);

      // Step 1: Token fetch
      console.log('[HeyGenMentorAvatar] 1. Token fetch: Requesting HeyGen token from /api/get-heygen-token...');
      const tokenRes = await fetch('/api/get-heygen-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData?.token) {
        if (!tokenData?.hasApiKey) {
          setHasApiKey(false);
        }
        const formattedErr =
          tokenData?.error ||
          (tokenRes.status === 404
            ? 'HeyGen API 404 Not Found: Account plan does not support Interactive Streaming Avatar tokens.'
            : `Failed to obtain HeyGen token (HTTP ${tokenRes.status}).`);
        throw new Error(formattedErr);
      }

      setHasApiKey(true);
      const token = tokenData.token;
      console.log(
        '[HeyGenMentorAvatar] 2. Token fetch SUCCESS: Acquired token:',
        token.slice(0, 10) + '...'
      );

      // Instantiate HeyGen StreamingAvatar SDK
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      // Step 2 & 3: Register STREAM_READY event listener BEFORE createStartAvatar
      console.log(
        '[HeyGenMentorAvatar] 3. Session creation: Registering STREAM_READY event listener BEFORE createStartAvatar...'
      );

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(
          '[HeyGenMentorAvatar] 5. STREAM_READY event fired! Binding media stream to videoRef.current.srcObject:',
          event.detail
        );
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.play().catch((err) => {
            console.warn('[HeyGenMentorAvatar] Video autoplay notice (handling browser restrictions):', err);
            // Autoplay fallback with muted if browser policy requires user gesture
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(console.error);
            }
          });
          setStreamActive(true);
          setConnectionStatus('connected');
        }
      });

      // Event: Stream disconnected
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, (reason) => {
        console.warn('[HeyGenMentorAvatar] Stream disconnected:', reason);
        setStreamActive(false);
        setConnectionStatus('error');
        setErrorMessage('HeyGen WebRTC stream disconnected.');
      });

      // Event: Avatar starts talking
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('[HeyGenMentorAvatar] Avatar started talking');
        onSpeechStart?.();
      });

      // Event: Avatar stops talking
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('[HeyGenMentorAvatar] Avatar stopped talking');
        onSpeechEnd?.();
      });

      // Selected realistic female avatar ID (Ann_Doctor_Sitting or Angela_Office)
      const avatarName =
        import.meta.env.VITE_HEYGEN_AVATAR_NAME || 'Ann_Doctor_Sitting';

      console.log(
        '[HeyGenMentorAvatar] 4. Session creation: Calling createStartAvatar with avatar ID:',
        avatarName
      );

      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: avatarName,
        voice: {
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: 'en',
      });

      sessionDataRef.current = sessionData;
      setConnectionStatus('connected');
      console.log('[HeyGenMentorAvatar] Session successfully started:', sessionData);
    } catch (err) {
      console.error('[HeyGenMentorAvatar] WebRTC setup error:', err.message);
      setErrorMessage(err.message);
      setConnectionStatus('error');
      setStreamActive(false);
    }
  }, [onSpeechStart, onSpeechEnd]);

  useEffect(() => {
    initHeyGenSession();

    return () => {
      if (avatarRef.current) {
        try {
          avatarRef.current.stopAvatar();
        } catch (e) {
          console.debug('Error stopping avatar:', e);
        }
      }
    };
  }, [initHeyGenSession]);

  // ── 2. Imperative Speak and Interrupt Methods Exposed to App.jsx ──
  useImperativeHandle(
    ref,
    () => ({
      speak: async (text, onComplete) => {
        if (!text) return;
        setCurrentSpokenText(text);

        // If HeyGen SDK active and connected, speak via HeyGen avatar
        if (avatarRef.current && connectionStatus === 'connected' && streamActive) {
          try {
            console.log('[HeyGenMentorAvatar] Speaking via HeyGen SDK:', text);
            await avatarRef.current.speak({
              text,
              task_type: TaskType.REPEAT,
              taskType: TaskType.REPEAT,
              taskMode: TaskMode.SYNC,
            });
            onComplete?.();
            return;
          } catch (err) {
            console.warn('[HeyGenMentorAvatar] HeyGen speak failed, falling back to speech synthesis:', err);
          }
        }

        // Synchronized natural speech synthesis with live video playback
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Zira'))
          );
          if (femaleVoice) utterance.voice = femaleVoice;

          utterance.onstart = () => onSpeechStart?.();
          utterance.onend = () => {
            onSpeechEnd?.();
            onComplete?.();
          };
          utterance.onerror = () => {
            onSpeechEnd?.();
            onComplete?.();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          onSpeechStart?.();
          setTimeout(() => {
            onSpeechEnd?.();
            onComplete?.();
          }, Math.max(2500, (text.split(' ').length / 2.8) * 1000));
        }
      },

      interrupt: async () => {
        if (avatarRef.current && connectionStatus === 'connected') {
          try {
            await avatarRef.current.interrupt();
          } catch (e) {}
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onSpeechEnd?.();
      },

      reconnect: () => {
        initHeyGenSession();
      },
    }),
    [connectionStatus, streamActive, onSpeechStart, onSpeechEnd, initHeyGenSession]
  );

  return (
    <div className="relative w-full h-full bg-[#080d1a] overflow-hidden select-none flex items-center justify-center">
      {/* ── Background Studio Atmosphere & Cinematic Rim Glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/4 -left-16 w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(30,41,59,0.3)_0%,rgba(8,13,26,0.98)_100%)]" />
      </div>

      {/* ── Top-Left Floating Avatar Telemetry Pill ── */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-xl shadow-2xl">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
                : isListening
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
                : connectionStatus === 'connected'
                ? 'bg-emerald-400'
                : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white tracking-wide">{mentorName}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                Senior AI Mentor
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {connectionStatus === 'connected' && streamActive
                ? 'HeyGen Live WebRTC Stream • Active'
                : connectionStatus === 'connecting'
                ? 'Initializing WebRTC Stream...'
                : 'HeyGen Connection Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Video Container / Error State UI ── */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        {/* Actual HTML5 <video> Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className={`w-full h-full object-cover max-w-5xl max-h-[85vh] rounded-3xl transition-opacity duration-700 shadow-2xl relative z-10 ${
            streamActive ? 'opacity-100 block' : 'hidden'
          }`}
          style={{ width: '100%', height: '100%', display: streamActive ? 'block' : 'none' }}
        />

        {/* ── Error State UI (Displayed if stream fails instead of black screen) ── */}
        {!streamActive && (
          <div className="relative z-20 max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              {connectionStatus === 'connecting' ? (
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {connectionStatus === 'connecting'
                  ? 'Connecting to HeyGen Streaming Avatar...'
                  : 'HeyGen WebRTC Stream Notice'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                {connectionStatus === 'connecting'
                  ? 'Requesting streaming token from backend and initializing WebRTC video connection.'
                  : 'WebRTC video connection encountered an API response from HeyGen.'}
              </p>
            </div>

            {/* Exact Error Message Callout Box */}
            {errorMessage && (
              <div className="w-full text-left p-3.5 rounded-2xl bg-black/60 border border-red-500/30 text-xs font-mono text-red-200 break-words leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-1">
                  Exact Error Details:
                </span>
                {errorMessage}
              </div>
            )}

            {/* Diagnostics Info */}
            <div className="w-full grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-black/40 p-3 rounded-2xl border border-white/10">
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">API Key (.env)</span>
                <span className="text-emerald-400 font-semibold">{hasApiKey ? 'Configured (sk_V2_...)' : 'Missing'}</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Avatar ID</span>
                <span className="text-cyan-300 font-semibold">{import.meta.env.VITE_HEYGEN_AVATAR_NAME || 'Ann_Doctor_Sitting'}</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Token Route</span>
                <span className="text-slate-200 font-mono">POST /api/get-heygen-token</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Status</span>
                <span className="text-amber-300 font-semibold capitalize">{connectionStatus}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={initHeyGenSession}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Ambient Ring Glow */}
        {streamActive && (
          <div
            className={`absolute inset-0 pointer-events-none z-20 transition-all duration-500 ${
              isSpeaking
                ? 'ring-2 ring-cyan-400/40 shadow-[inset_0_0_60px_rgba(34,211,238,0.2)]'
                : isListening
                ? 'ring-1 ring-emerald-400/30 shadow-[inset_0_0_40px_rgba(52,211,153,0.15)]'
                : ''
            }`}
          />
        )}
      </div>

      {/* ── Bottom Right: Reconnect Pill ── */}
      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
        <button
          onClick={initHeyGenSession}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer"
          title="Attempt HeyGen Token Connection"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Retry WebRTC</span>
        </button>
      </div>
    </div>
  );
});

export default HeyGenMentorAvatar;
