import React, { useState, useEffect, useMemo } from 'react';
import { 
  ViewMode, 
  UserSession, 
  Trait, 
  ReferenceItem, 
  DailyMission, 
  HabitItem, 
  ReflectionEntry, 
  EvolutionItem 
} from './types';
import {
  INITIAL_SESSION,
  INITIAL_TRAITS,
  INITIAL_REFERENCES,
  INITIAL_DAILY_MISSIONS,
  INITIAL_HABITS,
  INITIAL_REFLECTIONS,
  INITIAL_EVOLUTION_ITEMS,
  INITIAL_SIMULATOR_SCENARIOS
} from './data/initialData';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/LoginView';
import { TodayView } from './components/TodayView';
import { TrainView } from './components/TrainView';
import { JournalView } from './components/JournalView';
import { DNAEditorView } from './components/DNAEditorView';
import { MoreMenu } from './components/MoreMenu';
import { SettingsView } from './components/SettingsView';
import { MyPersonaView } from './components/MyPersonaView';
import { ReferenceLibraryView } from './components/ReferenceLibraryView';
import { EvolutionView } from './components/EvolutionView';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('pf_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      // ponytail: a saved session with an email IS the local profile; don't force re-login.
      return { ...parsed, isAuthenticated: Boolean(parsed.email) };
    }
    return INITIAL_SESSION;
  });

  // Current View
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return session.isAuthenticated ? 'today' : 'login';
  });

  // Traits State
  const [traits, setTraits] = useState<Trait[]>(() => {
    const saved = localStorage.getItem('pf_traits');
    return saved ? JSON.parse(saved) : INITIAL_TRAITS;
  });

  // Reference Library State
  const [references] = useState<ReferenceItem[]>(INITIAL_REFERENCES);
  const [blendedReferences, setBlendedReferences] = useState<string[]>(() => {
    const saved = localStorage.getItem('pf_blended_refs');
    return saved ? JSON.parse(saved) : ['steve-jobs', 'marcus-aurelius'];
  });

  // Daily Missions State
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('pf_missions');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MISSIONS;
  });

  // Habits State
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('pf_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  // Reflections State
  const [reflections, setReflections] = useState<ReflectionEntry[]>(() => {
    const saved = localStorage.getItem('pf_reflections');
    return saved ? JSON.parse(saved) : INITIAL_REFLECTIONS;
  });

  // Evolution Items State
  const [evolutionItems, setEvolutionItems] = useState<EvolutionItem[]>(() => {
    const saved = localStorage.getItem('pf_evolution');
    return saved ? JSON.parse(saved) : INITIAL_EVOLUTION_ITEMS;
  });

  // Scenarios State
  const [scenarios] = useState(INITIAL_SIMULATOR_SCENARIOS);

  // Derive consistencyScore from real activity (no hardcoded value).
  // Weighted: missions 35%, habits 35%, reflections 15%, sim average 15%.
  const consistencyScore = useMemo(() => {
    const missionDone = dailyMissions.filter((m) => m.status === 'completed').length;
    const missionPct = dailyMissions.length ? (missionDone / dailyMissions.length) * 100 : 0;

    const habitDays = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
    const habitTarget = habits.reduce((sum, h) => sum + h.targetPerWeek, 0) * 7;
    const habitPct = habitTarget ? Math.min(100, (habitDays / habitTarget) * 100) : 0;

    const reflectionPct = Math.min(100, reflections.length * 10);

    const simScores = evolutionItems
      .filter((e) => e.category === 'Simulation Audit')
      .map((e) => parseInt(e.changeValue) || 0)
      .filter((n) => n > 0);
    const simPct = simScores.length
      ? simScores.reduce((a, b) => a + b, 0) / simScores.length
      : 0;

    const score = Math.round(
      missionPct * 0.35 + habitPct * 0.35 + reflectionPct * 0.15 + simPct * 0.15
    );
    return Math.max(0, Math.min(100, score));
  }, [dailyMissions, habits, reflections, evolutionItems]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('pf_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem('pf_traits', JSON.stringify(traits));
  }, [traits]);

  useEffect(() => {
    localStorage.setItem('pf_blended_refs', JSON.stringify(blendedReferences));
  }, [blendedReferences]);

  useEffect(() => {
    localStorage.setItem('pf_missions', JSON.stringify(dailyMissions));
  }, [dailyMissions]);

  useEffect(() => {
    localStorage.setItem('pf_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('pf_reflections', JSON.stringify(reflections));
  }, [reflections]);

  useEffect(() => {
    localStorage.setItem('pf_evolution', JSON.stringify(evolutionItems));
  }, [evolutionItems]);

  // Handlers
  const handleLogin = (profile: { email: string; personaName: string; archetype: string }) => {
    const updated = {
      ...session,
      ...profile,
      isAuthenticated: true
    };
    setSession(updated);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
    setCurrentView('login');
  };

  const handleUpdateSession = (updated: Partial<UserSession>) => {
    setSession((prev) => ({ ...prev, ...updated }));
  };

  const handlePurgeData = () => {
    localStorage.clear();
    setSession(INITIAL_SESSION);
    setTraits(INITIAL_TRAITS);
    setBlendedReferences([]);
    setDailyMissions(INITIAL_DAILY_MISSIONS);
    setHabits(INITIAL_HABITS);
    setReflections(INITIAL_REFLECTIONS);
    setEvolutionItems(INITIAL_EVOLUTION_ITEMS);
    setCurrentView('dashboard');
  };

  const handleToggleMission = (id: string) => {
    setDailyMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' }
          : m
      )
    );
  };

  const handleAddMission = (mission: DailyMission) => {
    setDailyMissions((prev) => [mission, ...prev]);
  };

  const handleApplyReference = (ref: ReferenceItem) => {
    // Add reference to blended list
    if (!blendedReferences.includes(ref.id)) {
      setBlendedReferences((prev) => [...prev, ref.id]);
    }

    // Apply trait modifiers to current traits
    setTraits((prevTraits) => {
      return prevTraits.map((t) => {
        const mod = ref.dnaModifiers[t.name];
        if (mod) {
          const newVal = Math.min(100, Math.max(0, t.value + mod));
          return { ...t, value: newVal };
        }
        return t;
      });
    });

    // Log an evolution entry
    const newEvolution: EvolutionItem = {
      id: `evo-${Date.now()}`,
      title: `Integrated Archetype: ${ref.name}`,
      description: `Synthesized mental models from ${ref.name} (${ref.title}). Calibrated psychological baseline weights.`,
      icon: 'trending_up',
      timestamp: 'Just now',
      category: 'Archetype Fusion',
      changeValue: '+4% Alignment'
    };
    setEvolutionItems((prev) => [newEvolution, ...prev]);
  };

  const handleAddEvolution = (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => {
    const newItem: EvolutionItem = {
      ...item,
      id: `evo-${Date.now()}`,
      timestamp: 'Just now'
    };
    setEvolutionItems((prev) => [newItem, ...prev]);
  };

  const handleToggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newDays = [...h.days];
          newDays[dayIndex] = !newDays[dayIndex];
          const newStreak = newDays[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1);
          return { ...h, days: newDays, streak: newStreak };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (habit: HabitItem) => {
    setHabits((prev) => [...prev, habit]);
  };

  const handleAddReflection = (entry: ReflectionEntry) => {
    setReflections((prev) => [entry, ...prev]);
  };

  const handleRecordSimulationResult = (scenarioId: string, score: number) => {
    // Dynamically adjust consistency score or add evolution log
    const newEvolution: EvolutionItem = {
      id: `evo-sim-${Date.now()}`,
      title: `Crucible Test Completed`,
      description: `Executed tactical response in simulation. Achieved ${score}% alignment with core archetype.`,
      icon: 'balance',
      timestamp: 'Just now',
      category: 'Simulation Audit',
      changeValue: `${score}% Match`
    };
    setEvolutionItems((prev) => [newEvolution, ...prev]);
  };

  // ponytail: track the More sheet as overlay state, not a route.
  // When open, it sits on top of whatever demoted view the user picks.
  const [moreOpen, setMoreOpen] = useState(false);

  // If in login view, render clean single login screen
  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e5e2e1] flex antialiased selection:bg-[#c8c6c5] selection:text-[#121212]">
      {/* Navigation (Desktop Sidebar & Mobile Dock) */}
      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        userEmail={session.email}
        personaName={session.personaName}
        onLogout={handleLogout}
        onOpenMore={() => setMoreOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:ml-72 p-4 sm:p-6 md:p-10 lg:p-12 mb-20 md:mb-0">
        <div key={currentView} className="animate-view-in">
        {currentView === 'today' && (
          <TodayView
            userName={session.personaName || 'Ching'}
            personaArchetype={session.archetype || 'THE STRATEGIC OPERATOR'}
            consistencyScore={consistencyScore}
            dailyMissions={dailyMissions}
            evolutionItems={evolutionItems}
            predictiveInsights={session.predictiveInsights}
            onNavigate={setCurrentView}
            onToggleMission={handleToggleMission}
          />
        )}

        {currentView === 'dna' && (
          <DNAEditorView
            traits={traits}
            onUpdateTraits={setTraits}
            onSaveVersion={() => {
              const newEvolution: EvolutionItem = {
                id: `evo-dna-${Date.now()}`,
                title: 'DNA Matrix Recalibrated',
                description: 'Updated psychological weightings across discipline, composure, and ambition baselines.',
                icon: 'balance',
                timestamp: 'Just now',
                category: 'DNA Recalibration',
                changeValue: 'Version Saved'
              };
              setEvolutionItems((prev) => [newEvolution, ...prev]);
            }}
            onResetTraits={() => setTraits(INITIAL_TRAITS)}
          />
        )}

        {currentView === 'train' && (
          <TrainView
            scenarios={scenarios}
            activeTraits={traits}
            references={references}
            blendedReferences={blendedReferences}
            onRecordSimulationResult={handleRecordSimulationResult}
            onApplyReference={handleApplyReference}
          />
        )}

        {currentView === 'journal' && (
          <JournalView
            habits={habits}
            onToggleHabitDay={handleToggleHabitDay}
            onAddHabit={handleAddHabit}
            reflections={reflections}
            onAddReflection={handleAddReflection}
            evolutionItems={evolutionItems}
            onAddEvolution={handleAddEvolution}
          />
        )}

        {currentView === 'more-persona' && (
          <MyPersonaView
            personaName={session.personaName}
            archetype={session.archetype}
            traits={traits}
            blendedReferences={blendedReferences}
            allReferences={references}
            consistencyScore={consistencyScore}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'more-references' && (
          <ReferenceLibraryView
            references={references}
            activeTraits={traits}
            onApplyReference={handleApplyReference}
            blendedReferences={blendedReferences}
          />
        )}

        {currentView === 'more-evolution' && (
          <EvolutionView
            evolutionItems={evolutionItems}
            traits={traits}
            consistencyScore={consistencyScore}
          />
        )}

        {currentView === 'more-settings' && (
          <SettingsView
            session={session}
            onUpdateSession={handleUpdateSession}
            onPurgeData={handlePurgeData}
          />
        )}
        </div>
      </main>

      {/* More menu overlay — picks one of the demoted destinations */}
      <MoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onNavigate={setCurrentView}
      />
    </div>
  );
}
