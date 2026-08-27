import React from 'react';
import { EvolutionItem, Trait } from '../types';
import { TrendingUp, Sparkles, Award, Shield, ArrowUpRight, Zap, Sun, Scale } from 'lucide-react';

interface EvolutionViewProps {
  evolutionItems: EvolutionItem[];
  traits: Trait[];
  consistencyScore: number;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  evolutionItems,
  traits,
  consistencyScore
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2">
        <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
          Evolution Trajectory
        </h1>
        <p className="font-body text-base text-[#8e9192] mt-2 max-w-2xl">
          Longitudinal audit of psychological recalibrations, consistency upgrades, and milestone achievements.
        </p>
      </header>

      {/* Level & Mastery Card */}
      <div className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl neo-extruded bg-[#121212] flex flex-col items-center justify-center border border-[#2a2a2a] text-[#c8c6c5]">
            <span className="font-mono-code text-[10px] uppercase text-[#8e9192]">Level</span>
            <span className="font-display text-3xl font-bold">04</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-[#e5e2e1]">
                Master Operator Tier
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono-code text-[11px] border border-emerald-500/30">
                Top 3%
              </span>
            </div>
            <p className="font-body text-sm text-[#8e9192] mt-1">
              840 / 1,000 XP to Level 05 (Sovereign Strategist)
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between font-mono-code text-xs text-[#8e9192]">
            <span>Level 04</span>
            <span className="text-[#c8c6c5]">84%</span>
          </div>
          <div className="w-full h-3 neo-recessed rounded-full bg-[#0e0e0e] overflow-hidden p-0.5">
            <div className="h-full bg-[#c8c6c5] rounded-full w-[84%]" />
          </div>
        </div>
      </div>

      {/* Trait Delta Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {traits.map((t) => (
          <div key={t.id} className="neo-recessed p-5 rounded-2xl border border-[#1e1e1e] text-center space-y-1">
            <span className="font-mono-code text-[11px] text-[#8e9192] uppercase block truncate">{t.name}</span>
            <span className="font-display text-2xl font-bold text-[#e5e2e1] block">{t.value}%</span>
            <span className="font-mono-code text-[10px] text-emerald-400 flex items-center justify-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+6% MTD</span>
            </span>
          </div>
        ))}
      </div>

      {/* Timeline of Evolution events */}
      <div className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 space-y-6">
        <h3 className="font-display text-2xl font-bold text-[#e5e2e1]">
          Chronological Evolution Log
        </h3>

        <div className="space-y-4">
          {evolutionItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="neo-recessed p-6 rounded-2xl border border-[#1e1e1e] flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full neo-extruded bg-[#121212] flex items-center justify-center shrink-0 border border-[#2a2a2a]">
                {item.icon === 'wb_sunny' ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : item.icon === 'balance' ? (
                  <Scale className="w-5 h-5 text-[#c8c6c5]" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-display text-base font-bold text-[#e5e2e1]">{item.title}</h4>
                  <span className="font-mono-code text-xs text-emerald-400 px-2 py-0.5 rounded bg-[#1a1a1a]">
                    {item.changeValue || '+Upgrade'}
                  </span>
                </div>
                <p className="font-body text-sm text-[#8e9192] leading-relaxed mb-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-3 font-mono-code text-[10px] text-[#7e7d7d]">
                  <span>{item.category}</span>
                  <span>&bull;</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
