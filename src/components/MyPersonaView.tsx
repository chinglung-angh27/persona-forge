import React from 'react';
import { Trait, ReferenceItem, ViewMode } from '../types';
import { 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Target, 
  Sliders, 
  Zap, 
  Brain,
  Quote,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MyPersonaViewProps {
  personaName: string;
  archetype: string;
  traits: Trait[];
  blendedReferences: string[];
  allReferences: ReferenceItem[];
  consistencyScore: number;
  onNavigate: (view: ViewMode) => void;
}

export const MyPersonaView: React.FC<MyPersonaViewProps> = ({
  personaName,
  archetype,
  traits,
  blendedReferences,
  allReferences,
  consistencyScore,
  onNavigate
}) => {
  const activeRefs = allReferences.filter((r) => blendedReferences.includes(r.id));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-[0.25em] mb-1">
            Active Persona Architecture
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            {personaName || 'Architect-X'} // {archetype || 'The Strategic Operator'}
          </h1>
        </div>

        <button
          onClick={() => onNavigate('dna')}
          className="neo-btn px-6 py-3 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
        >
          <Sliders className="w-4 h-4" />
          <span>Recalibrate DNA</span>
        </button>
      </header>

      {/* Hero Overview Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Identity Profile Card */}
        <div className="lg:col-span-2 neo-card rounded-2xl p-8 bg-[#121212] border border-[#1e1e1e]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c8c6c5]" />
                Primary Behavioral Framework
              </span>
              <span className="px-3 py-1 rounded-full neo-recessed font-mono-code text-xs text-emerald-400 border border-emerald-500/30">
                ACTIVE SYSTEM V4.1
              </span>
            </div>

            <h2 className="font-display text-3xl font-bold text-[#e5e2e1] mb-3">
              The Strategic Operator
            </h2>

            <p className="font-body text-base text-[#8e9192] leading-relaxed mb-6">
              An asymmetric high-agency operator profile characterized by razor-sharp operational prioritization, 
              stoic emotional regulation during team friction, and uncompromising creative ambition. Operates by systematic protocols 
              rather than transient emotional states.
            </p>

            {/* Core Directives */}
            <div className="space-y-3 font-body text-sm text-[#c4c7c7] border-t border-[#1e1e1e] pt-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c8c6c5] shrink-0 mt-0.5" />
                <span><strong>Prime Mandate:</strong> Eliminate secondary friction; maximize cognitive energy on high-leverage bottlenecks.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c8c6c5] shrink-0 mt-0.5" />
                <span><strong>Communication Protocol:</strong> Cold objective clarity, high brevity, frame-dominant posture.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c8c6c5] shrink-0 mt-0.5" />
                <span><strong>Stress Response:</strong> Physiological down-regulation before strategic countermeasures are issued.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#1e1e1e] flex items-center justify-between">
            <span className="font-mono-code text-xs text-[#8e9192]">Archetype Stability</span>
            <span className="font-mono-code text-sm font-bold text-[#c8c6c5]">{consistencyScore}% Consistent</span>
          </div>
        </div>

        {/* Tactical Trait Matrix Breakdown */}
        <div className="neo-card rounded-2xl p-8 bg-[#121212] border border-[#1e1e1e]/60 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>Trait Calibrations</span>
            </h3>

            <div className="space-y-4">
              {traits.map((t) => (
                <div key={t.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono-code">
                    <span className="text-[#c4c7c7]">{t.name}</span>
                    <span className="text-[#c8c6c5] font-semibold">{t.value}%</span>
                  </div>
                  <div className="w-full h-2 neo-recessed rounded-full bg-[#0e0e0e] overflow-hidden">
                    <div
                      className="h-full bg-[#c8c6c5] rounded-full transition-all duration-500"
                      style={{ width: `${t.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulator')}
            className="mt-6 neo-btn w-full py-3 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center justify-center gap-2 border border-[#2a2a2a]"
          >
            <span>Test Trait Resilience</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blended Influences & Reference Integration */}
      <div className="neo-card rounded-2xl p-8 bg-[#121212] border border-[#1e1e1e]/60">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-[#e5e2e1]">
              Blended Archetypal DNA
            </h3>
            <p className="font-mono-code text-xs text-[#8e9192] mt-1">
              Mental models synthesized from historical masters into this persona
            </p>
          </div>

          <button
            onClick={() => onNavigate('references')}
            className="neo-btn px-4 py-2 rounded-xl font-mono-code text-xs text-[#c8c6c5] flex items-center gap-2 border border-[#2a2a2a]"
          >
            <Layers className="w-4 h-4" />
            <span>Browse Library</span>
          </button>
        </div>

        {activeRefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeRefs.map((ref) => (
              <div
                key={ref.id}
                className="neo-recessed p-5 rounded-2xl border border-[#1e1e1e] flex flex-col justify-between"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl neo-extruded overflow-hidden shrink-0 border border-[#2a2a2a]">
                    <img src={ref.imageUrl} alt={ref.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#e5e2e1]">{ref.name}</h4>
                    <p className="font-mono-code text-[10px] text-[#8e9192] uppercase">{ref.title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ref.traits.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#1c1b1b] font-mono-code text-[10px] text-[#c4c7c7]">
                      {t}
                    </span>
                  ))}
                </div>

                {ref.quote && (
                  <p className="font-body italic text-xs text-[#8e9192] mt-auto border-t border-[#1e1e1e] pt-2.5 line-clamp-2">
                    "{ref.quote}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="neo-recessed p-8 rounded-2xl text-center border border-[#1e1e1e] space-y-3">
            <p className="font-body text-sm text-[#8e9192]">
              No external reference models currently blended into this persona.
            </p>
            <button
              onClick={() => onNavigate('references')}
              className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]"
            >
              Integrate Steve Jobs, Ronaldo, or Marcus Aurelius &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Vulnerabilities & Countermeasures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-card rounded-2xl p-6 bg-[#121212] border border-[#1e1e1e]/60 space-y-4">
          <h4 className="font-display text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-300" />
            <span>Superpowers</span>
          </h4>
          <ul className="space-y-2.5 font-body text-sm text-[#8e9192]">
            <li className="flex items-start gap-2">
              <span className="text-[#c8c6c5] font-bold">&bull;</span>
              <span><strong>Extreme Lateral Divergence:</strong> Ability to synthesize disparate industries into unprecedented product solutions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#c8c6c5] font-bold">&bull;</span>
              <span><strong>Execution Velocity:</strong> Decisive threshold for action without needing 100% complete data.</span>
            </li>
          </ul>
        </div>

        <div className="neo-card rounded-2xl p-6 bg-[#121212] border border-[#1e1e1e]/60 space-y-4">
          <h4 className="font-display text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
            <span>Vulnerabilities &amp; Mitigations</span>
          </h4>
          <ul className="space-y-2.5 font-body text-sm text-[#8e9192]">
            <li className="flex items-start gap-2">
              <span className="text-[#ffb4ab] font-bold">&bull;</span>
              <span><strong>Low Composure Under Ambiguity:</strong> Mitigate by instituting mandatory 15-minute reflection halts during surprise roadblocks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffb4ab] font-bold">&bull;</span>
              <span><strong>Over-Ambition Fatigue:</strong> Mitigate by enforcing zero-screen evening wind-down rituals.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
