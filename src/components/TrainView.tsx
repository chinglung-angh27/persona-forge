import React, { useState } from 'react';
import { SimulatorScenario, Trait, ReferenceItem } from '../types';
import { SimulatorView } from './SimulatorView';
import { ReferenceLibraryView } from './ReferenceLibraryView';
import { Cpu, Bookmark } from 'lucide-react';

interface TrainViewProps {
  scenarios: SimulatorScenario[];
  activeTraits: Trait[];
  references: ReferenceItem[];
  blendedReferences: string[];
  onRecordSimulationResult: (scenarioId: string, alignmentScore: number) => void;
  onApplyReference: (ref: ReferenceItem) => void;
}

// ponytail: Train merges Simulator (Practice) and Reference Library (Mentors) under
// one tab with a sub-tab strip. Both share the same activeTraits/blendedReferences,
// so splitting them across nav tabs was 2 surfaces for 1 concept.
export const TrainView: React.FC<TrainViewProps> = ({
  scenarios,
  activeTraits,
  references,
  blendedReferences,
  onRecordSimulationResult,
  onApplyReference
}) => {
  const [tab, setTab] = useState<'practice' | 'mentors'>('practice');

  return (
    <div className="w-full max-w-7xl mx-auto pb-16">
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

      {tab === 'practice' ? (
        <SimulatorView
          scenarios={scenarios}
          activeTraits={activeTraits}
          onRecordSimulationResult={onRecordSimulationResult}
        />
      ) : (
        <ReferenceLibraryView
          references={references}
          activeTraits={activeTraits}
          onApplyReference={onApplyReference}
          blendedReferences={blendedReferences}
        />
      )}
    </div>
  );
};
