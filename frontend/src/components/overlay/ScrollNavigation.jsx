import { useEffect, useRef } from 'react';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Scroll-driven navigation. Wheel events outside panel lists cycle through:
//   HOME → PROJECTS_LIST → ABOUT_STAGE → HOME
// When the cursor is over a [data-scrollable="true"] list, wheel/touch only
// scrolls that list — never changes section (including at top/bottom edges).

const CYCLE = [
  SCENE_STATES.HOME,
  SCENE_STATES.PROJECTS_LIST,
  SCENE_STATES.ABOUT_STAGE,
];

function elementUnderPointer(clientX, clientY, fallbackTarget) {
  if (typeof document !== 'undefined' && Number.isFinite(clientX) && Number.isFinite(clientY)) {
    const el = document.elementFromPoint(clientX, clientY);
    if (el) return el;
  }
  return fallbackTarget;
}

function isInsideScrollableList(el) {
  if (!el || !el.closest) return false;
  return Boolean(el.closest('[data-scrollable="true"]'));
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
      const under = elementUnderPointer(e.clientX, e.clientY, e.target);
      // Cursor over projects/about scrollable list → list scroll only.
      if (isInsideScrollableList(under)) return;
      // Cursor outside the list (panel chrome, canvas, etc.) → section cycle.
      advance(e.deltaY);
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      const t = e.touches?.[0];
      const under = elementUnderPointer(t?.clientX, t?.clientY, e.target);
      if (isInsideScrollableList(under)) return;
      const currentY = t?.clientY ?? 0;
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
