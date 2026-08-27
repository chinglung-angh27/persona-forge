import {
  INITIAL_TRAITS,
  INITIAL_REFERENCES,
  INITIAL_SIMULATOR_SCENARIOS,
  INITIAL_DAILY_MISSIONS,
  INITIAL_EVOLUTION_ITEMS,
  INITIAL_HABITS,
  INITIAL_REFLECTIONS,
  INITIAL_SESSION,
} from '@/src/data/initialData';

function expectUniqueIds(items: { id: string }[], label: string) {
  const ids = items.map((i) => i.id);
  const seen = new Set<string>();
  for (const id of ids) {
    expect(seen.has(id), `${label}: duplicate id "${id}"`).toBe(false);
    seen.add(id);
  }
  expect(ids.length, `${label}: ids length`).toBeGreaterThan(0);
}

describe('INITIAL_* exports are non-empty arrays', () => {
  it('every INITIAL_* export is a non-empty array', () => {
    const arrays: [string, unknown][] = [
      ['INITIAL_TRAITS', INITIAL_TRAITS],
      ['INITIAL_REFERENCES', INITIAL_REFERENCES],
      ['INITIAL_SIMULATOR_SCENARIOS', INITIAL_SIMULATOR_SCENARIOS],
      ['INITIAL_DAILY_MISSIONS', INITIAL_DAILY_MISSIONS],
      ['INITIAL_EVOLUTION_ITEMS', INITIAL_EVOLUTION_ITEMS],
      ['INITIAL_HABITS', INITIAL_HABITS],
      ['INITIAL_REFLECTIONS', INITIAL_REFLECTIONS],
    ];
    for (const [name, arr] of arrays) {
      expect(Array.isArray(arr), `${name} is array`).toBe(true);
      expect((arr as unknown[]).length, `${name} non-empty`).toBeGreaterThan(0);
    }
    expect(INITIAL_SESSION).toBeTruthy();
  });
});

describe('Trait validation', () => {
  const VALID_CATEGORIES = ['cognitive', 'behavioral', 'emotional', 'strategic'];

  it('all Trait.value is between 0 and 100 inclusive', () => {
    for (const t of INITIAL_TRAITS) {
      expect(t.value, `trait ${t.id} value >= 0`).toBeGreaterThanOrEqual(0);
      expect(t.value, `trait ${t.id} value <= 100`).toBeLessThanOrEqual(100);
    }
  });

  it('all Trait.category is a valid union member', () => {
    for (const t of INITIAL_TRAITS) {
      expect(VALID_CATEGORIES, `trait ${t.id} category`).toContain(t.category);
    }
  });
});

describe('unique id fields', () => {
  it('INITIAL_SIMULATOR_SCENARIOS have unique ids', () => {
    expectUniqueIds(INITIAL_SIMULATOR_SCENARIOS, 'INITIAL_SIMULATOR_SCENARIOS');
  });
  it('INITIAL_TRAITS have unique ids', () => {
    expectUniqueIds(INITIAL_TRAITS, 'INITIAL_TRAITS');
  });
  it('INITIAL_REFERENCES have unique ids', () => {
    expectUniqueIds(INITIAL_REFERENCES, 'INITIAL_REFERENCES');
  });
});
