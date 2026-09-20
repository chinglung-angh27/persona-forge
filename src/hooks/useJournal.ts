import { useCallback } from 'react';
import {
  DailyMission,
  HabitItem,
  ReflectionEntry,
  EvolutionItem,
} from '../types';

interface UseJournalHandlersProps {
  updateActivePersona: (partial: Partial<any>) => void;
  activePersona: any;
}

export function useJournal({ updateActivePersona, activePersona }: UseJournalHandlersProps) {
  const handleToggleMission = useCallback(
    (id: string) => {
      updateActivePersona((p: any) => ({
        ...p,
        dailyMissions: p.dailyMissions.map((m: DailyMission) =>
          m.id === id ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' } : m
        ),
      }));
    },
    [updateActivePersona]
  );

  const handleAddMission = useCallback(
    (mission: DailyMission) => {
      updateActivePersona((p: any) => ({ ...p, dailyMissions: [mission, ...p.dailyMissions] }));
    },
    [updateActivePersona]
  );

  const handleAddEvolution = useCallback(
    (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => {
      const newItem: EvolutionItem = {
        ...item,
        id: `evo-${Date.now()}`,
        timestamp: 'Just now',
      };
      updateActivePersona((p: any) => ({ ...p, evolutionItems: [newItem, ...p.evolutionItems] }));
    },
    [updateActivePersona]
  );

  const handleToggleHabitDay = useCallback(
    (habitId: string, dayIndex: number) => {
      updateActivePersona((p: any) => ({
        ...p,
        habits: p.habits.map((h: HabitItem) => {
          if (h.id !== habitId) return h;
          const days = [...h.days];
          days[dayIndex] = !days[dayIndex];
          const streak = days[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1);
          return { ...h, days, streak };
        }),
      }));
    },
    [updateActivePersona]
  );

  const handleAddHabit = useCallback(
    (habit: HabitItem) => {
      updateActivePersona((p: any) => ({ ...p, habits: [...p.habits, habit] }));
    },
    [updateActivePersona]
  );

  const handleAddReflection = useCallback(
    (entry: ReflectionEntry) => {
      updateActivePersona((p: any) => ({ ...p, reflections: [entry, ...p.reflections] }));
    },
    [updateActivePersona]
  );

  const handleRecordSimulationResult = useCallback(
    (scenarioId: string, score: number, scenarios: any[]) => {
      if (score >= 70) {
        const idx = scenarios.findIndex((s) => s.id === scenarioId);
        if (idx >= 0 && idx < scenarios.length - 1) {
          const nextId = scenarios[idx + 1].id;
          // This will be handled by the simulation hook
        }
      }
      updateActivePersona((p: any) => {
        const newEvolution: EvolutionItem = {
          id: `evo-sim-${Date.now()}`,
          title: 'Crucible Test Completed',
          description: `Executed tactical response in simulation. Achieved ${score}% alignment with core archetype.`,
          icon: 'balance',
          timestamp: 'Just now',
          category: 'Simulation Audit',
          changeValue: `${score}% Match`,
        };
        return {
          ...p,
          evolutionItems: [newEvolution, ...p.evolutionItems],
          simulatorResults: [...p.simulatorResults, { scenarioId, score, ts: new Date().toISOString() }],
        };
      });
    },
    [updateActivePersona]
  );

  const handleGenerateReflection = useCallback(
    async (scenarioId: string, finalScore: number, finalVerdict: string, callLLM: any) => {
      try {
        const prompt = `Based on a simulation verdict of "${finalVerdict}" with alignment score ${finalScore}%, generate a journal reflection. Provide a prompt (1 sentence), content (2-3 sentences analyzing what happened), and a sentiment tag (constructive/stoic/breakthrough/neutral) and 2-3 tags. Respond JSON: {"prompt":"...","content":"...","sentiment":"constructive|stoic|breakthrough|neutral","tags":["...","..."]}`;
        const text = await callLLM({
          model: 'openai/gpt-4o-mini',
          contents: prompt,
          config: { maxOutputTokens: 256, temperature: 0.7 },
        });
        const parsed = JSON.parse(text.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}'));
        updateActivePersona((p: any) => ({
          ...p,
          reflections: [
            {
              id: `r-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              prompt: parsed.prompt || 'AI-Generated Reflection',
              content: parsed.content || 'No content generated.',
              sentiment: ['constructive', 'stoic', 'breakthrough', 'neutral'].includes(parsed.sentiment)
                ? parsed.sentiment
                : 'neutral',
              tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            },
            ...p.reflections,
          ],
        }));
      } catch (e) {
        console.error('Reflection generation failed:', e);
      }
    },
    [updateActivePersona]
  );

  const handleResetTraits = useCallback(() => {
    updateActivePersona((p: any) => ({
      ...p,
      traits: (p.traits || []).map((t: any) => ({ ...t, value: 50 })),
    }));
  }, [updateActivePersona]);

  return {
    handleToggleMission,
    handleAddMission,
    handleAddEvolution,
    handleToggleHabitDay,
    handleAddHabit,
    handleAddReflection,
    handleRecordSimulationResult,
    handleGenerateReflection,
    handleResetTraits,
  };
}