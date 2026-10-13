import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Webcam access hook with guaranteed video element binding,
 * graceful permission handling, and reactive stream state.
 */
export function useWebcam(autoStart = true) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);

  // Directly attach stream to video element and trigger play
  const attachStreamToVideo = useCallback((mediaStream) => {
    if (!mediaStream || !videoRef.current) return;
    try {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.debug('[Webcam] Auto-play handled:', err?.message);
        });
      }
    } catch (e) {
      console.warn('[Webcam] Attach error:', e);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      attachStreamToVideo(streamRef.current);
      setIsActive(true);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      setError('Camera API is not supported in this browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      setError(null);
      setIsActive(true);

      // Attach immediately if videoRef is already in DOM
      attachStreamToVideo(mediaStream);
    } catch (err) {
      console.warn('[Camera] Access error:', err?.name, err?.message);
      setHasPermission(false);
      setError(err?.name === 'NotAllowedError' ? 'Camera permission was denied in browser settings.' : err?.message || 'Could not access webcam.');
      setIsActive(false);
    }
  }, [attachStreamToVideo]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsActive(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  // Whenever stream or videoRef becomes available/active, attach and play
  useEffect(() => {
    if (stream && isActive) {
      attachStreamToVideo(stream);
    }
  }, [stream, isActive, attachStreamToVideo]);

  // Auto-start camera on mount if requested
  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          try { t.stop(); } catch (e) {}
        });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    videoRef,
    stream,
    isActive,
    hasPermission,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
    attachStreamToVideo,
  };
}
