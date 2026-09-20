import { useState, useCallback } from 'react';
import { SimulatorScenario, Trait } from '../types';
import { INITIAL_SIMULATOR_SCENARIOS } from '../data/initialData';

export function useSimulation(activePersonaTraits: Trait[]) {
  const [scenarios, setScenarios] = useState<SimulatorScenario[]>(INITIAL_SIMULATOR_SCENARIOS);
  const [unlockedScenarioIds, setUnlockedScenarioIds] = useState<string[]>(['scenario-1']);

  const getUnlockedScenarios = useCallback(
    () => scenarios.filter((s) => unlockedScenarioIds.includes(s.id)),
    [scenarios, unlockedScenarioIds]
  );

  const handleUnlockScenario = useCallback((scenarioId: string) => {
    setUnlockedScenarioIds((prev) => {
      if (prev.includes(scenarioId)) return prev;
      const idx = scenarios.findIndex((s) => s.id === scenarioId);
      if (idx === -1 || idx === 0) return prev;
      const prevId = scenarios[idx - 1].id;
      if (!prev.includes(prevId)) return prev;
      return [...prev, scenarioId];
    });
  }, [scenarios]);

  const handleCreateScenario = useCallback(
    (scenario: Omit<SimulatorScenario, 'id'>) => {
      const newScenario: SimulatorScenario = {
        ...scenario,
        id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setScenarios((prev) => [...prev, newScenario]);
      setUnlockedScenarioIds((ids) => ids.includes(newScenario.id) ? ids : [...ids, newScenario.id]);
    },
    []
  );

  return {
    scenarios,
    unlockedScenarioIds,
    getUnlockedScenarios,
    handleUnlockScenario,
    handleCreateScenario,
    setScenarios,
    setUnlockedScenarioIds,
  };
}