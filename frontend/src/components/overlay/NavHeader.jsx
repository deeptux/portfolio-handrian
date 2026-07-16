import React from 'react';
import { Mail, Volume2, VolumeX } from 'lucide-react';
import { NAV } from '@/constants/testIds';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';
import { useAudio } from '@/hooks/useAudio';

// Rounded-pill glassmorphic navigation header. Buttons trigger FSM state
// changes on the scene through the SceneStateProvider.
export default function NavHeader() {
  const { state, goHome, goProjects, goAbout } = useSceneState();
  const { muted, toggleMute, click } = useAudio();

  const withClick = (fn) => () => {
    click({ freq: 620, dur: 0.06, gain: 0.05 });
    fn();
  };

  const NavPill = ({ children, active, onClick, testId, ariaLabel }) => (
    <button
      onClick={onClick}
      data-testid={testId}
      aria-label={ariaLabel}
      className={`px-3 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-mono uppercase tracking-[0.18em] transition-colors duration-200 ${
        active
          ? 'text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-glow-cyan'
          : 'text-[#a5a5c0] hover:text-white border border-transparent hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header
      className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-1.5rem)]"
      data-testid={NAV.root}
    >
      <div className="pill flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Brand */}
        <button
          onClick={withClick(goHome)}
          data-testid={NAV.brand}
          className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Handrian home"
        >
          <span className="relative inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#030308] border border-[#00f0ff]/50 text-[#00f0ff] font-mono text-[9px] md:text-[10px] tracking-widest">
            HD
            <span className="absolute -inset-0.5 rounded-full border border-[#ff0055]/50 pointer-events-none" />
          </span>
          <span className="hidden md:block font-mono text-xs tracking-[0.24em] text-[#E0E0FF]/90">
            HANDRIAN
          </span>
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-white/10 mx-0.5 md:mx-1 hidden sm:inline-block" aria-hidden />

        {/* Center */}
        <NavPill
          testId={NAV.homeBtn}
          ariaLabel="Home"
          active={state === SCENE_STATES.HOME}
          onClick={withClick(goHome)}
        >
          <span className="hidden sm:inline">Home</span>
          <span className="sm:hidden">H</span>
        </NavPill>
        <NavPill
          testId={NAV.projectsBtn}
          ariaLabel="Projects"
          active={state === SCENE_STATES.PROJECTS_LIST || state === SCENE_STATES.PROJECT_DETAIL}
          onClick={withClick(goProjects)}
        >
          <span className="hidden sm:inline">Projects</span>
          <span className="sm:hidden">P</span>
        </NavPill>
        <NavPill
          testId={NAV.aboutBtn}
          ariaLabel="About"
          active={state === SCENE_STATES.ABOUT_STAGE}
          onClick={withClick(goAbout)}
        >
          <span className="hidden sm:inline">About</span>
          <span className="sm:hidden">A</span>
        </NavPill>

        <span className="w-px h-6 bg-white/10 mx-0.5 md:mx-1 hidden sm:inline-block" aria-hidden />

        {/* Right */}
        <a
          href="#resume"
          data-testid={NAV.resumeBtn}
          className="hidden sm:inline-flex px-4 md:px-5 py-1.5 rounded-full text-sm font-mono uppercase tracking-[0.18em] text-[#E0E0FF] border border-white/10 hover:border-[#ff0055]/60 hover:text-[#ff0055] transition-colors items-center"
        >
          Resume
        </a>
        <button
          onClick={() => {
            click({ freq: muted ? 880 : 220, dur: 0.09, gain: 0.06 });
            toggleMute();
          }}
          data-testid="nav-mute-btn"
          aria-label={muted ? 'Enable ambient sound' : 'Mute ambient sound'}
          aria-pressed={!muted}
          className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full border transition-colors ${
            muted
              ? 'border-white/10 text-[#707090] hover:text-[#E0E0FF]'
              : 'border-[#00f0ff]/60 text-[#00f0ff] text-glow-cyan'
          }`}
        >
          {muted ? (
            <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          )}
        </button>
        <a
          href="mailto:hello@handrian.space"
          data-testid={NAV.contactBtn}
          aria-label="Contact via email"
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-[#00f0ff]/70 text-[#E0E0FF] hover:text-[#00f0ff] transition-colors"
        >
          <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </a>
      </div>
    </header>
  );
}
