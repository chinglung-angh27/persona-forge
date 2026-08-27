import React, { useState } from 'react';
import { ViewMode, DailyMission, EvolutionItem } from '../types';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sun,
  Scale,
  Zap,
  Cpu,
  Fingerprint
} from 'lucide-react';

interface TodayViewProps {
  userName: string;
  personaArchetype: string;
  consistencyScore: number;
  dailyMissions: DailyMission[];
  evolutionItems: EvolutionItem[];
  predictiveInsights: boolean;
  onNavigate: (view: ViewMode) => void;
  onToggleMission: (id: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  userName,
  personaArchetype,
  consistencyScore,
  dailyMissions,
  evolutionItems,
  predictiveInsights,
  onNavigate,
  onToggleMission
}) => {
  // ponytail: derive the next suggested focus from real data, not a canned string.
  const suggestedFocus = (() => {
    const pending = dailyMissions.filter((m) => m.status !== 'completed');
    if (pending.length > 0) return `Clear ${pending.length} open mission${pending.length > 1 ? 's' : ''} to lift alignment.`;
    if (evolutionItems.length === 0) return 'Log your first evolution breakthrough to start the chain.';
    return 'Maintain streak — run a simulator crucible to stress-test the persona.';
  })();

  const [showAllMissions, setShowAllMissions] = useState(false);

  const activeMission = dailyMissions[0] || {
    id: 'm1',
    title: "Do the thing you've been avoiding...",
    description: 'Focus your energy on completing the most challenging strategic task today. Delaying it only drains cognitive resources.',
    status: 'pending' as const,
    category: 'Strategic Prioritization',
    xp: 250
  };

  // ponytail: cut the Pomodoro focus timer that used to live in DailyModeView.
  // State machine (3 modes x start/pause/reset) that didn't drive any consistency
  // calculation was dead weight on the home screen. Add back to Journal if focus
  // time tracking becomes a real metric.

  // SVG circular calculation for the consistency ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consistencyScore / 100) * circumference;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Section */}
      <header className="pt-2">
        <p className="font-mono-code text-xs text-[#c8c6c5] mb-2 uppercase tracking-[0.25em] font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c8c6c5] animate-pulse" />
          Good morning, {userName.split('@')[0] || 'Ching'}.
        </p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#e5e2e1] uppercase font-bold tracking-tight">
          {personaArchetype || 'THE STRATEGIC OPERATOR'}
        </h1>
      </header>

      {/* Top row: today's mission + consistency ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neo-card rounded-2xl p-8 bg-[#121212] flex flex-col justify-between border border-[#1e1e1e]/60 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">
                Today's focus
              </span>
              <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#8e9192]">
                {dailyMissions.filter((m) => m.status === 'completed').length} / {dailyMissions.length} done
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl text-[#e5e2e1] font-semibold mb-4 tracking-tight">
              {activeMission.title}
            </h2>
            <p className="font-body text-base md:text-lg text-[#8e9192] leading-relaxed max-w-2xl">
              {activeMission.description}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#1e1e1e] flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="font-mono-code text-xs text-[#8e9192] flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5]">
                {activeMission.category || 'High Consequence'}
              </span>
              <span>+{activeMission.xp || 250} XP</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllMissions((v) => !v)}
                className="font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1] px-3 py-2 transition-colors"
              >
                {showAllMissions ? 'Hide list' : 'View all'} &rarr;
              </button>

              <button
                onClick={() => onToggleMission(activeMission.id)}
                className={`neo-btn px-6 py-3 rounded-xl font-mono-code text-xs uppercase tracking-widest flex items-center gap-2 font-semibold transition-all ${
                  activeMission.status === 'completed'
                    ? 'bg-[#1c1b1b] text-[#c8c6c5] border border-[#2a2a2a] neo-recessed'
                    : 'bg-[#121212] text-[#c8c6c5] hover:text-white border border-[#2a2a2a]'
                }`}
              >
                {activeMission.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>DONE</span>
                  </>
                ) : (
                  <>
                    <span>MARK DONE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {showAllMissions && dailyMissions.length > 1 && (
            <ul className="mt-4 space-y-2 relative z-10">
              {dailyMissions.slice(1).map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-xs font-mono-code text-[#8e9192]">
                  <button
                    onClick={() => onToggleMission(m.id)}
                    className="w-4 h-4 rounded border border-[#2a2a2a] flex items-center justify-center hover:border-[#c8c6c5]"
                    aria-label={m.status === 'completed' ? 'Mark pending' : 'Mark done'}
                  >
                    {m.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <span className={m.status === 'completed' ? 'line-through text-[#7e7d7d]' : 'text-[#c8c6c5]'}>
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Consistency Ring Card (col-span-1) */}
        <div className="neo-card rounded-2xl p-8 bg-[#121212] flex flex-col items-center justify-center text-center border border-[#1e1e1e]/60">
          <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-6 w-full text-left flex items-center justify-between">
            <span>Momentum</span>
            <span className="text-[#c8c6c5] font-semibold">{consistencyScore}%</span>
          </span>

          <div
            onClick={() => onNavigate('dna')}
            className="cursor-pointer group relative w-44 h-44 neo-recessed rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105"
            title="Click to calibrate DNA"
          >
            <svg className="w-full h-full absolute top-0 left-0 -rotate-90 p-3" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f1e1e" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#c8c6c5"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(200,198,197,0.3)]"
              />
            </svg>

            <div className="z-10 flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-[#c8c6c5] tracking-tight">
                {consistencyScore}<span className="text-xl font-normal text-[#8e9192]">%</span>
              </span>
              <span className="font-mono-code text-[10px] text-[#8e9192] uppercase mt-0.5">This week</span>
            </div>
          </div>

          <p className="font-body text-sm text-[#8e9192] mt-2 leading-relaxed">
            Alignment with <span className="text-[#e5e2e1] font-medium">'{personaArchetype || 'The Strategic Operator'}'</span>.
          </p>

          {predictiveInsights && (
            <div className="mt-4 p-3 rounded-xl border border-[#2a2a2a] bg-[#161616] flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#c8c6c5] mt-0.5 shrink-0" />
              <p className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-wider leading-relaxed">
                Suggested: {suggestedFocus}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Evolution Section */}
      <div className="neo-card rounded-2xl p-8 bg-[#121212] border border-[#1e1e1e]/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-2xl text-[#e5e2e1] font-semibold tracking-tight">
              Recent Evolution
            </h3>
            <p className="font-mono-code text-xs text-[#8e9192] mt-1">
              Your latest breakthroughs
            </p>
          </div>

          <button
            onClick={() => onNavigate('more-evolution')}
            className="neo-recessed px-4 py-2 rounded-xl text-xs font-mono-code text-[#8e9192] hover:text-[#c8c6c5] border border-[#1e1e1e]"
          >
            See all &rarr;
          </button>
        </div>

        {evolutionItems.length === 0 ? (
          <div className="neo-recessed p-8 rounded-xl text-center border border-[#1e1e1e]">
            <p className="font-body text-sm text-[#8e9192]">No breakthroughs yet.</p>
            <p className="font-mono-code text-[11px] text-[#7e7d7d] mt-2">
              Log one in <span className="text-[#c8c6c5]">Journal &rarr; Timeline</span> when you embody your archetype under pressure.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evolutionItems.slice(0, 4).map((item, idx) => (
              <div
                key={item.id || idx}
                className="neo-recessed p-6 rounded-xl flex items-start gap-4 border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors"
              >
                <div className="neo-extruded p-3.5 rounded-full text-[#c8c6c5] bg-[#121212] shrink-0 border border-[#2a2a2a]/60">
                  {item.icon === 'wb_sunny' ? (
                    <Sun className="w-5 h-5 text-amber-300/90" />
                  ) : item.icon === 'balance' ? (
                    <Scale className="w-5 h-5 text-[#c8c6c5]" />
                  ) : item.icon === 'trending_up' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400/90" />
                  ) : (
                    <Zap className="w-5 h-5 text-[#c8c6c5]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="font-display text-base font-semibold text-[#e5e2e1]">
                      {item.title}
                    </h4>
                    {item.changeValue && (
                      <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5] font-medium shrink-0">
                        {item.changeValue}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-[#8e9192] leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-2 font-mono-code text-[10px] text-[#7e7d7d]">
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="pt-4 flex flex-col md:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('train')}
          className="w-full md:w-auto neo-btn px-8 py-4 rounded-full font-mono-code text-xs text-[#c8c6c5] uppercase tracking-widest inline-flex items-center justify-center gap-3 border border-[#2a2a2a] hover:text-white font-semibold cursor-pointer group"
        >
          <span>Practice a scenario</span>
          <Cpu className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('dna')}
          className="w-full md:w-auto neo-recessed px-6 py-4 rounded-full font-mono-code text-xs text-[#8e9192] hover:text-[#c8c6c5] uppercase tracking-widest inline-flex items-center justify-center gap-2 border border-[#1e1e1e] transition-colors"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Calibrate DNA</span>
        </button>
      </div>
    </div>
  );
};
