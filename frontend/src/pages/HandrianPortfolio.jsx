import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import SceneCanvas from '@/components/scene/SceneCanvas';
import NavHeader from '@/components/overlay/NavHeader';
import HeroTitle from '@/components/overlay/HeroTitle';
import ProjectsPanel from '@/components/overlay/ProjectsPanel';
import ProjectDetailPanel from '@/components/overlay/ProjectDetailPanel';
import AboutPanel from '@/components/overlay/AboutPanel';
import CustomCursor from '@/components/overlay/CustomCursor';
import BootLoader from '@/components/overlay/BootLoader';
import ScrollNavigation from '@/components/overlay/ScrollNavigation';
import { SceneStateProvider, useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import { AudioProvider } from '@/hooks/useAudio';

function StatusBar() {
  const { state } = useSceneState();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, []);

  const stateLabel = {
    [SCENE_STATES.HOME]: 'HOME',
    [SCENE_STATES.PROJECTS_LIST]: 'PROJECTS',
    [SCENE_STATES.PROJECT_DETAIL]: 'DETAIL',
    [SCENE_STATES.ABOUT_STAGE]: 'ABOUT',
  }[state];

  return (
    <div
      className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-30 pointer-events-none flex items-center gap-2 md:gap-4 font-mono text-[9px] md:text-[10px] tracking-[0.22em] md:tracking-[0.28em] uppercase text-[#707090]"
      data-testid="status-bar"
    >
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
        <span className="hidden sm:inline">UPLINK · STABLE</span>
        <span className="sm:hidden">UPLINK</span>
      </span>
      <span className="w-px h-3 md:h-4 bg-white/10" />
      <span>STATE: {stateLabel}</span>
      <span className="w-px h-3 md:h-4 bg-white/10 hidden sm:inline" />
      <span className="hidden sm:inline">{clock}</span>
    </div>
  );
}

function FrameCorners() {
  // Cyberpunk frame corners around the viewport
  const cornerBase = 'absolute w-5 h-5 md:w-8 md:h-8 border-[#00f0ff]/40';
  return (
    <div className="fixed inset-4 md:inset-6 pointer-events-none z-30" aria-hidden>
      <div className={`${cornerBase} border-t border-l top-0 left-0`} />
      <div className={`${cornerBase} border-t border-r top-0 right-0`} />
      <div className={`${cornerBase} border-b border-l bottom-0 left-0`} />
      <div className={`${cornerBase} border-b border-r bottom-0 right-0`} />
    </div>
  );
}

function SideMeta() {
  return (
    <div
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none font-mono text-[9px] tracking-[0.35em] uppercase text-[#707090] flex-col items-center gap-2"
      style={{ writingMode: 'vertical-rl' }}
      aria-hidden
    >
      <span>lat 22.28° · lng 114.15°</span>
      <span className="h-8 w-px bg-white/10" />
      <span>ver 3.11.24 · handrian.space</span>
    </div>
  );
}

function LeftMeta() {
  return (
    <div
      className="hidden lg:flex fixed left-6 top-1/2 z-30 pointer-events-none font-mono text-[9px] tracking-[0.35em] uppercase text-[#707090] flex-col items-center gap-2"
      style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}
      aria-hidden
    >
      <span>build.deck.03 · neon.grid</span>
      <span className="h-8 w-px bg-white/10" />
      <span>coord //-neo-kowloon-district-7</span>
    </div>
  );
}

function Layout() {
  return (
    <>
      {/* WebGL scene canvas — beneath everything */}
      <SceneCanvas />

      {/* Global background effects */}
      <div className="noise-overlay" aria-hidden />
      <div className="crt-vignette" aria-hidden />
      <div className="scanlines" aria-hidden />

      {/* Frame + meta */}
      <FrameCorners />
      <SideMeta />
      <LeftMeta />

      {/* DOM overlays */}
      <NavHeader />
      <HeroTitle />
      <ProjectsPanel />
      <ProjectDetailPanel />
      <AboutPanel />
      <StatusBar />

      {/* Scroll-driven state machine cycler */}
      <ScrollNavigation />

      {/* Custom cursor */}
      <CustomCursor />
    </>
  );
}

export default function HandrianPortfolio() {
  const [booted, setBooted] = useState(false);

  // Wire Lenis for panel content smooth scrolling — Lenis on window level so
  // internal overflow-y-auto containers benefit uniformly.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true,
      // We disable Lenis on the body since body has overflow-hidden, but keep
      // the instance for future scroll-triggered animations.
    });

    let raf;
    function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <SceneStateProvider>
      <AudioProvider>
        <div className="w-screen h-screen overflow-hidden text-[#E0E0FF]" data-testid="portfolio-root">
          <Layout />
          {!booted && <BootLoader onComplete={() => setBooted(true)} />}
        </div>
      </AudioProvider>
    </SceneStateProvider>
  );
}
