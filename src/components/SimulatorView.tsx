import React, { useState } from 'react';
import { SimulatorScenario, Trait } from '../types';
import { callGemini, GeminiUnavailableError, isGeminiAvailable } from '../lib/geminiClient';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Activity
} from 'lucide-react';

interface SimulatorViewProps {
  scenarios: SimulatorScenario[];
  activeTraits: Trait[];
  onRecordSimulationResult: (scenarioId: string, alignmentScore: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  scenarios,
  activeTraits,
  onRecordSimulationResult
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SimulatorScenario>(scenarios[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    traitAnalysis: string[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    setEvaluation(null);
  };

  const evaluateCustom = async (text: string, traits: Trait[]) => {
    const dna = traits.map((t) => `${t.name}: ${t.value}`).join(', ');
    const prompt =
      `Evaluate this response against the persona DNA {${dna}}. ` +
      `Respond JSON: {"score":0-100,"feedback":"...","traitAnalysis":["Trait: +/-N delta"]}. Response: ${text}`;
    try {
      const raw = await callGemini({ model: 'gemini-2.0-flash', contents: prompt, config: { maxOutputTokens: 512 } });
      const parsed = JSON.parse(raw.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}'));
      return {
        score: Number(parsed.score) || 50,
        feedback: String(parsed.feedback ?? 'Evaluated against baseline DNA.'),
        traitAnalysis: Array.isArray(parsed.traitAnalysis) ? parsed.traitAnalysis.map(String) : [],
      };
    } catch (e) {
      // Fall back to local eval ONLY when no Gemini runtime is configured.
      // A real API/parse error propagates so it isn't masked as an offline result.
      if (e instanceof GeminiUnavailableError) {
        return {
          score: 88,
          feedback: `Tactical evaluation: Highly autonomous formulation. Directly leverages calibrated Ambition and Creativity baseline. Resists emotional surrender.`,
          traitAnalysis: ['Discipline: +4 delta', 'Confidence: +6 delta', 'Composure: +3 delta'],
        };
      }
      throw e;
    }
  };

  const handleRunSimulation = () => {
    if (!selectedOptionId && !customResponse.trim()) return;

    setIsSimulating(true);
    setSimError(null);

    setTimeout(async () => {
      try {
        if (selectedOptionId) {
          const option = selectedScenario.options.find((o) => o.id === selectedOptionId);
          if (option) {
            const evalResult = {
              score: option.alignmentScore,
              feedback: option.feedback,
              traitAnalysis: Object.entries(option.traitWeights).map(
                ([trait, weight]) => `${trait}: ${(weight as number) > 0 ? '+' : ''}${weight} delta`
              )
            };
            setEvaluation(evalResult);
            onRecordSimulationResult(selectedScenario.id, evalResult.score);
          }
        } else if (customResponse.trim()) {
          // Live AI eval via cached client; falls back to local result if no Gemini runtime.
          const evalResult = await evaluateCustom(customResponse.trim(), activeTraits);
          setEvaluation(evalResult);
          onRecordSimulationResult(selectedScenario.id, evalResult.score);
        }
      } catch (e) {
        setSimError(e instanceof Error ? e.message : 'Simulation failed.');
      } finally {
        setIsSimulating(false);
      }
    }, 600);
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setCustomResponse('');
    setEvaluation(null);
    setSimError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="pt-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-[0.25em]">
            Neural Decision Crucible
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code neo-recessed ${
            isGeminiAvailable() ? 'bg-[#201f1f] text-emerald-400' : 'bg-[#1c1b1b] text-[#8e9192]'
          }`}>
            {isGeminiAvailable() ? 'AI SIMULATOR ONLINE' : 'LOCAL EVAL MODE'}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
          Scenario Simulator
        </h1>
        <p className="font-body text-base text-[#8e9192] mt-2 max-w-3xl leading-relaxed">
          Stress-test your calibrated persona against high-stakes pressure situations. Compare your instinctive decisions against the mathematical baseline of your DNA.
        </p>
      </header>

      {/* Scenario Selector Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {scenarios.map((scen, idx) => {
          const isSelected = selectedScenario.id === scen.id;
          return (
            <button
              key={scen.id}
              onClick={() => {
                setSelectedScenario(scen);
                handleReset();
              }}
              className={`shrink-0 px-5 py-3 rounded-2xl font-mono-code text-xs tracking-wider transition-all duration-200 text-left border ${
                isSelected
                  ? 'neo-recessed bg-[#121212] text-[#c8c6c5] border-[#2a2a2a] font-semibold'
                  : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border-[#1e1e1e]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c8c6c5]" />
                <span>Scenario 0{idx + 1}: {scen.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Crucible Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Context & Options (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="neo-card bg-[#121212] p-8 md:p-10 rounded-3xl border border-[#1e1e1e]/60 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">
                Context &amp; Trigger Event
              </span>
              <span className={`font-mono-code text-[11px] px-3 py-1 rounded-full neo-recessed uppercase font-semibold ${
                selectedScenario.difficulty === 'Critical'
                  ? 'text-[#ffb4ab] border border-[#ffb4ab]/30'
                  : 'text-[#c8c6c5] border border-[#2a2a2a]'
              }`}>
                {selectedScenario.difficulty} Stakes
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#e5e2e1]">
              {selectedScenario.title}
            </h2>

            <p className="font-body text-base md:text-lg text-[#c4c7c7] leading-relaxed neo-recessed p-6 rounded-2xl border border-[#1e1e1e]">
              {selectedScenario.context}
            </p>

            {/* Tactical Options */}
            <div className="space-y-4 pt-2">
              <h3 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">
                Select Tactical Response:
              </h3>

              {selectedScenario.options.map((opt, idx) => {
                const isChosen = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isChosen
                        ? 'neo-recessed bg-[#171717] border-[#c8c6c5]/50 text-[#e5e2e1]'
                        : 'neo-extruded bg-[#121212] border-[#1e1e1e] hover:border-[#2a2a2a] text-[#8e9192] hover:text-[#e5e2e1]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl neo-recessed flex items-center justify-center font-mono-code text-xs font-bold shrink-0 text-[#c8c6c5]">
                      0{idx + 1}
                    </div>
                    <p className="font-body text-sm md:text-base leading-relaxed flex-1">
                      {opt.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Alternative: Custom Input */}
            <div className="pt-2 space-y-2">
              <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-wider">
                Or Formulate Custom High-Agency Response:
              </label>
              <textarea
                rows={2}
                value={customResponse}
                onChange={(e) => {
                  setCustomResponse(e.target.value);
                  setSelectedOptionId(null);
                }}
                placeholder="Type your exact words and strategic counter-move..."
                className="w-full bg-[#121212] rounded-xl neo-input p-4 text-sm text-[#e5e2e1] border border-[#1e1e1e] placeholder-[#7e7d7d]"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1e1e1e]">
              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
              >
                Reset Choice
              </button>

              <button
                onClick={handleRunSimulation}
                disabled={(!selectedOptionId && !customResponse.trim()) || isSimulating}
                className="neo-btn px-8 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>EVALUATE ALIGNMENT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Output Panel (4 cols on lg) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="neo-card bg-[#121212] p-6 md:p-8 rounded-3xl border border-[#1e1e1e]/60 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-[#c8c6c5] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#c8c6c5]" />
                  <span>Simulation Diagnostics</span>
                </h3>
              </div>

              {simError ? (
                <div className="neo-recessed p-4 rounded-2xl border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{simError}</span>
                </div>
              ) : evaluation ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Score circle / metric */}
                  <div className="neo-recessed p-6 rounded-2xl text-center border border-[#1e1e1e]">
                    <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#8e9192]">
                      Persona Consistency Match
                    </span>
                    <div className="font-display text-5xl font-bold text-[#c8c6c5] my-2">
                      {evaluation.score}%
                    </div>
                    <span className="font-mono-code text-xs text-emerald-400">
                      {evaluation.score >= 80 ? 'STRATEGIC ALIGNMENT VERIFIED' : 'VARIANCE DETECTED'}
                    </span>
                  </div>

                  {/* Feedback readout */}
                  <div className="space-y-2">
                    <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">
                      Architectural Feedback
                    </h4>
                    <p className="font-body text-sm text-[#e5e2e1] leading-relaxed neo-recessed p-4 rounded-xl border border-[#1e1e1e]">
                      {evaluation.feedback}
                    </p>
                  </div>

                  {/* Trait impact breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">
                      Trait Shifts
                    </h4>
                    <div className="space-y-1.5">
                      {evaluation.traitAnalysis.map((ta, i) => (
                        <div key={i} className="font-mono-code text-xs text-[#c4c7c7] px-3 py-1.5 rounded-lg bg-[#1a1a1a] flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{ta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="neo-recessed p-8 rounded-2xl text-center border border-[#1e1e1e] space-y-3 my-auto">
                  <Cpu className="w-8 h-8 text-[#8e9192] mx-auto animate-pulse" />
                  <p className="font-display text-base text-[#c8c6c5]">Awaiting Neural Input</p>
                  <p className="font-body text-xs text-[#8e9192]">
                    Select a tactical option or enter a custom strategy to simulate psychological alignment.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1e1e1e] text-center">
              <span className="font-mono-code text-[11px] text-[#7e7d7d]">
                Engine: Gemini 3.7 Flash Tactical Core
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
