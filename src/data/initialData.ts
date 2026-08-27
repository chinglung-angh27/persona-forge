import { Trait, ReferenceItem, DailyMission, EvolutionItem, SimulatorScenario, HabitItem, ReflectionEntry, UserSession } from '../types';

export const INITIAL_SESSION: UserSession = {
  personaName: 'Ching',
  email: 'x.architect@forge.ai',
  archetype: 'THE STRATEGIC OPERATOR',
  consistencyScore: 82,
  modelIntensity: 'Aggressive',
  predictiveInsights: true,
  isAuthenticated: true
};

export const INITIAL_TRAITS: Trait[] = [
  {
    id: 'discipline',
    name: 'Discipline',
    value: 75,
    icon: 'sports_martial_arts',
    description: 'Ability to adhere to rigorous operational standards and execution protocols regardless of emotional state.',
    category: 'behavioral'
  },
  {
    id: 'confidence',
    name: 'Confidence',
    value: 82,
    icon: 'visibility',
    description: 'Baseline self-belief in executing unproven strategies under high ambiguity and high stakes.',
    category: 'emotional'
  },
  {
    id: 'charisma',
    name: 'Charisma',
    value: 60,
    icon: 'forum',
    description: 'Interpersonal leverage, persuasive framing, and gravitational authority in group dynamics.',
    category: 'behavioral'
  },
  {
    id: 'creativity',
    name: 'Creativity',
    value: 90,
    icon: 'lightbulb',
    description: 'Divergent lateral thinking, counter-intuitive synthesis, and unconventional problem-solving capacity.',
    category: 'cognitive'
  },
  {
    id: 'ambition',
    name: 'Ambition',
    value: 85,
    icon: 'flight_takeoff',
    description: 'Scale of vision, appetite for asymmetrical upside, and intolerance for median outcomes.',
    category: 'strategic'
  },
  {
    id: 'composure',
    name: 'Composure',
    value: 45,
    icon: 'self_improvement',
    description: 'Physiological and psychological equilibrium when confronting chaos, conflict, or sudden catastrophe.',
    category: 'emotional'
  }
];

