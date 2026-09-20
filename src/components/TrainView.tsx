import React, { useState, useEffect } from 'react';
import { SimulatorScenario, Trait, ReferenceItem } from '../types';
import { MultiAgentSimulator } from './MultiAgentSimulator';
import { ReferenceLibraryView } from './ReferenceLibraryView';
import { ScenarioCreator } from './ScenarioCreator';
import { Cpu, Bookmark, Plus } from 'lucide-react';

interface TrainViewProps {
  scenarios: SimulatorScenario[];
  allScenarios: SimulatorScenario[];
  unlockedScenarioIds: string[];
  activeTraits: Trait[];
  references: ReferenceItem[];
  blendedReferences: string[];
  onRecordSimulationResult: (scenarioId: string, alignmentScore: number) => void;
  onGenerateReflection?: (scenarioId: string, finalScore: number, finalVerdict: string) => void;
  onCreateScenario?: (scenario: Omit<SimulatorScenario, 'id'>) => void;
  onApplyReference: (ref: ReferenceItem) => void;
  onAddReference?: (ref: Omit<ReferenceItem, 'id'>) => void;
  onUpdateReference?: (id: string, ref: Partial<ReferenceItem>) => void;
  onDeleteReference?: (id: string) => void;
  isInitialReference?: (id: string) => boolean;
}

// ponytail: Train merges Simulator (Practice) and Reference Library (Mentors) under
// one tab with a sub-tab strip. Both share the same activeTraits/blendedReferences,
// so splitting them across nav tabs was 2 surfaces for 1 concept.
export const TrainView: React.FC<TrainViewProps> = ({
  scenarios,
  allScenarios,
  unlockedScenarioIds,
  activeTraits,
  references,
  blendedReferences,
  onRecordSimulationResult,
  onGenerateReflection,
  onCreateScenario,
  onApplyReference,
  onAddReference,
  onUpdateReference,
  onDeleteReference,
  isInitialReference
}) => {
  const [tab, setTab] = useState<'practice' | 'mentors'>('practice');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showCreator, setShowCreator] = useState(false);

  // Clamp scenarioIndex when unlocked scenarios shrink (e.g. after lock reset)
  useEffect(() => {
    if (scenarioIndex >= scenarios.length) {
      setScenarioIndex(Math.max(0, scenarios.length - 1));
    }
  }, [scenarios.length, scenarioIndex]);

  const handleScenarioChange = (index: number) => {
    if (index !== scenarioIndex) {
      setScenarioIndex(index);
      setTab('practice');
    }
  };

  return (
    <>
      {/* Scenario selector strip */}
      <div className="pt-2 mb-4 flex gap-2 overflow-x-auto pb-1 items-center">
        {allScenarios.map((scenario, index) => {
          const unlocked = unlockedScenarioIds.includes(scenario.id);
          return (
            <button
              key={scenario.id}
              onClick={() => unlocked && handleScenarioChange(index)}
              disabled={!unlocked}
              className={`flex-shrink-0 rounded-full px-4 py-2 border text-xs font-mono-code uppercase tracking-wider transition-all ${
                unlocked
                  ? index === scenarioIndex
                    ? 'neo-recessed bg-[#121212] text-[#c8c6c5] border-[#2a2a2a] font-semibold'
                    : 'neo-extruded-sm bg-[#121212] text-[#c8c6c5] hover:text-[#e5e2e1] border-[#1e1e1e]'
                  : 'neo-recessed bg-[#0a0a0a] text-[#3a3a3a] border-[#1a1a1a] cursor-not-allowed'
              }`}
            >
              <span className="block mb-0.5">
                {unlocked ? scenario.title : `${scenario.title} 🔒`}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  scenario.difficulty === 'Critical' ? 'bg-red-500' :
                  scenario.difficulty === 'Elevated' ? 'bg-amber-500' :
                  'bg-green-500'
                }`} />
                <span>{scenario.difficulty}</span>
                <span className="text-[#3a3a3a]">·</span>
                <span>{scenario.category}</span>
                {!unlocked && <span className="text-[#3a3a3a]">🔒</span>}
              </span>
            </button>
          );
        })}
        {onCreateScenario && (
          <button
            onClick={() => setShowCreator(true)}
            className="flex-shrink-0 w-8 h-8 rounded-full neo-extruded-sm bg-[#121212] border border-[#1e1e1e] flex items-center justify-center text-[#8e9192] hover:text-[#c8c6c5] transition-colors cursor-pointer"
            title="Create Scenario"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sub-tab strip */}
      <div className="pt-2 mb-6 flex items-center gap-3">
        <button
          onClick={() => setTab('practice')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono-code text-xs uppercase tracking-widest border transition-all ${
            tab === 'practice'
              ? 'neo-recessed bg-[#121212] text-[#c8c6c5] border-[#2a2a2a] font-semibold'
              : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border-[#1e1e1e]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Practice</span>
        </button>
        <button
          onClick={() => setTab('mentors')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono-code text-xs uppercase tracking-widest border transition-all ${
            tab === 'mentors'
              ? 'neo-recessed bg-[#121212] text-[#c8c6c5] border-[#2a2a2a] font-semibold'
              : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border-[#1e1e1e]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Mentors</span>
        </button>
      </div>

      {showCreator && onCreateScenario && (
        <ScenarioCreator
          open={showCreator}
          onClose={() => setShowCreator(false)}
          onCreateScenario={(scenario) => {
            onCreateScenario(scenario);
            setShowCreator(false);
          }}
        />
      )}

      {tab === 'practice' ? (
        <MultiAgentSimulator
          scenario={allScenarios[scenarioIndex]}
          traits={activeTraits}
          onRecordResult={onRecordSimulationResult}
          onGenerateReflection={onGenerateReflection}
        />
      ) : (
        <ReferenceLibraryView
          references={references}
          activeTraits={activeTraits}
          onApplyReference={onApplyReference}
          blendedReferences={blendedReferences}
          onAddReference={onAddReference}
          onUpdateReference={onUpdateReference}
          onDeleteReference={onDeleteReference}
          isInitialReference={isInitialReference}
        />
      )}
    </>
  );
};
