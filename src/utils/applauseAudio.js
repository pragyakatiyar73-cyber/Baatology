/**
 * applauseAudio.js
 *
 * Authentic multi-layered crowd applause & clapping sound generator
 * Powered by Web Audio API for 100% offline, zero-network-delay playback.
 */

export function playApplauseSound(durationSeconds = 3.5) {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const totalClaps = Math.floor(durationSeconds * 28); // Density of claps

    // Master Gain for smooth fade-in and fade-out
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.exponentialRampToValueAtTime(0.9, now + 0.4); // Fast build-up
    masterGain.gain.setValueAtTime(0.85, now + durationSeconds - 0.8);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds); // Smooth fade-out
    masterGain.connect(ctx.destination);

    // Create a burst of randomized individual hand claps
    for (let i = 0; i < totalClaps; i++) {
      const clapTime = now + (i / totalClaps) * durationSeconds + (Math.random() - 0.5) * 0.08;
      if (clapTime < now) continue;

      // Filtered noise burst representing a single handclap
      const bufferSize = Math.floor(ctx.sampleRate * 0.045); // 45ms per clap
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        const decay = Math.exp(-j / (ctx.sampleRate * 0.009));
        data[j] = (Math.random() * 2 - 1) * decay;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Bandpass filter centered around 1000Hz - 1800Hz (human hand palm acoustics)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000 + Math.random() * 800, clapTime);
      filter.Q.setValueAtTime(2.2 + Math.random() * 1.5, clapTime);

      // Individual clap volume variance
      const clapGain = ctx.createGain();
      const vol = 0.25 + Math.random() * 0.55;
      clapGain.gain.setValueAtTime(vol, clapTime);

      source.connect(filter);
      filter.connect(clapGain);
      clapGain.connect(masterGain);

      source.start(clapTime);
      source.stop(clapTime + 0.05);
    }

    // Clean up audio context after playback
    setTimeout(() => {
      try {
        ctx.close();
      } catch (_) {}
    }, (durationSeconds + 0.5) * 1000);
  } catch (err) {
    console.info('[ApplauseAudio] AudioContext synthesis notice:', err?.message);
  }
}
