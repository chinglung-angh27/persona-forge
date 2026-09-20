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
  SimulatorScenario,
  Trait,
} from './types';
import { INITIAL_REFERENCES } from './data/initialData';
import { callLLM } from './lib/openrouterClient';
import {
  useSession,
  usePersona,
  useSimulation,
  useJournal,
  useNavigation,
  useReferenceLibrary,
} from './hooks';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/LoginView';
import { TodayView } from './components/TodayView';
import { TrainView } from './components/TrainView';
import { MultiAgentSimulator } from './components/MultiAgentSimulator';
import { JournalView } from './components/JournalView';
import { DNAEditorView } from './components/DNAEditorView';
import { MoreMenu } from './components/MoreMenu';
import { SettingsView } from './components/SettingsView';
import { PersonaLibraryView } from './components/PersonaLibraryView';
import { CreatePersonaView } from './components/CreatePersonaView';
import { PersonaManageView } from './components/PersonaManageView';

export default function App() {
  // Session
  const { session, handleLogin, handleLogout, handleUpdateSession } = useSession();

  // Personas
  const {
    personas,
    activePersonaId,
    activePersona,
    setActivePersonaId,
    handleSwitchPersona,
    handleCreatePersona,
    handleArchivePersona,
    handleUpdatePersonaMeta,
    handlePurgeData,
    updateActivePersona,
  } = usePersona();

  // Simulation
  const {
    scenarios,
    unlockedScenarioIds,
    getUnlockedScenarios,
    handleUnlockScenario,
    handleCreateScenario,
    setUnlockedScenarioIds,
  } = useSimulation(activePersona.traits);

  // Journal handlers
  const {
    handleToggleMission,
    handleAddMission,
    handleAddEvolution,
    handleToggleHabitDay,
    handleAddHabit,
    handleAddReflection,
    handleRecordSimulationResult,
    handleGenerateReflection,
    handleResetTraits,
  } = useJournal({ updateActivePersona, activePersona });

  // Reference Library
  const {
    references,
    addReference,
    updateReference,
    deleteReference,
    isInitialReference,
  } = useReferenceLibrary();

  // Navigation
  const { currentView, setCurrentView } = useNavigation(
    session.isAuthenticated ? 'today' : 'login',
    activePersonaId,
    personas
  );

  // More menu overlay state
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Consistency score - derived from active persona
  const consistencyScore = useMemo(() => {
    const dailyMissions = activePersona?.dailyMissions ?? [];
    const habits = activePersona?.habits ?? [];
    const reflections = activePersona?.reflections ?? [];
    const evolutionItems = activePersona?.evolutionItems ?? [];

    const missionDone = dailyMissions.filter((m) => m.status === 'completed').length;
    const missionPct = dailyMissions.length ? (missionDone / dailyMissions.length) * 100 : 0;

    const habitDays = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
    const habitTarget = habits.reduce((sum, h) => sum + h.targetPerWeek, 0); // targetPerWeek IS the weekly target
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

  // Handle scenario unlock on simulation result
  const handleRecordSimulationResultWithUnlock = (
    scenarioId: string,
    score: number
  ) => {
    handleRecordSimulationResult(scenarioId, score, scenarios);
    if (score >= 70) {
      const idx = scenarios.findIndex((s) => s.id === scenarioId);
      if (idx >= 0 && idx < scenarios.length - 1) {
        const nextId = scenarios[idx + 1].id;
        if (!unlockedScenarioIds.includes(nextId)) {
          setTimeout(() => handleUnlockScenario(nextId), 1500);
        }
      }
    }
  };

  const handleSharePersona = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?persona=${activePersonaId}`;
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      console.error('Failed to share link');
    }
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

  // If in login view, render clean single login screen
  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e5e2e1] flex antialiased selection:bg-[#c8c6c5] selection:text-[#121212] h-[2048px]">
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
      <main className="flex-1 min-w-0 md:ml-72 p-4 sm:p-6 md:p-10 lg:p-12 pt-[150px] md:pt-10 lg:pt-12 mb-20 md:mb-0 h-[2018px] -translate-y-[32px]">
        {currentView === 'train' && (
          <div className="w-full max-w-7xl mx-auto pb-16 -translate-y-[11px] h-[2000px]">
            <TrainView
              scenarios={getUnlockedScenarios()}
              allScenarios={scenarios}
              unlockedScenarioIds={unlockedScenarioIds}
              activeTraits={activePersona.traits}
              references={references}
              blendedReferences={activePersona.blendedReferenceIds}
              onRecordSimulationResult={handleRecordSimulationResultWithUnlock}
              onGenerateReflection={handleGenerateReflection}
              onCreateScenario={handleCreateScenario}
              onApplyReference={handleApplyReference}
              onAddReference={addReference}
              onUpdateReference={updateReference}
              onDeleteReference={deleteReference}
              isInitialReference={isInitialReference}
            />
          </div>
        )}
        <div key={currentView} className="animate-view-in h-[1980px]">
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

        {currentView === 'more-settings' && (
          <SettingsView
            session={session}
            onUpdateSession={handleUpdateSession}
            onPurgeData={handlePurgeData}
            onSharePersona={handleSharePersona}
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
            references={INITIAL_REFERENCES}
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
        onSharePersona={handleSharePersona}
      />
    </div>
  );
}