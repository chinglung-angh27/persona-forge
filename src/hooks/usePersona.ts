import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Persona,
  DailyMission,
  HabitItem,
  ReflectionEntry,
  EvolutionItem,
  Trait,
  ReferenceItem,
  SimulatorScenario,
} from '../types';
import {
  loadPersonas,
  loadActivePersonaId,
  savePersonas,
  saveActivePersonaId,
  updateActivePersonaIn,
  seedPersona,
} from '../lib/personaStore';
import {
  INITIAL_TRAITS,
  INITIAL_DAILY_MISSIONS,
  INITIAL_HABITS,
  INITIAL_REFLECTIONS,
  INITIAL_EVOLUTION_ITEMS,
} from '../data/initialData';

const PERSONAS_KEY = 'pf_personas';
const ACTIVE_PERSONA_KEY = 'pf_activePersonaId';

export function usePersona() {
  const [personas, setPersonas] = useState<Persona[]>(() => loadPersonas());
  const [activePersonaId, setActivePersonaId] = useState<string>(() =>
    loadActivePersonaId(loadPersonas())
  );

  useEffect(() => {
    savePersonas(personas);
  }, [personas]);

  useEffect(() => {
    saveActivePersonaId(activePersonaId);
  }, [activePersonaId]);

  const activePersona = useMemo(
    () => personas.find((p) => p.id === activePersonaId) ?? personas[0],
    [personas, activePersonaId]
  );

  const updateActivePersona = useCallback(
    (partial: Partial<Persona> | ((p: Persona) => Persona), id?: string) => {
      setPersonas((prev) => updateActivePersonaIn(prev, id ?? activePersonaId, partial));
    },
    [activePersonaId]
  );

  const handleSwitchPersona = useCallback((id: string) => {
    setActivePersonaId(id);
  }, []);

  const handleCreatePersona = useCallback(
    (name: string, archetype: string, blendIds: string[]) => {
      const now = new Date().toISOString();
      const p: Persona = {
        id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        archetype,
        identityStatement: '',
        traits: INITIAL_TRAITS.map((t) => ({ ...t })),
        blendedReferenceIds: blendIds,
        dailyMissions: INITIAL_DAILY_MISSIONS.map((m) => ({ ...m })),
        habits: INITIAL_HABITS.map((h) => ({ ...h })),
        reflections: INITIAL_REFLECTIONS.map((r) => ({ ...r })),
        evolutionItems: INITIAL_EVOLUTION_ITEMS.map((e) => ({ ...e })),
        simulatorResults: [],
        createdAt: now,
        lastActiveAt: now,
        status: 'active',
      };
      setPersonas((prev) => [...prev, p]);
      setActivePersonaId(p.id);
    },
    []
  );

  const handleArchivePersona = useCallback(
    (id: string) => {
      updateActivePersona((p) => ({ ...p, status: 'archived' as const }), id);
    },
    [updateActivePersona]
  );

  const handleUpdatePersonaMeta = useCallback(
    (id: string, meta: { name: string; archetype: string; identityStatement: string }) => {
      updateActivePersona({ ...meta }, id);
    },
    [updateActivePersona]
  );

  // ponytail: purge nukes storage and reseeds via personaStore.seedPersona
  const handlePurgeData = useCallback(() => {
    localStorage.clear();
    const p = seedPersona();
    setPersonas([p]);
    setActivePersonaId(p.id);
  }, []);

  return {
    personas,
    activePersonaId,
    activePersona,
    setActivePersonaId,
    handleSwitchPersona,
    handleCreatePersona,
    handleArchivePersona,
    handleUpdatePersonaMeta,
    handlePurgeData,
    updateActivePersona,
  };
}