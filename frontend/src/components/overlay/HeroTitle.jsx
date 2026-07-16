import React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { HERO } from '@/constants/testIds';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Hero overlay used in HOME state — chromatic glitch title + subtitle +
// scroll hint + primary CTA. Hidden (fade) when the scene is in any other
// state so the panels can breathe.
export default function HeroTitle() {
  const { state, goProjects } = useSceneState();
  const visible = state === SCENE_STATES.HOME;

  return (
    <>
      {/* Top hero title strip */}
      <div
        className={`fixed inset-x-0 top-24 md:top-28 z-30 pointer-events-none flex flex-col items-center px-4 transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!visible}
      >
        {/* Small tag */}
        <div className="pill px-3 md:px-4 py-1.5 mb-4 md:mb-5 pointer-events-auto max-w-full">
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] md:tracking-[0.3em] text-[#00f0ff] text-glow-cyan whitespace-nowrap">
            //  HANDRIAN . SPACE  //  ONLINE
          </span>
        </div>

        {/* Chromatic glitch title */}
        <h1
          data-testid={HERO.title}
          data-text="HANDRIAN"
          className="glitch-title hero-in font-display font-bold uppercase text-[3rem] sm:text-6xl md:text-7xl lg:text-[7.5rem] leading-none select-none text-center"
        >
          HANDRIAN
        </h1>

        <div
          data-testid={HERO.subtitle}
          className="mt-4 pill px-4 md:px-5 py-2 pointer-events-auto flex items-center gap-2 md:gap-3 max-w-[calc(100vw-2rem)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-pulse flex-shrink-0" />
          <span className="font-mono text-[10px] md:text-xs tracking-[0.16em] md:tracking-[0.22em] text-[#E0E0FF]/85 uppercase text-center">
            <span className="hidden sm:inline">Creative Technologist · Solutions Architect · Full-Stack/Software Dev</span>
            <span className="sm:hidden">Creative Technologist · Full-Stack/Software Dev</span>
          </span>
        </div>
      </div>

      {/* Bottom CTA + scroll hint */}
      <div
        className={`fixed inset-x-0 bottom-16 md:bottom-20 z-30 pointer-events-none flex flex-col items-center px-4 transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!visible}
      >
        <button
          onClick={goProjects}
          data-testid={HERO.enterBtn}
          className="pointer-events-auto group tape-cut inline-flex items-center gap-2 md:gap-3 px-5 md:px-6 py-2.5 md:py-3 bg-[#030308]/70 border border-[#00f0ff]/50 hover:border-[#ff0055]/70 backdrop-blur-xl text-[#00f0ff] hover:text-[#ff0055] font-mono uppercase tracking-[0.2em] md:tracking-[0.24em] text-[11px] md:text-xs transition-colors duration-200"
        >
          Enter the deck
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        <div
          data-testid={HERO.scrollHint}
          className="mt-3 md:mt-4 flex flex-col items-center gap-1 text-[#707090] pointer-events-none"
        >
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] md:tracking-[0.3em] uppercase">
            Click the deck ▸ Projects · Click the gate ▸ About
          </span>
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] md:tracking-[0.3em] uppercase opacity-70">
            Scroll to cycle
          </span>
          <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" />
        </div>
      </div>
    </>
  );
}
