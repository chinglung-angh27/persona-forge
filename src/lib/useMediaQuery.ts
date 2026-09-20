/// <reference types="vite/client" />
// Reactive matchMedia hook + width helpers.
// Returns true if the query matches. SSR-safe (no window reference at import time).

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // ponytail: addEventListener is the modern path; legacy Safari (iOS < 14) needed addListener, out of scope.
    mql.addEventListener('change', handler);
    setMatches(mql.matches); // sync once on mount in case state was stale
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ponytail: breakpoint chosen to align with Tailwind md (≥768px). <768px is mobile.
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');
