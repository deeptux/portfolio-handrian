import React, { useEffect, useRef } from 'react';
import { X, Mail, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { ABOUT_CONTENT } from '@/data/data2';
import { ABOUT_PANEL } from '@/constants/testIds';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import useIsMobile from '@/hooks/useIsMobile';

// Left-sliding profile panel (desktop) / bottom-sheet (mobile). Holds
// greeting, bio, stats grid, and contact/social links.
export default function AboutPanel() {
  const rootRef = useRef();
  const isMobile = useIsMobile();
  const { state, goHome } = useSceneState();
  const isOpen = state === SCENE_STATES.ABOUT_STAGE;

  useEffect(() => {
    if (!rootRef.current) return;
    if (isMobile) {
      gsap.set(rootRef.current, { xPercent: 0, yPercent: isOpen ? 0 : 100, opacity: isOpen ? 1 : 0 });
    } else {
      gsap.set(rootRef.current, { yPercent: 0, xPercent: isOpen ? 0 : -100, opacity: isOpen ? 1 : 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (!rootRef.current) return;
    const axis = isMobile ? 'yPercent' : 'xPercent';
    const off = isMobile ? 100 : -100;
    gsap.to(rootRef.current, {
      [axis]: isOpen ? 0 : off,
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
      data-testid={ABOUT_PANEL.root}
      className="fixed z-40 pointer-events-auto left-0 bottom-0 md:top-0 w-full h-[85vh] md:h-screen md:w-[540px] lg:w-[42vw]"
      aria-label="About Handrian"
      aria-hidden={!isOpen}
    >
      <div className="cyber-panel h-full border-t md:border-t-0 md:border-r border-[#ff0055]/20 flex flex-col rounded-t-2xl md:rounded-none">
        {/* Grab handle (mobile bottom-sheet) */}
        <div className="md:hidden pt-2 pb-1 flex items-center justify-center">
          <span className="w-10 h-1 rounded-full bg-white/15" aria-hidden />
        </div>

        <div className="seam" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-4 md:pt-24 pb-3 md:pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.32em] text-[#ff0055] uppercase text-glow-magenta">
              // Dossier
            </div>
            <h2
              data-testid={ABOUT_PANEL.title}
              className="font-display uppercase text-3xl md:text-4xl font-semibold tracking-tight text-[#E0E0FF] mt-1"
            >
              {ABOUT_CONTENT.greeting}
            </h2>
          </div>
          <button
            onClick={goHome}
            data-testid={ABOUT_PANEL.closeBtn}
            aria-label="Close about panel"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#00f0ff]/60 text-[#E0E0FF] hover:text-[#00f0ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8" data-scrollable="true">
          <div className="font-mono text-xs tracking-[0.22em] uppercase text-[#00f0ff]">
            {ABOUT_CONTENT.role}
          </div>

          <div data-testid={ABOUT_PANEL.bio} className="mt-6 space-y-4">
            {ABOUT_CONTENT.bio.map((paragraph, i) => (
              <p key={i} className="font-mono text-sm leading-relaxed text-[#E0E0FF]/85">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Stats grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {ABOUT_CONTENT.stats.map((s, i) => (
              <div
                key={i}
                className={`tape-cut-sm p-4 border ${
                  i % 2 === 0 ? 'border-[#00f0ff]/25' : 'border-[#ff0055]/25'
                } bg-white/[0.02]`}
              >
                <div
                  className="font-display text-3xl md:text-4xl font-semibold tracking-tight"
                  style={{ color: i % 2 === 0 ? '#00f0ff' : '#ff0055' }}
                >
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.24em] uppercase text-[#a5a5c0]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-10">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#ff0055]">
              // Reach out
            </div>
            <a
              href={`mailto:${ABOUT_CONTENT.contact}`}
              data-testid={ABOUT_PANEL.contactLink}
              className="mt-2 inline-flex items-center gap-3 font-display text-xl md:text-2xl tracking-tight text-[#E0E0FF] hover:text-[#00f0ff] transition-colors border-b border-white/10 hover:border-[#00f0ff]/60 pb-1"
            >
              <Mail className="w-5 h-5" />
              {ABOUT_CONTENT.contact}
            </a>
          </div>

          {/* Social list */}
          <div
            data-testid={ABOUT_PANEL.socialLinks}
            className="mt-8 grid grid-cols-2 gap-3"
          >
            {ABOUT_CONTENT.socials.map((s, i) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                data-testid={`about-social-${s.id}`}
                className="group flex items-center justify-between px-4 py-3 rounded-full border border-white/10 hover:border-[#00f0ff]/50 text-[#E0E0FF] hover:text-[#00f0ff] font-mono text-xs tracking-[0.22em] uppercase transition-colors"
              >
                <span>{s.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            ))}
          </div>

          {/* Signature */}
          <div className="mt-12 font-mono text-[10px] tracking-[0.32em] uppercase text-[#707090]">
            // signed - handrian // {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </aside>
  );
}
