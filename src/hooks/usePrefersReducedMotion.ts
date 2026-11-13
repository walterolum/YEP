import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's motion preference. Used by decorative visuals so that the
 * ring, parallax and reveal effects can be disabled without relying only on CSS
 * media queries (which cannot stop pointer-driven movement).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
