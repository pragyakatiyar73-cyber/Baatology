import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Webcam access hook with graceful permission handling.
 * Returns a videoRef to attach to a <video> element.
 */
export function useWebcam(autoStart = true) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);

  const [isActive,      setIsActive]      = useState(false);
  const [hasPermission, setHasPermission] = useState(null); // null = unknown
  const [error,         setError]         = useState(null);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return; // Already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:      { ideal: 320 },
          height:     { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch { /* autoplay policy blocked */ }
      }
      setIsActive(true);
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.warn('[Camera]', err.name, err.message);
      setHasPermission(false);
      setError(err.message);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (isActive) stopCamera();
    else          startCamera();
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    if (autoStart) startCamera();
    return stopCamera;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    videoRef,
    isActive,
    hasPermission,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
  };
}
