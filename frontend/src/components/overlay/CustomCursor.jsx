import React, { useEffect, useRef, useState } from 'react';
import { CURSOR } from '@/constants/testIds';

// Custom cursor: two elements — a tiny cyan dot that snaps directly to the
// mouse (via transform on every mousemove) and a lagging ring that lerps
// toward it. Both switch styles on hover over interactive controls.
export default function CustomCursor() {
  const dotRef = useRef();
  const ringRef = useRef();
  const [active, setActive] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Detect hover over interactive elements (DOM) or 3D scene hotspots
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const sceneHover = document.body.getAttribute('data-scene-hover');
      if (sceneHover) {
        setActive(true);
      } else if (el) {
        const interactive =
          el.closest('button') ||
          el.closest('a') ||
          el.closest('[role="button"]') ||
          el.closest('[data-cursor="hover"]');
        setActive(!!interactive);
      }
    };
    window.addEventListener('mousemove', onMove);

    // Also poll body attribute in case R3F updates without triggering mousemove
    const attrObserver = new MutationObserver(() => {
      const sceneHover = document.body.getAttribute('data-scene-hover');
      if (sceneHover) setActive(true);
    });
    attrObserver.observe(document.body, { attributes: true, attributeFilter: ['data-scene-hover'] });

    let raf;
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.18;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      attrObserver.disconnect();
    };
  }, []);

  // Disable custom cursor on touch devices
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window);

  if (isTouch) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" data-testid={CURSOR.dot} />
      <div
        ref={ringRef}
        className={`cursor-ring ${active ? 'active' : ''}`}
        data-testid={CURSOR.ring}
      />
    </>
  );
}
