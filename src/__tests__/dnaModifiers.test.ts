import { describe, it, expect } from 'vitest';
import { Trait, ReferenceItem } from '../types';

describe('dnaModifiers application', () => {
  it('applies positive modifiers and clamps at 100', () => {
    const traits: Trait[] = [
      { id: 'c1', name: 'Creativity', value: 90, icon: 'i', description: 'd', category: 'cognitive' },
      { id: 'c2', name: 'Ambition', value: 85, icon: 'i', description: 'd', category: 'strategic' },
    ];
    const ref: ReferenceItem = {
      id: 'r1', name: 'Test', title: 'T', category: 'Historical', imageUrl: '', altText: '',
      traits: [], quote: '', bio: '',
      dnaModifiers: { Creativity: +6, Ambition: +5 },
    };

    const result = traits.map((t) => {
      const mod = ref.dnaModifiers[t.name];
      return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
    });

    expect(result.find((t) => t.name === 'Creativity')?.value).toBe(96); // 90 + 6 = 96
    expect(result.find((t) => t.name === 'Ambition')?.value).toBe(90);  // 85 + 5 = 90
  });

  it('applies negative modifiers and clamps at 0', () => {
    const traits: Trait[] = [
      { id: 'c1', name: 'Charisma', value: 10, icon: 'i', description: 'd', category: 'behavioral' },
    ];
    const ref: ReferenceItem = {
      id: 'r1', name: 'Test', title: 'T', category: 'Historical', imageUrl: '', altText: '',
      traits: [], quote: '', bio: '',
      dnaModifiers: { Charisma: -15 },
    };

    const result = traits.map((t) => {
      const mod = ref.dnaModifiers[t.name];
      return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
    });

    expect(result.find((t) => t.name === 'Charisma')?.value).toBe(0); // clamped at 0
  });

  it('ignores traits not in dnaModifiers', () => {
    const traits: Trait[] = [
      { id: 'c1', name: 'Discipline', value: 50, icon: 'i', description: 'd', category: 'behavioral' },
    ];
    const ref: ReferenceItem = {
      id: 'r1', name: 'Test', title: 'T', category: 'Historical', imageUrl: '', altText: '',
      traits: [], quote: '', bio: '',
      dnaModifiers: { Creativity: +10 },
    };

    const result = traits.map((t) => {
      const mod = ref.dnaModifiers[t.name];
      return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
    });

    expect(result.find((t) => t.name === 'Discipline')?.value).toBe(50); // unchanged
  });

  it('blends multiple references additively', () => {
    const traits: Trait[] = [
      { id: 'c1', name: 'Composure', value: 45, icon: 'i', description: 'd', category: 'emotional' },
    ];
    const refs: ReferenceItem[] = [
      { id: 'r1', name: 'R1', title: 'T', category: 'Historical', imageUrl: '', altText: '', traits: [], quote: '', bio: '', dnaModifiers: { Composure: +8 } },
      { id: 'r2', name: 'R2', title: 'T', category: 'Historical', imageUrl: '', altText: '', traits: [], quote: '', bio: '', dnaModifiers: { Composure: +5 } },
    ];

    let currentTraits = [...traits];
    for (const ref of refs) {
      currentTraits = currentTraits.map((t) => {
        const mod = ref.dnaModifiers[t.name];
        return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
      });
    }

    expect(currentTraits[0].value).toBe(58); // 45 + 8 + 5
  });
});