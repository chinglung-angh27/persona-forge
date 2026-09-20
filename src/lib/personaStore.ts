import {
  INITIAL_TRAITS, INITIAL_DAILY_MISSIONS, INITIAL_HABITS,
  INITIAL_REFLECTIONS, INITIAL_EVOLUTION_ITEMS,
} from '../data/initialData';
import { Persona, Trait, ARCHETYPES } from '../types';
import { normalizeJournalDates } from './journalDates';

const PERSONAS_KEY = 'pf_personas';
const ACTIVE_KEY = 'pf_activePersonaId';
const LEGACY_KEYS = ['pf_traits', 'pf_missions', 'pf_habits', 'pf_reflections', 'pf_evolution', 'pf_blended_refs'];
const DEFAULT_ARCHETYPE = ARCHETYPES[0];

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneTraits(): Trait[] {
  return INITIAL_TRAITS.map((t) => ({ ...t }));
}

export function seedPersona(
  name = 'Ching',
  archetype = DEFAULT_ARCHETYPE
): Persona {
  const now = new Date().toISOString();
  return {
    id: uid('persona'),
    name,
    archetype,
    identityStatement: '',
    traits: cloneTraits(),
    blendedReferenceIds: ['steve-jobs', 'marcus-aurelius'],
    dailyMissions: INITIAL_DAILY_MISSIONS.map((m) => ({ ...m })),
    habits: INITIAL_HABITS.map((h) => ({ ...h })),
    reflections: INITIAL_REFLECTIONS.map((r) => ({ ...r })),
    evolutionItems: INITIAL_EVOLUTION_ITEMS.map((e) => ({ ...e })),
    simulatorResults: [],
    createdAt: now,
    lastActiveAt: now,
    status: 'active',
  };
}

export function migrateLegacy(): { personas: Persona[]; activeId: string } | null {
  const hasLegacy = LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null);
  if (!hasLegacy) return null;

  const read = <T,>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  };

  const sessionRaw = localStorage.getItem('pf_session');
  const session = sessionRaw ? JSON.parse(sessionRaw) : {};
  const name: string = session.personaName || 'Ching';
  const archetype: string = session.archetype || DEFAULT_ARCHETYPE;

  const p = seedPersona(name, archetype);
  p.traits = read('pf_traits', p.traits);
  p.blendedReferenceIds = read('pf_blended_refs', p.blendedReferenceIds);
  p.dailyMissions = read('pf_missions', p.dailyMissions);
  p.habits = read('pf_habits', p.habits);
  p.reflections = read('pf_reflections', p.reflections);
  p.evolutionItems = read('pf_evolution', p.evolutionItems);
  const normalized = normalizeJournalDates(p.habits, p.dailyMissions, new Date());
  p.habits = normalized.habits;
  p.dailyMissions = normalized.missions;

  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  return { personas: [p], activeId: p.id };
}

export function loadPersonas(): Persona[] {
  const migrated = migrateLegacy();
  if (migrated) {
    savePersonas(migrated.personas);
    localStorage.setItem(ACTIVE_KEY, migrated.activeId);
    return migrated.personas;
  }
  const raw = localStorage.getItem(PERSONAS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Persona[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const today = new Date();
        return parsed.map((persona) => {
          const normalized = normalizeJournalDates(persona.habits, persona.dailyMissions, today);
          return { ...persona, habits: normalized.habits, dailyMissions: normalized.missions };
        });
      }
    } catch {
      /* fall through to seed */
    }
  }
  const p = seedPersona();
  const arr = [p];
  savePersonas(arr);
  localStorage.setItem(ACTIVE_KEY, p.id);
  return arr;
}

export function loadActivePersonaId(personas: Persona[]): string {
  const raw = localStorage.getItem(ACTIVE_KEY);
  if (raw && personas.some((p) => p.id === raw)) return raw;
  return personas[0]?.id ?? '';
}

export function savePersonas(personas: Persona[]): void {
  localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
}

export function saveActivePersonaId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function updateActivePersonaIn(
  personas: Persona[],
  activeId: string,
  partial: Partial<Persona> | ((p: Persona) => Persona)
): Persona[] {
  return personas.map((p) =>
    p.id === activeId
      ? typeof partial === 'function'
        ? partial(p)
        : { ...p, ...partial, lastActiveAt: new Date().toISOString() }
      : p
  );
}
