import type {
  Trait,
  ReferenceItem,
  DailyMission,
  EvolutionItem,
  SimulatorScenario,
  HabitItem,
  ReflectionEntry,
  UserSession,
  ViewMode,
} from '@/src/types';

describe('type shape/contracts', () => {
  it('Trait category union matches expected members', () => {
    const valid: Trait['category'][] = ['cognitive', 'behavioral', 'emotional', 'strategic'];
    const sample: Trait['category'] = 'strategic';
    expect(valid).toContain(sample);
  });

  it('ViewMode covers all app views', () => {
    const modes: ViewMode[] = [
      'login', 'dashboard', 'persona', 'dna', 'daily',
      'simulator', 'habits', 'reflections', 'evolution', 'references', 'settings',
    ];
    expect(modes.length).toBe(11);
  });

  it('ReferenceItem category union matches seed categories', () => {
    const valid: ReferenceItem['category'][] = [
      'Tech Visionaries', 'Athletes', 'Fictional', 'Historical', 'Philosophers',
    ];
    const seedCats: ReferenceItem['category'][] = [
      'Tech Visionaries', 'Athletes', 'Historical', 'Fictional',
    ];
    for (const c of seedCats) {
      expect(valid, `category ${c}`).toContain(c);
    }
  });

  it('DailyMission status is a valid union member', () => {
    const valid: DailyMission['status'][] = ['pending', 'in_progress', 'completed'];
    expect(valid).toContain('in_progress');
  });

  it('EvolutionItem changeValue is optional', () => {
    const e: EvolutionItem = {
      id: 'x', title: 't', description: 'd', icon: 'i', category: 'c', timestamp: 'now',
    };
    expect(e.changeValue).toBeUndefined();
  });

  it('SimulatorScenario option alignmentScore is a number', () => {
    const opt: SimulatorScenario['options'][number] = {
      id: 'o', text: 't', traitWeights: {}, feedback: 'f', alignmentScore: 0,
    };
    expect(typeof opt.alignmentScore).toBe('number');
  });

  it('HabitItem days is a 7-element boolean array', () => {
    const h: HabitItem = {
      id: 'h', name: 'n', streak: 1, targetPerWeek: 7,
      days: [true, false, true, false, true, false, true], icon: 'i', category: 'c',
    } as HabitItem;
    expect(h.days.length).toBe(7);
  });

  it('ReflectionEntry sentiment is a valid union member', () => {
    const valid: ReflectionEntry['sentiment'][] = ['constructive', 'stoic', 'breakthrough', 'neutral'];
    expect(valid).toContain('breakthrough');
  });

  it('UserSession modelIntensity is a valid union member', () => {
    const valid: UserSession['modelIntensity'][] = ['Passive', 'Balanced', 'Aggressive'];
    expect(valid).toContain('Aggressive');
  });
});
