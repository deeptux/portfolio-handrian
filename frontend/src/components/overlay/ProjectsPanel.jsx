import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { PROJECTS } from '@/data/data2';
import { PROJECTS_PANEL } from '@/constants/testIds';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import useIsMobile from '@/hooks/useIsMobile';

// Right-sliding project panel (desktop) / bottom-sheet (mobile). Displays
// project titles that hover-emissive and update the terminal deck's screen
// preview.
export default function ProjectsPanel() {
  const rootRef = useRef();
  const isMobile = useIsMobile();
  const {
    state,
    setHoveredProjectId,
    openProject,
    goHome,
  } = useSceneState();

  const isOpen = state === SCENE_STATES.PROJECTS_LIST;

  // Establish initial off-canvas position whenever breakpoint changes
  useEffect(() => {
    if (!rootRef.current) return;
    if (isMobile) {
      gsap.set(rootRef.current, { xPercent: 0, yPercent: isOpen ? 0 : 100, opacity: isOpen ? 1 : 0 });
    } else {
      gsap.set(rootRef.current, { yPercent: 0, xPercent: isOpen ? 0 : 100, opacity: isOpen ? 1 : 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (!rootRef.current) return;
    const axis = isMobile ? 'yPercent' : 'xPercent';
    gsap.to(rootRef.current, {
      [axis]: isOpen ? 0 : 100,
      duration: 1.05,
      ease: 'power3.inOut',
    });
    gsap.to(rootRef.current, {
      opacity: isOpen ? 1 : 0,
      duration: 0.55,
      ease: 'power2.out',
      delay: isOpen ? 0.1 : 0,
    });
  }, [isOpen, isMobile]);

  return (
    <aside
      ref={rootRef}
      data-testid={PROJECTS_PANEL.root}
      className="fixed z-40 pointer-events-auto right-0 bottom-0 md:top-0 w-full h-[85vh] md:h-screen md:w-[520px] lg:w-[38vw]"
      aria-label="Selected projects"
      aria-hidden={!isOpen}
    >
      <div className="cyber-panel h-full border-t md:border-t-0 md:border-l border-[#00f0ff]/20 flex flex-col rounded-t-2xl md:rounded-none">
        {/* Grab handle (mobile bottom-sheet) */}
        <div className="md:hidden pt-2 pb-1 flex items-center justify-center">
          <span className="w-10 h-1 rounded-full bg-white/15" aria-hidden />
        </div>

        <div className="seam" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-4 md:pt-24 pb-3 md:pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.32em] text-[#00f0ff] uppercase text-glow-cyan">
              // Log — 2087
            </div>
            <h2 className="font-display uppercase text-3xl md:text-4xl font-semibold tracking-tight text-[#E0E0FF] mt-1">
              Selected <span className="text-[#ff0055]">Projects</span>
            </h2>
          </div>
          <button
            onClick={goHome}
            data-testid={PROJECTS_PANEL.closeBtn}
            aria-label="Close projects panel"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#ff0055]/60 text-[#E0E0FF] hover:text-[#ff0055] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto px-6 md:px-8 py-3 md:py-4 space-y-3"
          data-testid={PROJECTS_PANEL.list}
          data-scrollable="true"
        >
          {PROJECTS.map((p, idx) => (
            <button
              key={p.id}
              data-testid={`${PROJECTS_PANEL.itemPrefix}${p.id}`}
              onMouseEnter={() => setHoveredProjectId(p.id)}
              onMouseLeave={() => setHoveredProjectId(null)}
              onFocus={() => setHoveredProjectId(p.id)}
              onBlur={() => setHoveredProjectId(null)}
              onClick={() => openProject(p.id)}
              className="group block w-full text-left px-5 py-4 rounded-2xl border border-white/5 hover:border-[#00f0ff]/40 bg-white/[0.015] hover:bg-[#00f0ff]/[0.03] transition-colors duration-200"
            >
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.28em] uppercase text-[#707090]">
                <span>#{String(idx + 1).padStart(2, '0')}</span>
                <span>{p.year}</span>
              </div>
              <div
                data-testid={`${PROJECTS_PANEL.titlePrefix}${p.id}`}
                className="mt-2 font-display uppercase text-2xl md:text-3xl font-semibold tracking-tight text-[#707090] group-hover:text-[#E0E0FF] transition-colors duration-200"
                style={{
                  textShadow: '0 0 0 transparent',
                }}
              >
                <span
                  className="group-hover:[text-shadow:_0_0_10px_rgba(0,240,255,0.55)] transition-[text-shadow] duration-200"
                >
                  {p.title}
                </span>
              </div>
              <div className="mt-1 font-mono text-xs text-[#a5a5c0]/80 group-hover:text-[#E0E0FF]/90 transition-colors duration-200">
                {p.tagline}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border border-white/10 text-[#a5a5c0]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Footer status */}
        <div className="border-t border-white/5 px-6 md:px-8 py-3 md:py-4 flex items-center justify-between font-mono text-[10px] tracking-[0.28em] uppercase text-[#707090]">
          <span>{PROJECTS.length} entries</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            Deck online
          </span>
        </div>
      </div>
    </aside>
  );
}