export const INITIAL_REFERENCES: ReferenceItem[] = [
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    title: 'TECH VISIONARY',
    category: 'Tech Visionaries',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABjId2_6VoxoVkd-DOqoit1xXbajG6ppD4JZ0KZ1aQb0pLHjKFjknZy3eiPzLC18oufj0oMPk0stSCKPwxo6t5GkTTgPXVOwxc9PhnefnMEdzVrgKQa9PSYE0YFKmRB8QasvwrYghh44xo_cMIAboXZYPa_7INFXVe8sWzb6Ztr9WPIFw3QB4I4GAfpC_IpyAsz7pwjqledrGgaslVO5P42PTSersH3a79Lny-KmELQblcvLAPSuw',
    altText: 'A highly stylized, dark cinematic portrait of a tech visionary resembling Steve Jobs with cold white rim lighting.',
    traits: ['Relentless Focus', 'Reality Distortion', 'Design Obsession'],
    quote: 'Deciding what not to do is as important as deciding what to do.',
    bio: 'Pioneer of the personal computer revolution and digital craftsmanship. Known for radical product simplification, uncompromising aesthetic standards, and unyielding willpower.',
    dnaModifiers: { Creativity: +6, Ambition: +5, Discipline: +4, Charisma: +3 }
  },
  {
    id: 'cristiano-ronaldo',
    name: 'Cristiano Ronaldo',
    title: 'ELITE ATHLETE',
    category: 'Athletes',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-YJAhTpnpAieqLbTS6QqMtovtbnEBqMJd7gm-hkUwBsqjmq6tBtUFEBWkVEP1mPVW8sJENWMbLv2FLvaQvd2gtlQob8YrmbxUn0Hcaz1Zj5sV_90JdZvt2r56kJz7_Jg6kRUdTq8YzhqZvNhZeNApvM7Dz1S37gT92yXNKQN5q5YCr5KOvTwJvclNhkC4r6DOSJ3PbhRxuuMoctnPQNpdj6k-atdNVpzhvIMrjj9dlbxV5KrXx2Y',
    altText: 'A powerful, dark cinematic rendering of an elite athlete in deep obsidian neomorphism.',
    traits: ['Unmatched Work Ethic', 'Extreme Discipline', 'Self-Belief'],
    quote: 'Your love makes me strong, your hate makes me unstoppable.',
    bio: 'One of the most decorated and relentless athletes in human history. Exemplifies total physiological dedication, repetitive mastery, and clutch performance under immense global pressure.',
    dnaModifiers: { Discipline: +8, Confidence: +6, Ambition: +5, Composure: +2 }
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    title: 'HISTORICAL STOIC',
    category: 'Historical',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2pPUgQ35QjxJM7h3t691jD9FBNScnaTsXEvxTm94VxozRxEmHOd-W_ozrvmY1nwEAFpaOFle1heLjVscpG2Xbo_dsZoIZ6AogWd_CWNY701d6CFng6_-NsPaG_JTP4JTqKZ3Wfj5-RZU9MmVPHoTXnC5_50Ra9yXEv8NkvhT-U_mKmXBXdQC86QSF09w_4mV2EqWEgb3BNynKRQtOIWMagg77r0ON4TFMRvqxJM5VOTscOlL3gtA',
    altText: 'A somber, digital sculpture of Marcus Aurelius in dark matte black resin.',
    traits: ['Emotional Regulation', 'Objective Reality', 'Duty & Honor'],
    quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    bio: 'Roman Emperor and philosopher. Authored the timeless Meditations while governing the world’s most complex empire amidst war and plague, exemplifying stoic detachment and duty.',
    dnaModifiers: { Composure: +12, Discipline: +5, Confidence: +3, Creativity: +1 }
  },
  {
    id: 'leonardo-da-vinci',
    name: 'Leonardo da Vinci',
    title: 'UNIVERSAL POLYMATH',
    category: 'Historical',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOZBmr9POmtU2A4eEGNJiIZ3I0RNbiQ_S5irH1Or_aT00iHTnDZ-Lzj_mWXJ3PYZUNncZWAeNbJZ3h_XK4mzJ9lWdrrsg9JQwERiKWOY2SmIlueBykNlpzwIwE_wItQww5bY08u_MFHrowgl5f8nkqm98f6UaKI2v0d5I93i4qUzeZxVOx7KHfiOZc0YW97oXoqKFV4C2YL8q9ia3NgROzkBSQpym_7wOLxDrs0VodjCc6Sva_oRQ',
    altText: 'An intricate dark marble polymath relic depicting Renaissance mastery and engineering.',
    traits: ['Omni-Curiosity', 'Empirical Rigor', 'Holistic Synthesis'],
    quote: 'To develop a complete mind: Study the science of art; Study the art of science. Learn how to see.',
    bio: 'The archetype of the Renaissance Man. Unprecedented convergence of anatomy, mechanical engineering, hydraulics, painting, and botanical observation.',
    dnaModifiers: { Creativity: +10, Confidence: +4, Ambition: +3, Discipline: +3 }
  },
  {
    id: 'alexander-the-great',
    name: 'Alexander the Great',
    title: 'TACTICAL COMMANDER',
    category: 'Historical',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-YJAhTpnpAieqLbTS6QqMtovtbnEBqMJd7gm-hkUwBsqjmq6tBtUFEBWkVEP1mPVW8sJENWMbLv2FLvaQvd2gtlQob8YrmbxUn0Hcaz1Zj5sV_90JdZvt2r56kJz7_Jg6kRUdTq8YzhqZvNhZeNApvM7Dz1S37gT92yXNKQN5q5YCr5KOvTwJvclNhkC4r6DOSJ3PbhRxuuMoctnPQNpdj6k-atdNVpzhvIMrjj9dlbxV5KrXx2Y',
    altText: 'Ancient commander bust with bold metallic lighting.',
    traits: ['Frontline Audacity', 'Speed of Execution', 'Psychological Warfare'],
    quote: 'There is nothing impossible to him who will try.',
    bio: 'Undefeated in military conquest, created one of the largest empires in history by age thirty through lightning tactical maneuvers and high personal stakes.',
    dnaModifiers: { Ambition: +9, Confidence: +7, Discipline: +4, Charisma: +5 }
  },
  {
    id: 'sherlock-holmes',
    name: 'Sherlock Holmes',
    title: 'MASTER DEDUCTIONIST',
    category: 'Fictional',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABjId2_6VoxoVkd-DOqoit1xXbajG6ppD4JZ0KZ1aQb0pLHjKFjknZy3eiPzLC18oufj0oMPk0stSCKPwxo6t5GkTTgPXVOwxc9PhnefnMEdzVrgKQa9PSYE0YFKmRB8QasvwrYghh44xo_cMIAboXZYPa_7INFXVe8sWzb6Ztr9WPIFw3QB4I4GAfpC_IpyAsz7pwjqledrGgaslVO5P42PTSersH3a79Lny-KmELQblcvLAPSuw',
    altText: 'Sharp silhouette of an analytical mastermind in a dark rain-soaked study.',
    traits: ['Cold Logic', 'Micro-Pattern Recognition', 'Cognitive Isolation'],
    quote: 'It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories.',
    bio: 'Fictional consulting detective whose mind operates as a precision instrument, dispassionately dissecting human folly and chaotic anomalies through razor-sharp deduction.',
    dnaModifiers: { Composure: +8, Discipline: +6, Creativity: +4, Charisma: -2 }
  }
];

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: "Do the thing you've been avoiding...",
    description: 'Focus your energy on completing the most challenging strategic task today. Delaying it only drains cognitive resources.',
    status: 'pending',
    category: 'Strategic Prioritization',
    xp: 250,
    urgent: true
  },
  {
    id: 'm2',
    title: 'Zero Reactive Inputs (First 90 Mins)',
    description: 'No email, Slack, or social feeds during the first 90 minutes of your operational block. Retain cognitive primacy.',
    status: 'in_progress',
    category: 'Discipline Protocol',
    xp: 150
  },
  {
    id: 'm3',
    title: 'High Stakes Scenario Pre-Mortem',
    description: 'Conduct a 10-minute written pre-mortem on this week’s most critical deliverable before committing capital or team cycles.',
    status: 'pending',
    category: 'Tactical Detachment',
    xp: 180
  }
];

