export type ViewMode =
  | 'login'
  | 'dashboard'
  | 'persona'
  | 'dna'
  | 'daily'
  | 'simulator'
  | 'habits'
  | 'reflections'
  | 'evolution'
  | 'references'
  | 'settings';

export interface UserSession {
  email: string;
  personaName: string;
  archetype: string;
  isAuthenticated: boolean;
  consistencyScore: number;
  modelIntensity: 'Passive' | 'Balanced' | 'Aggressive';
  predictiveInsights: boolean;
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
