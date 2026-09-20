import { useState, useEffect, useCallback } from 'react';
import { ViewMode } from '../types';

export function useNavigation(initialView: ViewMode, activePersonaId: string, personas: any[]) {
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);

  // Restore active persona from ?persona=<id> on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('persona');
    if (pid && personas.some((p) => p.id === pid)) {
      // This will be handled by the parent component calling setActivePersonaId
    }
  }, [personas]);

  // Reflect active persona in the URL — but skip if the URL already carries it,
  // so we never clobber a ?persona= the user opened with (e.g. a shared link).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('persona') === activePersonaId) return;
    url.searchParams.set('persona', activePersonaId);
    window.history.replaceState({}, '', url.toString());
  }, [activePersonaId]);

  const handleNavigate = useCallback((view: ViewMode) => {
    setCurrentView(view);
  }, []);

  return { currentView, setCurrentView, handleNavigate };
}