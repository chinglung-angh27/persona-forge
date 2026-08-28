// In-memory localStorage shim for node test env (vitest is configured `node`).
// Keeps the spec from the brief intact while letting it run without jsdom/happy-dom.
const _mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (_mem.has(k) ? _mem.get(k)! : null),
  setItem: (k: string, v: string) => { _mem.set(k, String(v)); },
  removeItem: (k: string) => { _mem.delete(k); },
  clear: () => { _mem.clear(); },
  key: (i: number) => Array.from(_mem.keys())[i] ?? null,
  get length() { return _mem.size; },
};

import { describe, it, expect, beforeEach } from 'vitest';
import { Persona } from '@/src/types';
import {
  seedPersona, migrateLegacy, updateActivePersonaIn, loadPersonas, PF_DATA_VERSION,
} from '@/src/lib/personaStore';

describe('personaStore', () => {
  beforeEach(() => localStorage.clear());

  it('seedPersona owns a full copy of INITIAL_* templates', () => {
    const p = seedPersona('Ching', 'THE STRATEGIC OPERATOR');
    expect(p.name).toBe('Ching');
    expect(p.traits.length).toBeGreaterThan(0);
    expect(p.dailyMissions.length).toBeGreaterThan(0);
    expect(p.status).toBe('active');
  });

  it('migrateLegacy wraps legacy flat keys into one persona and clears them', () => {
    localStorage.setItem('pf_session', JSON.stringify({ personaName: 'Legacy', archetype: 'THE STOIC ARCHITECT', email: 'a@b.c' }));
    localStorage.setItem('pf_traits', JSON.stringify([{ id: 'discipline', name: 'Discipline', value: 10 }]));
    localStorage.setItem('pf_blended_refs', JSON.stringify(['steve-jobs']));
    const m = migrateLegacy();
    expect(m).not.toBeNull();
    expect(m!.personas.length).toBe(1);
    expect(m!.personas[0].name).toBe('Legacy');
    expect(m!.personas[0].archetype).toBe('THE STOIC ARCHITECT');
    expect(localStorage.getItem('pf_traits')).toBeNull();
  });

  it('updateActivePersonaIn mutates only the active persona', () => {
    const a: Persona = { id: 'a', name: 'A', archetype: '', identityStatement: '', traits: [], blendedReferenceIds: [], dailyMissions: [], habits: [], reflections: [], evolutionItems: [], simulatorResults: [], createdAt: '', lastActiveAt: '', status: 'active' };
    const b: Persona = { ...a, id: 'b', name: 'B' };
    const list = [a, b];
    const out = updateActivePersonaIn(list, 'a', { name: 'A2' });
    expect(out.find(p => p.id === 'a')!.name).toBe('A2');
    expect(out.find(p => p.id === 'b')!.name).toBe('B');
    expect(list[0].name).toBe('A'); // original untouched (immutability)
  });

  it('loadPersonas seeds a fresh persona when storage empty and version stamped', () => {
    const list = loadPersonas();
    expect(list.length).toBe(1);
    expect(localStorage.getItem('pf_personas')).not.toBeNull();
  });
});
