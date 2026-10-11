import React, { useEffect } from 'react';
import { playPostureChime } from '../../utils/chime';

export default function PostureAlertBadge({ alert, onDismiss }) {
  useEffect(() => {
    if (alert) {
      playPostureChime();
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 posture-badge pointer-events-none select-none">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-950/85 border border-amber-600/50 backdrop-blur-md shadow-2xl text-amber-200 text-xs font-semibold tracking-wide">
        <span className="text-sm">⚠️</span>
        <span>{alert}</span>
      </div>
    </div>
  );
}
