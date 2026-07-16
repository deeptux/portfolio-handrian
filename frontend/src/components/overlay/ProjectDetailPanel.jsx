import React, { useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, X } from 'lucide-react';
import gsap from 'gsap';
import { PROJECTS } from '@/data/data2';
import { PROJECT_DETAIL } from '@/constants/testIds';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Project deep dive — split viewport. Left side sits over the 3D deck (which
// dollies closer via the camera FSM). Right side is a native DOM document
// with markdown-style content + external link.
export default function ProjectDetailPanel() {
  const rootRef = useRef();
  const { state, activeProjectId, backFromDetail, goHome } = useSceneState();
  const isOpen = state === SCENE_STATES.PROJECT_DETAIL;
  const project = PROJECTS.find((p) => p.id === activeProjectId);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.set(rootRef.current, { opacity: 0, pointerEvents: 'none' });
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.to(rootRef.current, {
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      duration: 0.6,
      ease: 'power2.out',
    });
  }, [isOpen]);

  if (!project) {
    return (
      <div
        ref={rootRef}
        className="fixed inset-0 z-40"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex"
      data-testid={PROJECT_DETAIL.root}
      aria-hidden={!isOpen}
    >
      {/* LEFT — floating structural window over the deck */}
      <div className="hidden lg:flex w-[52%] items-center justify-center px-16 pointer-events-none">
        <div className="cyber-panel tape-cut p-6 max-w-[420px] w-full pointer-events-auto">
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
            // Live preview
          </div>
          <div className="mt-3 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-[#04050f] relative">
            {/* Fake terminal readout */}
            <div className="absolute inset-0 p-4 font-mono text-[11px] leading-relaxed text-[#00f0ff]">
              {project.screen.map((line, i) => (
                <div key={i} className="whitespace-nowrap">
                  <span className={i === 0 ? 'text-[' + project.accent + ']' : 'text-[#E0E0FF]'}>{line}</span>
                </div>
              ))}
              <div className="mt-2">
                <span className="text-[#707090]">$</span>
                <span className="caret" />
              </div>
            </div>
            {/* Chromatic side stripes */}
            <div className="absolute inset-y-0 right-0 w-1 bg-[#ff0055]" />
            <div className="absolute inset-y-0 right-1 w-1 bg-[#00f0ff]" />
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,0.35) 3px, transparent 4px)',
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={backFromDetail}
              data-testid={PROJECT_DETAIL.backBtn}
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-[#a5a5c0] hover:text-[#00f0ff] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              data-testid={PROJECT_DETAIL.visitBtn}
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-[#ff0055] hover:text-[#00f0ff] transition-colors"
            >
              Visit
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT — full native DOM document */}
      <aside className="ml-auto w-full lg:w-[48%] h-full cyber-panel border-l border-[#ff0055]/20 flex flex-col pointer-events-auto">
        <div className="seam" />
        <div className="flex items-center justify-between px-6 md:px-8 pt-20 md:pt-24 pb-3 md:pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={backFromDetail}
              data-testid={PROJECT_DETAIL.backBtn + '-header'}
              aria-label="Back to projects"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-[#00f0ff]/60 text-[#E0E0FF] hover:text-[#00f0ff] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-[#a5a5c0]">
              {project.year} · {project.role}
            </div>
          </div>
          <button
            onClick={goHome}
            data-testid={PROJECT_DETAIL.closeBtn}
            aria-label="Close project detail"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#ff0055]/60 text-[#E0E0FF] hover:text-[#ff0055] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 md:pb-10" data-scrollable="true">
          <h2
            data-testid={PROJECT_DETAIL.title}
            className="font-display uppercase font-bold text-3xl md:text-4xl lg:text-5xl leading-none tracking-tight text-[#E0E0FF]"
          >
            <span style={{ color: project.accent, textShadow: `0 0 18px ${project.accent}77` }}>
              {project.title}
            </span>
          </h2>
          <div className="mt-2 font-mono text-xs md:text-sm text-[#a5a5c0]">{project.tagline}</div>

          <div
            data-testid={PROJECT_DETAIL.tags}
            className="mt-5 md:mt-6 flex flex-wrap gap-2"
          >
            {project.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-white/10 text-[#E0E0FF]"
              >
                {t}
              </span>
            ))}
          </div>

          <p
            data-testid={PROJECT_DETAIL.description}
            className="mt-6 md:mt-8 font-mono text-[13px] md:text-sm leading-relaxed text-[#E0E0FF]/90"
          >
            {project.description}
          </p>

          <div className="mt-8 md:mt-10">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#00f0ff]">
              // highlights
            </div>
            <ul className="mt-3 space-y-2">
              {project.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-mono text-[13px] md:text-sm text-[#E0E0FF]/85"
                >
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: project.accent }}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="mt-10 md:mt-12 inline-flex items-center gap-3 px-5 md:px-6 py-2.5 md:py-3 tape-cut bg-[#030308]/70 border border-[#ff0055]/50 hover:border-[#00f0ff]/70 text-[#ff0055] hover:text-[#00f0ff] font-mono uppercase tracking-[0.24em] text-[11px] md:text-xs transition-colors"
          >
            Visit project
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </aside>
    </div>
  );
}
