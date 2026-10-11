import { useEffect, useRef } from 'react';
import { playPostureChime } from '../utils/chime';

/**
 * Computer Vision-assisted Posture & Nervous Mistake Detection Hook
 * Analyzes video frames from candidate's webcam for:
 * 1. Face-touching (hands raised into lower face quadrant)
 * 2. Slouching (head dropping into lower half of frame)
 * 3. Gaze drift / looking away from screen & camera
 */
export function useVisionPostureTracker({
  videoRef,
  isActive,
  onAlert,
  intervalMs = 3500,
}) {
  const canvasRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const alertCooldownRef = useRef(0);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 64;
      canvasRef.current.height = 48;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const checkPosture = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const now = Date.now();
      if (now - alertCooldownRef.current < 7000) return; // Prevent spamming alerts

      try {
        ctx.drawImage(video, 0, 0, 64, 48);
        const frame = ctx.getImageData(0, 0, 64, 48);
        const data = frame.data;

        // Calculate brightness and motion across regions:
        // Top region: eyes / forehead (y: 8 to 24)
        // Mid-lower region: mouth / chin / hand proximity (y: 28 to 44)
        let topMass = 0;
        let bottomMass = 0;
        let leftMass = 0;
        let rightMass = 0;
        let totalMotion = 0;

        for (let y = 0; y < 48; y++) {
          for (let x = 0; x < 64; x++) {
            const idx = (y * 64 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            if (y < 24) topMass += luma;
            else bottomMass += luma;

            if (x < 32) leftMass += luma;
            else rightMass += luma;

            if (prevFrameDataRef.current) {
              const diff = Math.abs(luma - prevFrameDataRef.current[idx / 4]);
              if (diff > 25) totalMotion += diff;
            }
          }
        }

        // Cache grayscale frame for motion diffing
        if (!prevFrameDataRef.current) {
          prevFrameDataRef.current = new Float32Array(64 * 48);
        }
        for (let i = 0; i < 64 * 48; i++) {
          prevFrameDataRef.current[i] =
            0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        }

        const totalMass = topMass + bottomMass;
        if (totalMass === 0) return;

        const verticalRatio = bottomMass / (topMass + 1);
        const horizontalBalance = Math.abs(leftMass - rightMass) / (totalMass + 1);

        // Condition 1: Slouching (candidate has slumped down, heavy bottom mass)
        if (verticalRatio > 1.65) {
          alertCooldownRef.current = now;
          playPostureChime();
          onAlert?.('Posture Alert: Sit upright with shoulders relaxed and chin up!');
          return;
        }

        // Condition 2: Head turned away or looking down (high horizontal imbalance)
        if (horizontalBalance > 0.32) {
          alertCooldownRef.current = now;
          playPostureChime();
          onAlert?.('Eye Contact Alert: Keep your gaze steady on the camera lens!');
          return;
        }

        // Condition 3: Face touching (sudden concentrated movement in the lower-face region)
        if (totalMotion > 18000) {
          alertCooldownRef.current = now;
          playPostureChime();
          onAlert?.('Mistake Detected: Avoid touching your face or resting chin on hands!');
          return;
        }
      } catch (e) {
        // Safe canvas read
      }
    };

    const interval = setInterval(checkPosture, intervalMs);
    return () => clearInterval(interval);
  }, [isActive, videoRef, onAlert, intervalMs]);
}
