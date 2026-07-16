import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// Cyberpunk boot-sequence loader. Displays a full-screen terminal-style
// overlay on first paint, streams a series of boot lines, fills a progress
// bar, then fades out to reveal the scene beneath.

const BOOT_LINES = [
  '> handrian.deck // cold boot',
  '> checking rig integrity ................ [ok]',
  '> mounting neon-grid ..................... [ok]',
  '> compiling shaders/phosphor.glsl ........ [ok]',
  '> compiling shaders/glitch.glsl .......... [ok]',
  '> spawning particle field (400 nodes) .... [ok]',
  '> attaching cursor light .................. [ok]',
  '> engaging camera rig ..................... [ok]',
  '> welcome, operator.',
];

export default function BootLoader({ onComplete }) {
  const rootRef = useRef();
  const barRef = useRef();
  const completeCbRef = useRef(onComplete);
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Keep the latest onComplete callback in a ref so the fade effect doesn't
  // need to depend on it (and thus doesn't re-create a new GSAP timeline on
  // every parent render).
  useEffect(() => {
    completeCbRef.current = onComplete;
  }, [onComplete]);

  // Stream boot lines. Uses a ref-based index to guard against React
  // StrictMode double-invoking effects in development. Pure state updates
  // only — no side-effects inside the setState reducer.
  useEffect(() => {
    let cancelled = false;
    let timer;
    let i = 0;
    setLines([]);
    setProgress(0);
    setDone(false);
    const push = () => {
      if (cancelled) return;
      if (i >= BOOT_LINES.length) {
        timer = setTimeout(() => !cancelled && setDone(true), 160);
        return;
      }
      const capturedI = i;
      setLines((prev) => {
        // If some other invocation already pushed this index, skip
        if (prev.length > capturedI) return prev;
        return [...prev, BOOT_LINES[capturedI]];
      });
      setProgress(Math.round(((capturedI + 1) / BOOT_LINES.length) * 100));
      i += 1;
      timer = setTimeout(push, 90 + Math.random() * 60);
    };
    timer = setTimeout(push, 160);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Fade out after boot completes
  useEffect(() => {
    if (!done || !rootRef.current) return;
    const el = rootRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        completeCbRef.current?.();
      },
    });
    tl.to(el, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      delay: 0.15,
      onComplete: () => {
        el.style.pointerEvents = 'none';
      },
    });
    return () => {
      tl.kill();
    };
  }, [done]);

  return (
    <div
      ref={rootRef}
      data-testid="boot-loader"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#030308]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Corner brackets */}
      <div className="absolute inset-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00f0ff]/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00f0ff]/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00f0ff]/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00f0ff]/60" />
      </div>

      {/* Scanline overlay + noise */}
      <div className="absolute inset-0 opacity-40 pointer-events-none scanlines" />
      <div className="absolute inset-0 pointer-events-none noise-overlay" />

      {/* Center wireframe */}
      <div className="w-[min(560px,86vw)]">
        {/* Small header */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em] uppercase text-[#00f0ff] mb-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            handrian.deck / v3.11.24
          </span>
          <span className="text-[#707090]">neo-kowloon</span>
        </div>

        <div className="relative border border-white/10 bg-black/70 backdrop-blur-md p-5 sm:p-6 tape-cut">
          {/* Big glitch mini-title */}
          <div
            className="glitch-title font-display font-bold uppercase text-3xl sm:text-4xl leading-none tracking-tight text-[#E0E0FF]"
            data-text="INITIALIZING"
          >
            INITIALIZING
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.32em] uppercase text-[#a5a5c0]">
            // stand by while the deck warms up
          </div>

          {/* Boot lines */}
          <div className="mt-5 font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#E0E0FF]/85 min-h-[168px] whitespace-pre-wrap break-words">
            {lines.map((l, i) => (
              <div
                key={i}
                className={i === lines.length - 1 ? 'text-[#00f0ff]' : ''}
                data-testid={`boot-line-${i}`}
              >
                {l}
              </div>
            ))}
            <span className="caret" />
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.28em] uppercase text-[#707090] mb-1.5">
              <span>uplink</span>
              <span data-testid="boot-progress-label">{progress}%</span>
            </div>
            <div className="relative w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                ref={barRef}
                className="absolute inset-y-0 left-0 bg-[#00f0ff] transition-[width] duration-150"
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 12px rgba(0,240,255,0.7)',
                }}
                data-testid="boot-progress-bar"
              />
              <div
                className="absolute inset-y-0 left-0 bg-[#ff0055] mix-blend-screen"
                style={{
                  width: `${Math.max(0, progress - 3)}%`,
                  opacity: 0.4,
                }}
              />
            </div>
          </div>
        </div>

        {/* Below the panel */}
        <div className="mt-4 flex items-center justify-between font-mono text-[9px] tracking-[0.32em] uppercase text-[#707090]">
          <span>lat 22.28° · lng 114.15°</span>
          <span>build.deck.03</span>
        </div>
      </div>
    </div>
  );
}
