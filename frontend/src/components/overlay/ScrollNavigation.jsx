import { useEffect, useRef } from 'react';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Scroll-driven navigation. Wheel events on the background cycle through:
//   HOME → PROJECTS_LIST → ABOUT_STAGE → HOME
// Wheel/touch inside a panel marked data-scroll-trap (or a data-scrollable
// list) never changes section — it only scrolls that panel's content.

const CYCLE = [
  SCENE_STATES.HOME,
  SCENE_STATES.PROJECTS_LIST,
  SCENE_STATES.ABOUT_STAGE,
];

function isInsidePanelScroll(target) {
  if (!target || !target.closest) return false;
  return Boolean(
    target.closest('[data-scroll-trap="true"]') ||
      target.closest('[data-scrollable="true"]')
  );
}

export default function ScrollNavigation() {
  const { state, goHome, goProjects, goAbout } = useSceneState();
  const lockedUntil = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const setTo = (next) => {
      if (next === SCENE_STATES.HOME) goHome();
      else if (next === SCENE_STATES.PROJECTS_LIST) goProjects();
      else if (next === SCENE_STATES.ABOUT_STAGE) goAbout();
    };

    const advance = (dy) => {
      const now = performance.now();
      if (now < lockedUntil.current) return;
      if (Math.abs(dy) < 12) return;

      const cur = stateRef.current;
      const inCycle = CYCLE.includes(cur);
      const cycleIdx = inCycle ? CYCLE.indexOf(cur) : 0;
      let nextIdx;
      if (dy > 0) {
        nextIdx = (cycleIdx + 1) % CYCLE.length;
      } else {
        nextIdx = (cycleIdx - 1 + CYCLE.length) % CYCLE.length;
      }
      const next = CYCLE[nextIdx];
      if (next === cur) return;
      setTo(next);
      lockedUntil.current = now + 1200;
    };

    const onWheel = (e) => {
      // Hovering projects/about panel content: scroll the list only.
      if (isInsidePanelScroll(e.target)) return;
      advance(e.deltaY);
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      if (isInsidePanelScroll(e.target)) return;
      const currentY = e.touches?.[0]?.clientY ?? 0;
      const dy = touchStartY - currentY;
      if (Math.abs(dy) < 60) return;
      advance(dy);
      touchStartY = currentY;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [goHome, goProjects, goAbout]);

  return null;
}
