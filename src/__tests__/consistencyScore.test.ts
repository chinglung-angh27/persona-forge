import { describe, it, expect } from 'vitest';
import {
  DailyMission,
  HabitItem,
  ReflectionEntry,
  EvolutionItem,
} from '../types';

interface TestPersona {
  dailyMissions: DailyMission[];
  habits: HabitItem[];
  reflections: ReflectionEntry[];
  evolutionItems: EvolutionItem[];
}

function calculateConsistencyScore(persona: TestPersona): number {
  const dailyMissions = persona.dailyMissions ?? [];
  const habits = persona.habits ?? [];
  const reflections = persona.reflections ?? [];
  const evolutionItems = persona.evolutionItems ?? [];

  const missionDone = dailyMissions.filter((m) => m.status === 'completed').length;
  const missionPct = dailyMissions.length ? (missionDone / dailyMissions.length) * 100 : 0;

  const habitDays = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
  const habitTarget = habits.reduce((sum, h) => sum + h.targetPerWeek, 0); // targetPerWeek IS the weekly target
  const habitPct = habitTarget ? Math.min(100, (habitDays / habitTarget) * 100) : 0;

  const reflectionPct = Math.min(100, reflections.length * 10);

  const simScores = evolutionItems
    .filter((e) => e.category === 'Simulation Audit')
    .map((e) => parseInt(e.changeValue ?? '0', 10) || 0)
    .filter((n) => n > 0);
  const simPct = simScores.length
    ? simScores.reduce((a, b) => a + b, 0) / simScores.length
    : 0;

  const score = Math.round(
    missionPct * 0.35 + habitPct * 0.35 + reflectionPct * 0.15 + simPct * 0.15
  );
  return Math.max(0, Math.min(100, score));
}

describe('consistencyScore calculation', () => {
  it('returns 0 for empty persona', () => {
    const persona: TestPersona = {
      dailyMissions: [],
      habits: [],
      reflections: [],
      evolutionItems: [],
    };
    expect(calculateConsistencyScore(persona)).toBe(0);
  });

  it('weights missions 35%, habits 35%, reflections 15%, sim 15%', () => {
    const persona: TestPersona = {
      dailyMissions: [
        { id: 'm1', title: 't', description: 'd', status: 'completed', category: 'c', xp: 100 },
        { id: 'm2', title: 't', description: 'd', status: 'pending', category: 'c', xp: 100 },
      ],
      habits: [
        { id: 'h1', name: 'h', streak: 7, targetPerWeek: 7, days: [true, true, true, true, true, true, true], icon: 'i', category: 'c' },
      ],
      reflections: [{ id: 'r1', date: '2026-01-01', prompt: 'p', content: 'c', sentiment: 'neutral', tags: [] }],
      evolutionItems: [
        { id: 'e1', title: 't', description: 'd', icon: 'i', timestamp: 'now', category: 'Simulation Audit', changeValue: '80%' },
      ],
    };
    // missionPct = 50, habitPct = 100 (7 days / 7 target), reflectionPct = 10, simPct = 80
    // 50*0.35 + 100*0.35 + 10*0.15 + 80*0.15 = 17.5 + 35 + 1.5 + 12 = 66
    expect(calculateConsistencyScore(persona)).toBe(66);
  });

  it('clamps at 100', () => {
    const persona: TestPersona = {
      dailyMissions: [{ id: 'm1', title: 't', description: 'd', status: 'completed', category: 'c', xp: 100 }],
      habits: [
        { id: 'h1', name: 'h', streak: 7, targetPerWeek: 7, days: [true, true, true, true, true, true, true], icon: 'i', category: 'c' },
      ],
      reflections: Array(10).fill({ id: 'r', date: '2026-01-01', prompt: 'p', content: 'c', sentiment: 'neutral', tags: [] }),
      evolutionItems: [
        { id: 'e1', title: 't', description: 'd', icon: 'i', timestamp: 'now', category: 'Simulation Audit', changeValue: '100%' },
      ],
    };
    // missionPct = 100, habitPct = 100 (7/7), reflectionPct = 100, simPct = 100
    // 100*0.35 + 100*0.35 + 100*0.15 + 100*0.15 = 100
    expect(calculateConsistencyScore(persona)).toBe(100);
  });

  it('ignores non-Simulation Audit evolution items', () => {
    const persona: TestPersona = {
      dailyMissions: [],
      habits: [],
      reflections: [],
      evolutionItems: [
        { id: 'e1', title: 't', description: 'd', icon: 'i', timestamp: 'now', category: 'Habit Anchor', changeValue: '100%' },
      ],
    };
    expect(calculateConsistencyScore(persona)).toBe(0);
  });

  it('handles missing changeValue gracefully', () => {
    const persona: TestPersona = {
      dailyMissions: [],
      habits: [],
      reflections: [],
      evolutionItems: [
        { id: 'e1', title: 't', description: 'd', icon: 'i', timestamp: 'now', category: 'Simulation Audit' },
      ],
    };
    expect(calculateConsistencyScore(persona)).toBe(0);
  });
});