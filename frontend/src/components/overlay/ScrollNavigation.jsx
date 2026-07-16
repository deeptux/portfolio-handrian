import { useEffect, useRef } from 'react';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Scroll-driven navigation. Wheel events on the background cycle through:
//   HOME → PROJECTS_LIST → ABOUT_STAGE → HOME
// If the wheel target is inside a scrollable panel (data-scrollable), the
// event is left alone so the panel scrolls its own content instead.
// A short lock (1.2s) prevents a single continuous scroll gesture from
// skipping past states.

const CYCLE = [
  SCENE_STATES.HOME,
  SCENE_STATES.PROJECTS_LIST,
  SCENE_STATES.ABOUT_STAGE,
];

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

    const onWheel = (e) => {
      // If the wheel gesture is on a scrollable panel content, let the panel
      // scroll normally.
      const target = e.target;
      if (target && target.closest && target.closest('[data-scrollable="true"]')) {
        // Only cycle when we're actually AT the top or bottom edge of the
        // scroll container.
        const cont = target.closest('[data-scrollable="true"]');
        const dy = e.deltaY;
        const atTop = cont.scrollTop <= 0;
        const atBottom = cont.scrollTop + cont.clientHeight >= cont.scrollHeight - 1;
        if (!((dy > 0 && atBottom) || (dy < 0 && atTop))) {
          return; // let container scroll
        }
      }

      const now = performance.now();
      if (now < lockedUntil.current) return;
      const dy = e.deltaY;
      if (Math.abs(dy) < 12) return;

      // Only cycle for the 3 core states; PROJECT_DETAIL is opened by
      // clicking a project item.
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

    // Use passive to not block native scroll but still receive the event
    window.addEventListener('wheel', onWheel, { passive: true });

    // Also support touch swipe on mobile (basic vertical detection)
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      const currentY = e.touches?.[0]?.clientY ?? 0;
      const dy = touchStartY - currentY;
      const target = e.target;
      if (target && target.closest && target.closest('[data-scrollable="true"]')) return;
      const now = performance.now();
      if (now < lockedUntil.current) return;
      if (Math.abs(dy) < 60) return;
      const cur = stateRef.current;
      const inCycle = CYCLE.includes(cur);
      const cycleIdx = inCycle ? CYCLE.indexOf(cur) : 0;
      let nextIdx;
      if (dy > 0) nextIdx = (cycleIdx + 1) % CYCLE.length;
      else nextIdx = (cycleIdx - 1 + CYCLE.length) % CYCLE.length;
      const next = CYCLE[nextIdx];
      if (next === cur) return;
      setTo(next);
      lockedUntil.current = now + 1200;
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