export const INITIAL_EVOLUTION_ITEMS: EvolutionItem[] = [
  {
    id: 'e1',
    title: 'Morning Routine',
    description: 'Successfully integrated 15 minutes of strategic planning before checking communications. Consistency improved by 12%.',
    icon: 'wb_sunny',
    changeValue: '+12%',
    category: 'Habit Anchor',
    timestamp: 'Today, 07:30'
  },
  {
    id: 'e2',
    title: 'Conflict Reaction',
    description: 'Maintained objective detachment during high-stress team sync. Emotional variance decreased.',
    icon: 'balance',
    changeValue: '-18% Stress Variance',
    category: 'Composure Calibration',
    timestamp: 'Yesterday, 16:45'
  },
  {
    id: 'e3',
    title: 'Deep Work Velocity',
    description: 'Sustained 120 minutes of uninterrupted architectural problem-solving without task switching.',
    icon: 'trending_up',
    changeValue: '+25m Focus Block',
    category: 'Cognitive Endurance',
    timestamp: '2 days ago'
  },
  {
    id: 'e4',
    title: 'DNA Trait Upgrade: Ambition',
    description: 'Recalibrated ambition baseline following successful milestone execution and new reference integration.',
    icon: 'flight_takeoff',
    changeValue: '+4 Pts',
    category: 'Trait Recalibration',
    timestamp: '3 days ago'
  }
];

