// Primary nav surface: 4 tabs + More menu sub-routes for demoted features.
export type ViewMode =
  | 'login' | 'today' | 'dna' | 'train' | 'journal'
  | 'more-persona' | 'more-references' | 'more-evolution' | 'more-settings'
  | 'library' | 'persona-new' | 'persona-manage';

export interface UserSession {
  email: string;
  isAuthenticated: boolean;
  modelIntensity: 'Passive' | 'Balanced' | 'Aggressive';
  predictiveInsights: boolean;
  activePersonaId: string;
}

export interface SimulatorResult {
  scenarioId: string;
  score: number;
  ts: string;
}

export interface Persona {
  id: string;
  name: string;
  archetype: string;
  identityStatement: string;
  traits: Trait[];
  blendedReferenceIds: string[];
  dailyMissions: DailyMission[];
  habits: HabitItem[];
  reflections: ReflectionEntry[];
  evolutionItems: EvolutionItem[];
  simulatorResults: SimulatorResult[];
  createdAt: string;
  lastActiveAt: string;
  status: 'draft' | 'active' | 'archived';
}

export interface Trait {
  id: string;
  name: string;
  value: number; // 0 to 100
  icon: string;
  description: string;
  category: 'cognitive' | 'behavioral' | 'emotional' | 'strategic';
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  category: 'Tech Visionaries' | 'Athletes' | 'Fictional' | 'Historical' | 'Philosophers';
  imageUrl: string;
  altText: string;
  traits: string[];
  quote?: string;
  bio: string;
  dnaModifiers: { [traitName: string]: number };
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  xp: number;
  urgent?: boolean;
}

export interface EvolutionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  changeValue?: string;
  category: string;
  timestamp: string;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  context: string;
  difficulty: 'Standard' | 'Elevated' | 'Critical';
  category: string;
  options: {
    id: string;
    text: string;
    traitWeights: { [traitName: string]: number };
    feedback: string;
    alignmentScore: number;
  }[];
}

export interface HabitItem {
  id: string;
  name: string;
  streak: number;
  targetPerWeek: number;
  days: boolean[]; // 7 days of current week
  icon: string;
  category: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  prompt: string;
  content: string;
  sentiment: 'constructive' | 'stoic' | 'breakthrough' | 'neutral';
  tags: string[];
}
