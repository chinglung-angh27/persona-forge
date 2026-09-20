import React, { useState } from 'react';
import { SimulatorScenario, Trait } from '../types';
import { runSimulation } from '../lib/multiAgent';
import {
  Cpu,
  Play,
  AlertCircle,
  Sparkles,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface MultiAgentSimulatorProps {
  scenario: SimulatorScenario;
  traits: Trait[];
  onRecordResult: (scenarioId: string, alignmentScore: number) => void;
  onGenerateReflection?: (scenarioId: string, finalScore: number, finalVerdict: string) => void;
}

export const MultiAgentSimulator: React.FC<MultiAgentSimulatorProps> = ({
  scenario,
  traits,
  onRecordResult,
  onGenerateReflection,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<
    { agent: string; phase: string; text: string }[] | null
  >(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalVerdict, setFinalVerdict] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setContributions(null);
    setFinalScore(null);
    setFinalVerdict(null);

    try {
      const result = await runSimulation(scenario, traits);
      setContributions(result.contributions);
      setFinalScore(result.finalScore);
      setFinalVerdict(result.finalVerdict);
      onRecordResult(result.scenarioId, result.finalScore);
      if (onGenerateReflection) {
        onGenerateReflection(result.scenarioId, result.finalScore, result.finalVerdict);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const phaseLabel = (phase: string) => {
    switch (phase) {
      case 'explore': return 'EXPLORE';
      case 'debate': return 'DEBATE';
      case 'verify': return 'VERIFY';
      case 'synthesize': return 'SYNTHESIZE';
      default: return phase.toUpperCase();
    }
  };

  const phaseColor = (phase: string) => {
    switch (phase) {
      case 'explore': return 'text-blue-400';
      case 'debate': return 'text-amber-400';
      case 'verify': return 'text-emerald-400';
      case 'synthesize': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-[0.25em]">
            Multi-Agent Consensus Engine
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
          Scenario Simulator
        </h1>
        <p className="font-body text-base text-[#8e9192] mt-2 max-w-3xl leading-relaxed">
          Four agents explore, debate, verify, and synthesize the best tactical response to your scenario.
        </p>
      </header>

      <div className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 space-y-6">
        <h2 className="font-display text-2xl font-bold text-[#e5e2e1]">{scenario.title}</h2>
        <p className="font-body text-base text-[#c4c7c7] leading-relaxed neo-recessed p-6 rounded-2xl border border-[#1e1e1e]">
          {scenario.context}
        </p>
        <span className={`font-mono-code text-xs px-3 py-1 rounded-full neo-recessed uppercase font-semibold inline-flex ${
          scenario.difficulty === 'Critical'
            ? 'text-[#ffb4ab] border border-[#ffb4ab]/30'
            : 'text-[#c8c6c5] border border-[#2a2a2a]'
        }`}>
          {scenario.difficulty} Stakes
        </span>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="neo-btn px-8 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>SYNTHESIZING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RUN MULTI-AGENT SIMULATION</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="neo-recessed p-4 rounded-2xl border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {contributions && (
        <div className="space-y-6 animate-fade-in">
          {contributions.map((c, idx) => (
            <div key={idx} className="neo-card bg-[#121212] p-6 rounded-2xl border border-[#1e1e1e]/60">
              <div className="flex items-center gap-3 mb-3">
                <Cpu className={`w-5 h-5 ${phaseColor(c.phase)}`} />
                <span className={`font-mono-code text-xs uppercase tracking-widest ${phaseColor(c.phase)}`}>
                  {phaseLabel(c.phase)}
                </span>
                <span className="font-mono-code text-xs text-[#8e9192]">— {c.agent}</span>
                <ArrowRight className="w-3 h-3 text-[#8e9192] ml-auto" />
              </div>
              <p className="font-body text-sm text-[#c4c7c7] leading-relaxed">
                {expandedId === String(idx)
                  ? c.text
                  : c.text.slice(0, 500)}
                {c.text.length > 500 && (
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === String(idx) ? null : String(idx))
                    }
                    className="text-[#8e9192] hover:text-[#c8c6c5] underline underline-offset-2 ml-1 cursor-pointer font-mono-code text-xs"
                  >
                    {expandedId === String(idx) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          ))}

          {finalScore !== null && (
            <div className="neo-recessed p-8 rounded-2xl text-center border border-[#1e1e1e] space-y-3 my-auto">
              <Activity className="w-8 h-8 text-[#c8c6c5] mx-auto" />
              <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#8e9192]">
                Consensus Score
              </span>
              <div className="font-display text-5xl font-bold text-[#c8c6c5]">{finalScore}%</div>
              <span className="font-mono-code text-xs text-emerald-400">
                {finalScore >= 80 ? 'STRATEGIC ALIGNMENT VERIFIED' : 'VARIANCE DETECTED'}
              </span>
              {finalVerdict && (
                <div className="font-body text-sm text-[#e5e2e1] leading-relaxed neo-recessed p-4 rounded-xl border border-[#1e1e1e] text-left mt-4">
                  {finalVerdict}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!contributions && !isRunning && (
        <div className="neo-recessed p-8 rounded-2xl text-center border border-[#1e1e1e] space-y-3 my-auto">
          <Cpu className="w-8 h-8 text-[#8e9192] mx-auto animate-pulse" />
          <p className="font-display text-base text-[#c8c6c5]">Awaiting Agent Deployment</p>
          <p className="font-body text-xs text-[#8e9192]">
            Hit RUN to deploy the multi-agent consensus engine.
          </p>
        </div>
      )}
    </div>
  );
};
