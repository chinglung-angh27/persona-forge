import React, { useState, useEffect, useMemo } from 'react';
import {
  ViewMode,
  UserSession,
  Persona,
  ReferenceItem,
  DailyMission,
  HabitItem,
  ReflectionEntry,
  EvolutionItem,
} from './types';
import {
  INITIAL_SESSION,
  INITIAL_TRAITS,
  INITIAL_REFERENCES,
  INITIAL_SIMULATOR_SCENARIOS,
  INITIAL_DAILY_MISSIONS,
  INITIAL_HABITS,
  INITIAL_REFLECTIONS,
  INITIAL_EVOLUTION_ITEMS,
} from './data/initialData';
import {
  loadPersonas, loadActivePersonaId, savePersonas, saveActivePersonaId,
  updateActivePersonaIn,
  seedPersona,
} from './lib/personaStore';
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
import { PersonaLibraryView } from './components/PersonaLibraryView';
import { CreatePersonaView } from './components/CreatePersonaView';
import { PersonaManageView } from './components/PersonaManageView';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('pf_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      // ponytail: a saved session with an email IS the local profile; don't force re-login.
      return { ...parsed, isAuthenticated: Boolean(parsed.email) };
    }
    return { ...INITIAL_SESSION, personaName: undefined, archetype: undefined, consistencyScore: undefined } as unknown as UserSession;
  });

  // Personas State
  const [personas, setPersonas] = useState<Persona[]>(() => loadPersonas());
  const [activePersonaId, setActivePersonaId] = useState<string>(() =>
    loadActivePersonaId(loadPersonas())
  );

  // Current View
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return session.isAuthenticated ? 'today' : 'login';
  });

  // Reference Library State (global, not per-persona)
  const [references] = useState<ReferenceItem[]>(INITIAL_REFERENCES);

  // Scenarios State (constant, not per-persona)
  const [scenarios] = useState(INITIAL_SIMULATOR_SCENARIOS);

  // ponytail: derive active persona from personas + activePersonaId.
  const activePersona = useMemo(
    () => personas.find((p) => p.id === activePersonaId) ?? personas[0],
    [personas, activePersonaId]
  );

  // ponytail: funnel all active-persona updates through one helper.
  // Task 4 will rewrite the handlers to use this.
  const updateActivePersona = (
    partial: Partial<Persona> | ((p: Persona) => Persona)
  ) => {
    setPersonas((prev) => updateActivePersonaIn(prev, activePersonaId, partial));
  };

  // Task 7: switch active persona — bumps lastActiveAt on the newly selected one.
  // Task 8 will own the create/library flows.
  const handleSwitchPersona = (id: string) => {
    setActivePersonaId(id);
    setPersonas((prev) => updateActivePersonaIn(prev, id, { lastActiveAt: new Date().toISOString() }));
  };

  // Task 8: library/create/manage flows.
  const handleCreatePersona = (name: string, archetype: string, blendIds: string[]) => {
    const now = new Date().toISOString();
    const p: Persona = {
      id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name, archetype, identityStatement: '',
      traits: INITIAL_TRAITS.map((t) => ({ ...t })),
      blendedReferenceIds: blendIds,
      dailyMissions: INITIAL_DAILY_MISSIONS.map((m) => ({ ...m })),
      habits: INITIAL_HABITS.map((h) => ({ ...h })),
      reflections: INITIAL_REFLECTIONS.map((r) => ({ ...r })),
      evolutionItems: INITIAL_EVOLUTION_ITEMS.map((e) => ({ ...e })),
      simulatorResults: [],
      createdAt: now, lastActiveAt: now, status: 'active',
    };
    setPersonas((prev) => [...prev, p]);
    setActivePersonaId(p.id);
  };

  const handleArchivePersona = (id: string) => {
    setPersonas((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status: 'archived' as const } : p));
      return next;
    });
  };

  const handleUpdatePersonaMeta = (
    id: string,
    meta: { name: string; archetype: string; identityStatement: string }
  ) => {
    setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, ...meta } : p)));
  };

  // ponytail: read-only aliases for the views Task 5/6 will rewire to activePersona.*.
  // Handlers below mutate the active persona via updateActivePersona — no setX shims.
  // ponytail: aliases removed — views now read activePersona.* directly.

  // Derive consistencyScore from real activity (no hardcoded value).
  // Weighted: missions 35%, habits 35%, reflections 15%, sim average 15%.
  const consistencyScore = useMemo(() => {
    const dailyMissions = activePersona?.dailyMissions ?? [];
    const habits = activePersona?.habits ?? [];
    const reflections = activePersona?.reflections ?? [];
    const evolutionItems = activePersona?.evolutionItems ?? [];

    const missionDone = dailyMissions.filter((m) => m.status === 'completed').length;
    const missionPct = dailyMissions.length ? (missionDone / dailyMissions.length) * 100 : 0;

    const habitDays = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
    const habitTarget = habits.reduce((sum, h) => sum + h.targetPerWeek, 0) * 7;
    const habitPct = habitTarget ? Math.min(100, (habitDays / habitTarget) * 100) : 0;

    const reflectionPct = Math.min(100, reflections.length * 10);

    const simScores = evolutionItems
      .filter((e) => e.category === 'Simulation Audit')
      .map((e) => parseInt(e.changeValue ?? '0', 10) || 0)
      .filter((n) => n > 0);
    const simPct = simScores.length
      ? simScores.reduce((a, b) => a + b, 0) / simScores.length
      : 0;

    const score = Math.round(
      missionPct * 0.35 + habitPct * 0.35 + reflectionPct * 0.15 + simPct * 0.15
    );
    return Math.max(0, Math.min(100, score));
  }, [activePersona]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('pf_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    savePersonas(personas);
  }, [personas]);

  useEffect(() => {
    saveActivePersonaId(activePersonaId);
  }, [activePersonaId]);

  // Restore active persona from ?persona=<id> on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('persona');
    if (pid && personas.some((p) => p.id === pid)) {
      setActivePersonaId(pid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect active persona in the URL.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('persona', activePersonaId);
    window.history.replaceState({}, '', url.toString());
  }, [activePersonaId]);

  // Handlers — every persona mutation funnels through updateActivePersona.
  const handleLogin = (email: string) => {
    setSession((prev) => ({ ...prev, email, isAuthenticated: true }));
    setPersonas((prev) => {
      if (prev.length > 0) return prev;
      // ponytail: first login seeds a persona with the default Ching / STRATEGIC OPERATOR.
      const p = seedPersona();
      setActivePersonaId(p.id);
      return [p];
    });
    setCurrentView('today');
  };

  const handleLogout = () => {
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
    setCurrentView('login');
  };

  const handleUpdateSession = (updated: Partial<UserSession>) => {
    setSession((prev) => ({ ...prev, ...updated }));
  };

  // ponytail: purge nukes storage and reseeds via personaStore.seedPersona — no flat state to clear.
  const handlePurgeData = () => {
    localStorage.clear();
    const p = seedPersona();
    setPersonas([p]);
    setActivePersonaId(p.id);
    setSession({ ...INITIAL_SESSION, activePersonaId: p.id, isAuthenticated: false, email: '' });
    setCurrentView('login');
  };

  const handleToggleMission = (id: string) => {
    updateActivePersona((p) => ({
      ...p,
      dailyMissions: p.dailyMissions.map((m) =>
        m.id === id ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' } : m
      ),
    }));
  };

  const handleAddMission = (mission: DailyMission) => {
    updateActivePersona((p) => ({ ...p, dailyMissions: [mission, ...p.dailyMissions] }));
  };

  const handleApplyReference = (ref: ReferenceItem) => {
    updateActivePersona((p) => {
      const blended = p.blendedReferenceIds.includes(ref.id)
        ? p.blendedReferenceIds
        : [...p.blendedReferenceIds, ref.id];
      const traits = p.traits.map((t) => {
        const mod = ref.dnaModifiers[t.name];
        return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
      });
      const newEvolution: EvolutionItem = {
        id: `evo-${Date.now()}`,
        title: `Integrated Archetype: ${ref.name}`,
        description: `Synthesized mental models from ${ref.name} (${ref.title}). Calibrated psychological baseline weights.`,
        icon: 'trending_up',
        timestamp: 'Just now',
        category: 'Archetype Fusion',
        changeValue: '+4% Alignment',
      };
      return { ...p, blendedReferenceIds: blended, traits, evolutionItems: [newEvolution, ...p.evolutionItems] };
    });
  };

  const handleAddEvolution = (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => {
    const newItem: EvolutionItem = {
      ...item,
      id: `evo-${Date.now()}`,
      timestamp: 'Just now',
    };
    updateActivePersona((p) => ({ ...p, evolutionItems: [newItem, ...p.evolutionItems] }));
  };

  const handleToggleHabitDay = (habitId: string, dayIndex: number) => {
    updateActivePersona((p) => ({
      ...p,
      habits: p.habits.map((h) => {
        if (h.id !== habitId) return h;
        const days = [...h.days];
        days[dayIndex] = !days[dayIndex];
        const streak = days[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, days, streak };
      }),
    }));
  };

  const handleAddHabit = (habit: HabitItem) => {
    updateActivePersona((p) => ({ ...p, habits: [...p.habits, habit] }));
  };

  const handleAddReflection = (entry: ReflectionEntry) => {
    updateActivePersona((p) => ({ ...p, reflections: [entry, ...p.reflections] }));
  };

  const handleRecordSimulationResult = (scenarioId: string, score: number) => {
    updateActivePersona((p) => {
      const newEvolution: EvolutionItem = {
        id: `evo-sim-${Date.now()}`,
        title: 'Crucible Test Completed',
        description: `Executed tactical response in simulation. Achieved ${score}% alignment with core archetype.`,
        icon: 'balance',
        timestamp: 'Just now',
        category: 'Simulation Audit',
        changeValue: `${score}% Match`,
      };
      return {
        ...p,
        evolutionItems: [newEvolution, ...p.evolutionItems],
        simulatorResults: [...p.simulatorResults, { scenarioId, score, ts: new Date().toISOString() }],
      };
    });
  };

  const handleResetTraits = () => {
    updateActivePersona((p) => ({ ...p, traits: INITIAL_TRAITS.map((t) => ({ ...t })) }));
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
        personaName={activePersona.name}
        onLogout={handleLogout}
        onOpenMore={() => setMoreOpen(true)}
        personas={personas}
        activePersonaId={activePersonaId}
        onSwitchPersona={handleSwitchPersona}
        onOpenLibrary={() => setCurrentView('library')}
        onOpenCreate={() => setCurrentView('persona-new')}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:ml-72 p-4 sm:p-6 md:p-10 lg:p-12 mb-20 md:mb-0">
        <div key={currentView} className="animate-view-in">
        {currentView === 'today' && (
          <TodayView
            userName={activePersona.name}
            personaArchetype={activePersona.archetype}
            identityStatement={activePersona.identityStatement}
            consistencyScore={consistencyScore}
            dailyMissions={activePersona.dailyMissions}
            evolutionItems={activePersona.evolutionItems}
            predictiveInsights={session.predictiveInsights}
            onNavigate={setCurrentView}
            onToggleMission={handleToggleMission}
          />
        )}

        {currentView === 'dna' && (
          <DNAEditorView
            traits={activePersona.traits}
            onUpdateTraits={(traits) => updateActivePersona({ traits })}
            onSaveVersion={handleAddEvolution.bind(null, {
              title: 'DNA Matrix Recalibrated',
              description: 'Updated psychological weightings across discipline, composure, and ambition baselines.',
              icon: 'balance', category: 'DNA Recalibration', changeValue: 'Version Saved',
            } as Omit<EvolutionItem, 'id' | 'timestamp'>)}
            onResetTraits={handleResetTraits}
          />
        )}

        {currentView === 'train' && (
          <TrainView
            scenarios={scenarios}
            activeTraits={activePersona.traits}
            references={references}
            blendedReferences={activePersona.blendedReferenceIds}
            onRecordSimulationResult={handleRecordSimulationResult}
            onApplyReference={handleApplyReference}
          />
        )}

        {currentView === 'journal' && (
          <JournalView
            habits={activePersona.habits}
            onToggleHabitDay={handleToggleHabitDay}
            onAddHabit={handleAddHabit}
            reflections={activePersona.reflections}
            onAddReflection={handleAddReflection}
            evolutionItems={activePersona.evolutionItems}
            onAddEvolution={handleAddEvolution}
          />
        )}

        {currentView === 'more-persona' && (
          <MyPersonaView
            personaName={activePersona.name}
            archetype={activePersona.archetype}
            traits={activePersona.traits}
            blendedReferences={activePersona.blendedReferenceIds}
            allReferences={references}
            consistencyScore={consistencyScore}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'more-references' && (
          <ReferenceLibraryView
            references={references}
            activeTraits={activePersona.traits}
            onApplyReference={handleApplyReference}
            blendedReferences={activePersona.blendedReferenceIds}
          />
        )}

        {currentView === 'more-evolution' && (
          <EvolutionView
            evolutionItems={activePersona.evolutionItems}
            traits={activePersona.traits}
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

        {currentView === 'library' && (
          <PersonaLibraryView
            personas={personas}
            activePersonaId={activePersonaId}
            onSwitch={handleSwitchPersona}
            onNavigate={setCurrentView}
            onArchive={handleArchivePersona}
          />
        )}

        {currentView === 'persona-new' && (
          <CreatePersonaView
            references={references}
            onNavigate={setCurrentView}
            onCreate={handleCreatePersona}
          />
        )}

        {currentView === 'persona-manage' && (
          <PersonaManageView
            persona={activePersona}
            onBack={() => setCurrentView('library')}
            onUpdateMeta={handleUpdatePersonaMeta}
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
