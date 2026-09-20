import React, { useState } from 'react';
import { SimulatorScenario } from '../types';
import { X, Plus } from 'lucide-react';

interface ScenarioCreatorProps {
  open: boolean;
  onClose: () => void;
  onCreateScenario: (scenario: Omit<SimulatorScenario, 'id'>) => void;
}

export const ScenarioCreator: React.FC<ScenarioCreatorProps> = ({
  open,
  onClose,
  onCreateScenario,
}) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Elevated' | 'Critical'>(
    'Standard'
  );
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<
    { text: string; alignmentScore: number; traitWeights: { name: string; weight: number }[] }[]
  >([{ text: '', alignmentScore: 50, traitWeights: [] }]);

  if (!open) return null;

  const addOption = () => {
    setOptions([...options, { text: '', alignmentScore: 50, traitWeights: [] }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (
    index: number,
    field: 'text' | 'alignmentScore',
    value: string | number
  ) => {
    setOptions(
      options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    );
  };

  const addTraitWeight = (optionIndex: number) => {
    setOptions(
      options.map((opt, i) =>
        i === optionIndex
          ? { ...opt, traitWeights: [...opt.traitWeights, { name: '', weight: 0 }] }
          : opt
      )
    );
  };

  const removeTraitWeight = (optionIndex: number, traitIndex: number) => {
    setOptions(
      options.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              traitWeights: opt.traitWeights.filter((_, j) => j !== traitIndex),
            }
          : opt
      )
    );
  };

  const updateTraitWeight = (
    optionIndex: number,
    traitIndex: number,
    field: 'name' | 'weight',
    value: string | number
  ) => {
    setOptions(
      options.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              traitWeights: opt.traitWeights.map((tw, j) =>
                j === traitIndex ? { ...tw, [field]: value } : tw
              ),
            }
          : opt
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !context.trim()) return;

    const scenario: Omit<SimulatorScenario, 'id'> = {
      title: title.trim(),
      context: context.trim(),
      difficulty,
      category: category.trim(),
      options: options.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: opt.text.trim(),
        alignmentScore: opt.alignmentScore,
        traitWeights: Object.fromEntries(
          opt.traitWeights
            .filter((tw) => tw.name.trim())
            .map((tw) => [tw.name.trim(), tw.weight])
        ),
        feedback: '',
      })),
    };

    onCreateScenario(scenario);
    onClose();
    // Reset form
    setTitle('');
    setContext('');
    setDifficulty('Standard');
    setCategory('');
    setOptions([{ text: '', alignmentScore: 50, traitWeights: [] }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="neo-extruded-large bg-[#121212] rounded-3xl border border-[#1e1e1e] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e1e]">
          <h2 className="font-display text-2xl font-bold text-[#e5e2e1]">
            Create Scenario
          </h2>
          <button
            onClick={onClose}
            className="neo-recessed w-8 h-8 rounded-full flex items-center justify-center border border-[#1e1e1e] text-[#8e9192] hover:text-[#e5e2e1] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-widest block mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-xl px-4 py-3 font-body text-sm border border-[#1e1e1e] placeholder-[#3a3a3a]"
              placeholder="Enter scenario title..."
              required
            />
          </div>

          {/* Context */}
          <div>
            <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-widest block mb-2">
              Context
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-xl px-4 py-3 font-body text-sm border border-[#1e1e1e] placeholder-[#3a3a3a] resize-none"
              placeholder="Describe the scenario context..."
              required
            />
          </div>

          {/* Difficulty & Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-widest block mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as 'Standard' | 'Elevated' | 'Critical')
                }
                className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-xl px-4 py-3 font-body text-sm border border-[#1e1e1e] appearance-none cursor-pointer"
              >
                <option value="Standard">Standard</option>
                <option value="Elevated">Elevated</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-widest block mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-xl px-4 py-3 font-body text-sm border border-[#1e1e1e] placeholder-[#3a3a3a]"
                placeholder="e.g. Crisis Management"
                required
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-widest">
                Options
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 font-mono-code text-xs text-[#c8c6c5] hover:text-[#e5e2e1] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-4">
              {options.map((opt, index) => (
                <div key={index} className="neo-recessed rounded-xl p-4 space-y-3 border border-[#1e1e1e]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-xs text-[#8e9192]">
                      Option {index + 1}
                    </span>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-[#3a3a3a] hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={opt.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    rows={2}
                    className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-lg px-3 py-2 font-body text-sm border border-[#1e1e1e] placeholder-[#3a3a3a] resize-none"
                    placeholder="Option text..."
                    required
                  />

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="font-mono-code text-xs text-[#8e9192] uppercase block mb-1">
                        Alignment Score
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={opt.alignmentScore}
                        onChange={(e) =>
                          updateOption(index, 'alignmentScore', parseInt(e.target.value, 10) || 0)
                        }
                        className="neo-input w-full bg-[#0a0a0a] text-[#e5e2e1] rounded-lg px-3 py-2 font-body text-sm border border-[#1e1e1e] appearance-none"
                      />
                    </div>
                  </div>

                  {/* Trait weights */}
                  <div className="space-y-2">
                    <div className="font-mono-code text-xs text-[#8e9192] uppercase">
                      Trait Weights
                    </div>
                    {opt.traitWeights.map((tw, tIdx) => (
                      <div key={tIdx} className="flex gap-2">
                        <input
                          type="text"
                          value={tw.name}
                          onChange={(e) =>
                            updateTraitWeight(index, tIdx, 'name', e.target.value)
                          }
                          className="neo-input flex-1 bg-[#0a0a0a] text-[#e5e2e1] rounded-lg px-3 py-1.5 font-body text-xs border border-[#1e1e1e] placeholder-[#3a3a3a]"
                          placeholder="Trait name"
                        />
                        <input
                          type="number"
                          value={tw.weight}
                          onChange={(e) =>
                            updateTraitWeight(index, tIdx, 'weight', parseInt(e.target.value, 10) || 0)
                          }
                          className="neo-input w-20 bg-[#0a0a0a] text-[#e5e2e1] rounded-lg px-3 py-1.5 font-body text-xs border border-[#1e1e1e] appearance-none"
                          placeholder="Weight"
                        />
                        <button
                          type="button"
                          onClick={() => removeTraitWeight(index, tIdx)}
                          className="text-[#3a3a3a] hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTraitWeight(index)}
                      className="font-mono-code text-xs text-[#8e9192] hover:text-[#c8c6c5] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add trait weight</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit / Cancel */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn flex-1 py-3 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#8e9192] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn flex-1 py-3 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white cursor-pointer"
            >
              Create Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
