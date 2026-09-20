import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPersonas, savePersonas, saveActivePersonaId, updateActivePersonaIn, seedPersona } from '../lib/personaStore';
import { Persona, Trait } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('personaStore', () => {
  const today = new Date(2026, 8, 17, 12);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const legacyHabitDayKey = '2026-09-15';

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.setSystemTime(today);
  });

  it('seedPersona creates a valid Persona with all required fields', () => {
    const p = seedPersona('Test', 'ARCHETYPE');
    expect(p.id).toMatch(/^persona-\d+/);
    expect(p.name).toBe('Test');
    expect(p.archetype).toBe('ARCHETYPE');
    expect(p.identityStatement).toBe('');
    expect(p.traits.length).toBeGreaterThan(0);
    expect(p.blendedReferenceIds.length).toBeGreaterThan(0);
    expect(p.dailyMissions.length).toBeGreaterThan(0);
    expect(p.habits.length).toBeGreaterThan(0);
    expect(p.reflections.length).toBeGreaterThan(0);
    expect(p.evolutionItems.length).toBeGreaterThan(0);
    expect(p.simulatorResults).toEqual([]);
    expect(p.createdAt).toBeDefined();
    expect(p.lastActiveAt).toBeDefined();
    expect(p.status).toBe('active');
  });

  it('loadPersonas returns seeded persona when storage empty', () => {
    const personas = loadPersonas();
    expect(personas.length).toBe(1);
    expect(personas[0].status).toBe('active');
  });

  it('savePersonas and loadPersonas round-trip', () => {
    const p = seedPersona('RoundTrip', 'TEST');
    savePersonas([p]);
    const loaded = loadPersonas();
    expect(loaded.length).toBe(1);
    expect(loaded[0].name).toBe('RoundTrip');
  });

  it('saveActivePersonaId and loadActivePersonaId round-trip', () => {
    const p = seedPersona('Test', 'TEST');
    savePersonas([p]);
    saveActivePersonaId(p.id);
    const activeId = localStorageMock.getItem('pf_activePersonaId');
    expect(activeId).toBe(p.id);
  });

  it('updateActivePersonaIn merges partial object', () => {
    const p = seedPersona('Test', 'TEST');
    const updated = updateActivePersonaIn([p], p.id, { name: 'Updated' });
    expect(updated[0].name).toBe('Updated');
    expect(updated[0].id).toBe(p.id);
  });

  it('updateActivePersonaIn applies function updater', () => {
    const p = seedPersona('Test', 'TEST');
    const updated = updateActivePersonaIn([p], p.id, (prev) => ({ ...prev, name: prev.name + '-mod' }));
    expect(updated[0].name).toBe('Test-mod');
  });

  it('normalizes loaded journal dates while preserving unrelated fields', () => {
    const persona: Persona = {
      ...seedPersona('Loaded', 'TEST'),
      dailyMissions: [{
        id: 'm-legacy',
        title: 'Legacy mission',
        description: '',
        status: 'pending',
        category: 'Focus',
        xp: 100,
      }],
      habits: [{
        id: 'h-legacy',
        name: 'Legacy habit',
        streak: 1,
        targetPerWeek: 1,
        days: [false, true, false, false, false, false, false],
        icon: 'checklist',
        category: 'Focus',
      }],
    };
    persona.identityStatement = 'Preserve this';
    savePersonas([persona]);

    const [loaded] = loadPersonas();

    expect(loaded.identityStatement).toBe('Preserve this');
    expect(loaded.dailyMissions[0].date).toBe(todayKey);
    expect(loaded.habits[0].completedDates).toContain(legacyHabitDayKey);
  });

  it('normalizes migrated legacy journal dates', () => {
    localStorageMock.setItem('pf_missions', JSON.stringify([{
      id: 'm-legacy',
      title: 'Legacy mission',
      description: '',
      status: 'pending',
      category: 'Focus',
      xp: 100,
    }]));
    localStorageMock.setItem('pf_habits', JSON.stringify([{
      id: 'h-legacy',
      name: 'Legacy habit',
      streak: 1,
      targetPerWeek: 1,
      days: [false, true, false, false, false, false, false],
      icon: 'checklist',
      category: 'Focus',
    }]));

    const migrated = loadPersonas();

    expect(migrated[0].dailyMissions[0].date).toBe(todayKey);
    expect(migrated[0].habits[0].completedDates).toContain(legacyHabitDayKey);
  });
});