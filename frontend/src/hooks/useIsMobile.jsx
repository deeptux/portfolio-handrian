import { useEffect, useState } from 'react';

// Returns true when the current viewport is below the given breakpoint (px).
// Defaults to Tailwind's md (768). Useful for choosing panel slide axis
// (bottom-sheet on mobile vs side-sheet on desktop).
export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [breakpoint]);

  return isMobile;
}
