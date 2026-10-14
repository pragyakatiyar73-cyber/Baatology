import React, { useEffect } from 'react';

/**
 * Feature 3: Visual HUD Warning Badge
 * Displays clean, non-intrusive HUD alert pill with auto-dismiss in 2.5 seconds.
 */
export default function PostureAlertBadge({ alert, onDismiss }) {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 2500); // Auto-dismiss within 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 posture-badge pointer-events-none select-none transition-all duration-300">
      <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-950/90 via-red-950/80 to-amber-950/90 border border-amber-500/70 shadow-[0_0_24px_rgba(245,158,11,0.4)] backdrop-blur-md text-amber-200 text-xs font-bold tracking-wide animate-bounce">
        <span className="text-sm">⚠️</span>
        <span>{alert}</span>
      </div>
    </div>
  );
}
