import type {
  Trait, ReferenceItem, DailyMission, EvolutionItem, SimulatorScenario,
  HabitItem, ReflectionEntry, UserSession, Persona, ViewMode,
} from '@/src/types';

describe('type shape/contracts', () => {
  it('Trait category union matches expected members', () => {
    const valid: Trait['category'][] = ['cognitive', 'behavioral', 'emotional', 'strategic'];
    expect(valid).toContain('strategic' as Trait['category']);
  });

  it('ViewMode covers all app views incl. persona library/manage/new', () => {
    const modes: ViewMode[] = [
      'login', 'today', 'dna', 'train', 'journal',
      'more-persona', 'more-references', 'more-evolution', 'more-settings',
      'library', 'persona-new', 'persona-manage',
    ];
    expect(modes.length).toBe(12);
  });

  it('Persona owns all per-persona data', () => {
    const p: Persona = {
      id: 'p1', name: 'Ching', archetype: 'THE STRATEGIC OPERATOR',
      identityStatement: '', traits: [], blendedReferenceIds: [],
      dailyMissions: [], habits: [], reflections: [], evolutionItems: [],
      simulatorResults: [], createdAt: '', lastActiveAt: '', status: 'active',
    };
    expect(p.status).toBe('active');
  });

  it('UserSession is slimmed: no personaName/archetype/consistencyScore, has activePersonaId', () => {
    const s: UserSession = {
      email: 'a@b.c', isAuthenticated: true, modelIntensity: 'Balanced',
      predictiveInsights: false, activePersonaId: 'p1',
    };
    expect((s as any).personaName).toBeUndefined();
    expect((s as any).archetype).toBeUndefined();
    expect((s as any).consistencyScore).toBeUndefined();
    expect(s.activePersonaId).toBe('p1');
  });
});
