import { useEffect, useRef, useCallback, useState } from 'react';

// Procedural cyberpunk audio using the Web Audio API. Generates:
//   * A continuous ambient drone (three detuned oscillators + low-pass filter
//     + slow LFO on the filter cutoff + soft reverb via ConvolverNode).
//   * A short UI click transient (square + filter) usable for nav feedback.
// The AudioContext is created lazily on the first user gesture so browser
// autoplay policies stay happy. Persists the mute state in localStorage.

const STORAGE_KEY = 'handrian-audio-muted';

function makeReverbBuffer(ctx, seconds = 2.0, decay = 3) {
  const rate = ctx.sampleRate;
  const length = rate * seconds;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return impulse;
}

export default function useCyberAudio() {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return true;
    const v = window.localStorage.getItem(STORAGE_KEY);
    // default = muted so nothing autoplays before first click
    return v === null ? true : v === 'true';
  });
  const [started, setStarted] = useState(false);

  // Initialise the audio graph
  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Reverb
    const reverb = ctx.createConvolver();
    reverb.buffer = makeReverbBuffer(ctx, 2.3, 2.4);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.28;
    reverb.connect(reverbGain).connect(master);

    // Drone bus
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.13; // subtle
    droneGain.connect(master);
    droneGain.connect(reverb);

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 4;
    filter.connect(droneGain);

    // Three detuned oscillators — deep drone
    const oscs = [];
    [
      { freq: 55.0, type: 'sine' },
      { freq: 55.5, type: 'sine' },
      { freq: 110.0, type: 'triangle' },
    ].forEach((cfg) => {
      const o = ctx.createOscillator();
      o.type = cfg.type;
      o.frequency.value = cfg.freq;
      const g = ctx.createGain();
      g.gain.value = cfg.type === 'triangle' ? 0.14 : 0.5;
      o.connect(g).connect(filter);
      o.start();
      oscs.push(o);
    });

    // LFO on filter cutoff (slow breathing)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    nodesRef.current = { master, filter, oscs, lfo, reverb, reverbGain, droneGain };
    ctxRef.current = ctx;
    return ctx;
  }, []);

  const start = useCallback(async () => {
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        // ignore autoplay-blocked errors — user will click again
      }
    }
    setStarted(true);
  }, [ensureContext]);

  // Fade master gain to reflect mute state
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const nodes = nodesRef.current;
    if (!nodes.master) return;
    const now = ctx.currentTime;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.setValueAtTime(nodes.master.gain.value, now);
    nodes.master.gain.linearRampToValueAtTime(muted ? 0 : 0.35, now + 0.6);
  }, [muted, started]);

  const toggleMute = useCallback(async () => {
    if (!ctxRef.current) await start();
    setMuted((m) => {
      const next = !m;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, [start]);

  // Short UI click transient
  const click = useCallback(
    (opts = {}) => {
      if (muted) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { freq = 780, dur = 0.08, gain = 0.08, type = 'square' } = opts;
      const t0 = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq * 1.6;
      f.Q.value = 6;
      o.connect(f).connect(g).connect(nodesRef.current.master);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    },
    [muted]
  );

  return { muted, toggleMute, click, started };
}
