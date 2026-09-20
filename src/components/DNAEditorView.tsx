import React, { useState } from 'react';
import { Trait } from '../types';
import { 
  Dumbbell, 
  Eye, 
  MessageSquare, 
  Lightbulb, 
  Rocket, 
  HeartHandshake, 
  RotateCcw, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  Plus,
  Sparkles,
  Info
} from 'lucide-react';

interface DNAEditorViewProps {
  traits: Trait[];
  onUpdateTraits: (traits: Trait[]) => void;
  onSaveVersion: () => void;
  onResetTraits: () => void;
}

export const DNAEditorView: React.FC<DNAEditorViewProps> = ({
  traits,
  onUpdateTraits,
  onSaveVersion,
  onResetTraits
}) => {
  const [localTraits, setLocalTraits] = useState<Trait[]>(traits);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitValue, setNewTraitValue] = useState(50);
  const [newTraitDesc, setNewTraitDesc] = useState('');

  // Sync if parent traits change (e.g. from Reference library "ADD TO PERSONA")
  React.useEffect(() => {
    setLocalTraits(traits);
  }, [traits]);

  const handleSliderChange = (id: string, value: number) => {
    const updated = localTraits.map((t) => (t.id === id ? { ...t, value } : t));
    setLocalTraits(updated);
    onUpdateTraits(updated);
  };

  const handleSave = () => {
    onSaveVersion();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    onResetTraits();
    setSaveSuccess(false);
  };

  const handleAddCustomTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraitName.trim()) return;
    const newTrait: Trait = {
      id: newTraitName.toLowerCase().replace(/\s+/g, '-'),
      name: newTraitName.trim(),
      value: newTraitValue,
      icon: 'lightbulb',
      description: newTraitDesc.trim() || 'Custom calibrated psychological baseline attribute.',
      category: 'cognitive'
    };
    const updated = [...localTraits, newTrait];
    setLocalTraits(updated);
    onUpdateTraits(updated);
    setNewTraitName('');
    setNewTraitDesc('');
    setShowAddModal(false);
  };

  // Helper for icons
  const renderTraitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('discipline')) return <Dumbbell className="w-4 h-4 text-[#c8c6c5]" />;
    if (lower.includes('confidence')) return <Eye className="w-4 h-4 text-[#c8c6c5]" />;
    if (lower.includes('charisma')) return <MessageSquare className="w-4 h-4 text-[#c8c6c5]" />;
    if (lower.includes('creativity')) return <Lightbulb className="w-4 h-4 text-[#c8c6c5]" />;
    if (lower.includes('ambition')) return <Rocket className="w-4 h-4 text-[#c8c6c5]" />;
    if (lower.includes('composure')) return <HeartHandshake className="w-4 h-4 text-[#c8c6c5]" />;
    return <Sparkles className="w-4 h-4 text-[#c8c6c5]" />;
  };

  // Dynamic analysis generator based on current values
  const getTraitVal = (name: string) => {
    const found = localTraits.find((t) => t.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : 50;
  };

  const discipline = getTraitVal('Discipline');
  const confidence = getTraitVal('Confidence');
  const creativity = getTraitVal('Creativity');
  const ambition = getTraitVal('Ambition');
  const composure = getTraitVal('Composure');
  const charisma = getTraitVal('Charisma');

  const getArchetypeAnalysis = () => {
    if (creativity > 80 && ambition > 80) {
      return `Highly creative and ambitious profile. Shows strong self-belief (Confidence ${confidence}%) with supreme divergent synthesis capacity (${creativity}%). ${
        composure < 50
          ? `May struggle under prolonged emotional chaos due to lower composure baseline (${composure}%).`
          : `Maintains solid psychological equilibrium (${composure}%).`
      }`;
    }
    if (discipline > 80 && composure > 70) {
      return `Stoic Operator profile. Displays formidable operational consistency (${discipline}%) and unwavering emotional regulation under crisis conditions (${composure}%).`;
    }
    return `Balanced Tactical profile. Balanced distribution across strategic traits with focus on high-agency problem resolution.`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
              DNA Editor
            </h1>
            <p className="font-body text-base text-[#8e9192] mt-2 max-w-3xl leading-relaxed">
              Calibrate your core psychological traits. Adjusting these parameters alters your persona's baseline responses in the Simulator and Daily Mode.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] flex items-center gap-2 border border-[#2a2a2a] hover:text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Trait</span>
          </button>
        </div>
      </header>

      {/* Grid Layout: Sliders Area + Sidebar Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Area (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="neo-card bg-[#121212] p-8 md:p-10 rounded-2xl flex flex-col gap-8 border border-[#1e1e1e]/60">
            {/* Trait Controls */}
            <div className="flex flex-col gap-8">
              {localTraits.map((trait) => (
                <div key={trait.id} className="trait-control flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-mono-code text-sm text-[#e5e2e1] flex items-center gap-2.5 font-medium tracking-wide">
                      {renderTraitIcon(trait.name)}
                      <span>{trait.name}</span>
                    </label>
                    <span className="font-mono-code text-sm font-semibold text-[#c8c6c5] px-2.5 py-1 rounded bg-[#1c1b1b] neo-recessed">
                      {trait.value}%
                    </span>
                  </div>

                  {/* Range Slider Container with Visual Fill */}
                  <div className="relative w-full h-8 flex items-center">
                    <input
                      id={`slider-${trait.id}`}
                      type="range"
                      min="0"
                      max="100"
                      value={trait.value}
                      onChange={(e) => handleSliderChange(trait.id, parseInt(e.target.value, 10))}
                      className="w-full z-10 cursor-pointer"
                      aria-label={`Calibrate ${trait.name}`}
                    />
                    {/* Visual Fill indicator */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-[#c8c6c5]/25 rounded-l-full pointer-events-none transition-all duration-75"
                      style={{
                        width: `${trait.value}%`,
                        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.5)',
                      }}
                    />
                  </div>

                  <p className="font-body text-xs text-[#7e7d7d] mt-1 pl-1">
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-[#1e1e1e]">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1] neo-btn flex items-center gap-2 border border-[#2a2a2a] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET BASELINE</span>
              </button>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="font-mono-code text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Version Saved</span>
                  </span>
                )}

                <button
                  onClick={handleSave}
                  className="px-8 py-3 rounded-xl font-mono-code text-xs font-bold text-[#121212] bg-[#c8c6c5] hover:bg-[#e5e2e1] shadow-[-6px_-6px_12px_rgba(255,255,255,0.1),6px_6px_12px_rgba(0,0,0,0.8)] active:neo-recessed flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE VERSION</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary (4 cols on lg) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="neo-recessed bg-[#121212] p-6 md:p-8 rounded-2xl h-full border border-[#1e1e1e] flex flex-col gap-6">
            <h3 className="font-display text-xl text-[#c8c6c5] font-semibold flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#c8c6c5]" />
              <span>Persona Summary</span>
            </h3>

            {/* Archetype Analysis */}
            <div>
              <h4 className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-[0.2em] mb-2 font-medium">
                Archetype Analysis
              </h4>
              <p className="font-body text-sm text-[#c4c7c7] leading-relaxed">
                {getArchetypeAnalysis()}
              </p>
            </div>

            {/* Projected Behaviors */}
            <div className="neo-extruded p-5 rounded-xl bg-[#0e0e0e] border border-[#1e1e1e]/80">
              <h4 className="font-mono-code text-[10px] text-[#c8c6c5] uppercase tracking-[0.2em] mb-4 font-semibold">
                Projected Behaviors
              </h4>
              <ul className="space-y-3.5 font-body text-sm text-[#c4c7c7]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#8e9192] shrink-0 mt-0.5" />
                  <span>
                    {creativity > 70
                      ? 'Initiates original projects.'
                      : 'Follows structured playbooks.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#8e9192] shrink-0 mt-0.5" />
                  <span>
                    {confidence > 70
                      ? 'Assertive communication.'
                      : 'Diplomatic communication.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  {composure < 60 ? (
                    <AlertTriangle className="w-4 h-4 text-[#ffb4ab] shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span className={composure < 60 ? 'text-[#ffb4ab]' : ''}>
                    {composure < 60
                      ? 'Reactive under crisis.'
                      : 'Composed under crisis.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#8e9192] shrink-0 mt-0.5" />
                  <span>
                    {discipline > 70
                      ? 'Self-directed protocols.'
                      : 'Needs external accountability.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Reference Integration Note */}
            <div className="mt-auto p-4 rounded-xl neo-recessed border border-[#1e1e1e] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#c8c6c5] shrink-0 mt-0.5" />
              <p className="font-body text-xs text-[#8e9192] leading-relaxed">
                Tip: Visit the <span className="text-[#c8c6c5] font-medium">Reference Library</span> to blend historical archetypes directly into your DNA matrix.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal for adding custom trait */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]">
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-2">
              Add Custom Psychological Trait
            </h3>
            <p className="font-body text-xs text-[#8e9192] mb-6">
              Create a custom parameter to shape your persona's behavior engine.
            </p>

            <form onSubmit={handleAddCustomTrait} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Trait Name
                </label>
                <input
                  type="text"
                  required
                  value={newTraitName}
                  onChange={(e) => setNewTraitName(e.target.value)}
                  placeholder="e.g. Asymmetric Audacity"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-mono-code text-xs text-[#c4c7c7] uppercase">
                    Initial Baseline Value
                  </label>
                  <span className="font-mono-code text-xs text-[#c8c6c5]">{newTraitValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newTraitValue}
                  onChange={(e) => setNewTraitValue(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Trait Definition
                </label>
                <textarea
                  rows={2}
                  value={newTraitDesc}
                  onChange={(e) => setNewTraitDesc(e.target.value)}
                  placeholder="How does this trait govern real-world decision calculus?"
                  className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e1e1e]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a] hover:text-white"
                >
                  Initialize Trait
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