export const INITIAL_SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'scenario-1',
    title: 'High-Stakes Scope Pushback',
    context: '48 hours before an executive product presentation, a key engineering lead announces that 40% of the core functionality cannot be delivered in time without severe architectural debt.',
    difficulty: 'Critical',
    category: 'Crisis Management',
    options: [
      {
        id: 'opt-1',
        text: 'Ruthlessly cut secondary features, double down on the single killer mechanism, and take personal accountability for the refined scope in the briefing.',
        traitWeights: { Discipline: +4, Ambition: +3, Confidence: +5, Composure: +4 },
        feedback: 'Strategic Operator alignment: 94%. Demonstrates high agency, ruthless prioritization, and ownership without emotional panic.',
        alignmentScore: 94
      },
      {
        id: 'opt-2',
        text: 'Insist the team work around the clock over the weekend to deliver the full original specification regardless of fatigue.',
        traitWeights: { Ambition: +5, Discipline: +2, Charisma: -6, Composure: -4 },
        feedback: 'Strategic Operator alignment: 42%. Over-leverages raw brute force, burning organizational goodwill and increasing catastrophic failure risk.',
        alignmentScore: 42
      },
      {
        id: 'opt-3',
        text: 'Delay the executive review by two weeks, sending an apologetic memo detailing the technical roadblocks.',
        traitWeights: { Confidence: -5, Ambition: -4, Composure: +2 },
        feedback: 'Strategic Operator alignment: 31%. Displays reactive posture, relinquishing narrative control to external momentum.',
        alignmentScore: 31
      }
    ]
  },
  {
    id: 'scenario-2',
    title: 'Aggressive Competitor Launch',
    context: 'A well-funded competitor launches an exact duplicate of your flagship feature set with predatory pricing and aggressive ad campaigns.',
    difficulty: 'Elevated',
    category: 'Strategic Maneuver',
    options: [
      {
        id: 'opt-2-1',
        text: 'Disregard their noise. Accelerate your asymmetric differentiation roadmap that shifts the competitive axis entirely.',
        traitWeights: { Confidence: +6, Creativity: +5, Composure: +5 },
        feedback: 'Strategic Operator alignment: 96%. Refuses to play on the competitor’s terms; creates new value dimensions instead of engaging in race-to-bottom margins.',
        alignmentScore: 96
      },
      {
        id: 'opt-2-2',
        text: 'Immediately discount pricing by 30% and match their ad spend dollar for dollar.',
        traitWeights: { Composure: -5, Creativity: -4, Ambition: -2 },
        feedback: 'Strategic Operator alignment: 38%. Purely reactive stance that bleeds margin and validates competitor framing.',
        alignmentScore: 38
      }
    ]
  },
  {
    id: 'scenario-3',
    title: 'Personal Cognitive Fog & Low Motivation',
    context: 'You wake up after poor sleep with zero internal drive, facing a day of high-consequence decisions and strategic drafting.',
    difficulty: 'Standard',
    category: 'Self-Governance',
    options: [
      {
        id: 'opt-3-1',
        text: 'Execute a 10-minute cold exposure and physical reset, eliminate non-essential meetings, and execute purely by checklist protocol rather than feeling.',
        traitWeights: { Discipline: +7, Composure: +4, Confidence: +4 },
        feedback: 'Strategic Operator alignment: 92%. Shows mastery of system-over-mood discipline and physiological override protocols.',
        alignmentScore: 92
      },
      {
        id: 'opt-3-2',
        text: 'Cancel everything and spend the day browsing industry news hoping for inspiration.',
        traitWeights: { Discipline: -8, Ambition: -5 },
        feedback: 'Strategic Operator alignment: 20%. Surrenders daily agency to fleeting neurochemical state.',
        alignmentScore: 20
      }
    ]
  }
];

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'h1',
    name: '15m Strategic Planning Before Comms',
    streak: 18,
    targetPerWeek: 7,
    days: [true, true, true, true, true, true, false],
    icon: 'wb_sunny',
    category: 'Priming'
  },
  {
    id: 'h2',
    name: 'Zero Reactive Feeds Before 10:00 AM',
    streak: 9,
    targetPerWeek: 7,
    days: [true, true, true, true, false, true, false],
    icon: 'notifications_off',
    category: 'Focus'
  },
  {
    id: 'h3',
    name: 'Evening Tactical Review & Cognitive Log',
    streak: 24,
    targetPerWeek: 7,
    days: [true, true, true, true, true, true, true],
    icon: 'psychology',
    category: 'Reflection'
  },
  {
    id: 'h4',
    name: 'Physical Resilience & High-Output Training',
    streak: 12,
    targetPerWeek: 5,
    days: [true, false, true, true, false, true, false],
    icon: 'sports_martial_arts',
    category: 'Physiology'
  }
];

export const INITIAL_REFLECTIONS: ReflectionEntry[] = [
  {
    id: 'r1',
    date: '2026-08-25',
    prompt: 'Where did you compromise standard today, and what was the hidden cost?',
    content: 'Allowed an open-ended meeting to drag 35 minutes over schedule instead of enforcing a hard cutoff. Cost was delayed deep work block and compromised afternoon momentum. Action: Institute 25-minute hard capped sessions tomorrow.',
    sentiment: 'breakthrough',
    tags: ['Time Sovereignty', 'Boundaries']
  },
  {
    id: 'r2',
    date: '2026-08-24',
    prompt: 'What was the most stoic decision you made under pressure?',
    content: 'When client feedback arrived with harsh tone, resisted impulse to justify immediately. Took 2 hours, analyzed valid critique points objectively, and replied only with concrete operational solutions.',
    sentiment: 'stoic',
    tags: ['Emotional Detachment', 'Stoicism']
  }
];
