/// <reference types="vite/client" />
// Register service worker for PWA/TWA support.
// Loaded lazily so it never blocks first paint.

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // skip in dev to avoid HMR conflicts

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('SW registration failed:', err));
  });
}
