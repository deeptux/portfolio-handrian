import { useEffect, useRef } from 'react';
import { useSceneState, SCENE_STATES } from '@/hooks/useSceneState';

// Scroll-driven navigation. Wheel outside [data-scrollable] lists cycles:
//   HOME → PROJECTS_LIST → ABOUT_STAGE → HOME
// Wheel over a scrollable list only moves that list — never changes section.

const CYCLE = [
  SCENE_STATES.HOME,
  SCENE_STATES.PROJECTS_LIST,
  SCENE_STATES.ABOUT_STAGE,
];

function findScrollableFromEvent(e) {
  if (typeof e.composedPath === 'function') {
    const hit = e.composedPath().find(
      (n) => n instanceof Element && n.getAttribute('data-scrollable') === 'true'
    );
    if (hit) return hit;
  }

  const fromTarget =
    e.target instanceof Element
      ? e.target.closest('[data-scrollable="true"]')
      : null;
  if (fromTarget) return fromTarget;

  if (
    typeof document !== 'undefined' &&
    Number.isFinite(e.clientX) &&
    Number.isFinite(e.clientY)
  ) {
    const under = document.elementFromPoint(e.clientX, e.clientY);
    if (under?.closest) {
      return under.closest('[data-scrollable="true"]');
    }
  }

  return null;
}

function scrollList(container, deltaY) {
  if (!container) return;
  const max = container.scrollHeight - container.clientHeight;
  if (max <= 0) return;
  container.scrollTop = Math.min(max, Math.max(0, container.scrollTop + deltaY));
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
      const scrollable = findScrollableFromEvent(e);
      if (scrollable) {
        // Stay on this section; drive the list ourselves so nested scroll
        // still works even if another library called preventDefault.
        scrollList(scrollable, e.deltaY);
        return;
      }
      advance(e.deltaY);
    };

    // Capture so we decide before other window-level wheel handlers.
    window.addEventListener('wheel', onWheel, { passive: true, capture: true });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      const t = e.touches?.[0];
      const fakeEvent = {
        composedPath: e.composedPath?.bind(e),
        target: e.target,
        clientX: t?.clientX,
        clientY: t?.clientY,
      };
      const scrollable = findScrollableFromEvent(fakeEvent);
      const currentY = t?.clientY ?? 0;
      const dy = touchStartY - currentY;
      if (scrollable) {
        if (Math.abs(dy) >= 2) {
          scrollList(scrollable, dy);
          touchStartY = currentY;
        }
        return;
      }
      if (Math.abs(dy) < 60) return;
      advance(dy);
      touchStartY = currentY;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
    };
  }, [goHome, goProjects, goAbout]);

  return null;
}
