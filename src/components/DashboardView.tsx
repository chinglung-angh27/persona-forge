import React, { useState } from 'react';
import { ViewMode, DailyMission, EvolutionItem } from '../types';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Sun, 
  Scale, 
  Cpu, 
  Fingerprint, 
  ShieldCheck, 
  Zap,
  Plus,
  Play,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  userName: string;
  personaArchetype: string;
  consistencyScore: number;
  dailyMissions: DailyMission[];
  evolutionItems: EvolutionItem[];
  predictiveInsights: boolean;
  onNavigate: (view: ViewMode) => void;
  onToggleMission: (id: string) => void;
  onAddEvolution: (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  personaArchetype,
  consistencyScore,
  dailyMissions,
  evolutionItems,
  predictiveInsights,
  onNavigate,
  onToggleMission,
  onAddEvolution
}) => {
  // ponytail: derive the next suggested focus from real data, not a canned string.
  const suggestedFocus = (() => {
    const pending = dailyMissions.filter((m) => m.status !== 'completed');
    if (pending.length > 0) return `Clear ${pending.length} open mission${pending.length > 1 ? 's' : ''} to lift alignment.`;
    if (evolutionItems.length === 0) return 'Log your first evolution breakthrough to start the chain.';
    return 'Maintain streak — run a simulator crucible to stress-test the persona.';
  })();

  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Cognitive Calibration');

  const activeMission = dailyMissions[0] || {
    id: 'm1',
    title: "Do the thing you've been avoiding...",
    description: 'Focus your energy on completing the most challenging strategic task today. Delaying it only drains cognitive resources.',
    status: 'pending',
    category: 'Strategic Prioritization',
    xp: 250
  };

  const handleAddEvolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    onAddEvolution({
      title: newTitle,
      description: newDesc,
      icon: 'trending_up',
      category: newCategory,
      changeValue: '+5% Baseline'
    });
    setNewTitle('');
    setNewDesc('');
    setShowEvolutionModal(false);
  };

  // SVG circular calculation for 82%
  // Circumference = 2 * PI * 45 = ~282.74
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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Mission Card (Large, col-span-2) */}
        <div className="lg:col-span-2 neo-card rounded-2xl p-8 bg-[#121212] flex flex-col justify-between border border-[#1e1e1e]/60 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c8c6c5]" />
                Daily Mission
              </span>
              <div className="p-2 rounded-lg neo-recessed bg-[#121212]">
                <Brain className="w-5 h-5 text-[#c8c6c5]" />
              </div>
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
                onClick={() => onNavigate('daily')}
                className="font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1] px-3 py-2 transition-colors"
              >
                View Protocol &rarr;
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
                    <span>MISSION FULFILLED</span>
                  </>
                ) : (
                  <>
                    <span>ACCEPT MISSION</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Consistency Ring Card (col-span-1) */}
        <div className="neo-card rounded-2xl p-8 bg-[#121212] flex flex-col items-center justify-center text-center border border-[#1e1e1e]/60">
          <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-6 w-full text-left flex items-center justify-between">
            <span>Persona Consistency</span>
            <span className="text-[#c8c6c5] font-semibold">{consistencyScore}%</span>
          </span>

          <div 
            onClick={() => onNavigate('dna')} 
            className="cursor-pointer group relative w-44 h-44 neo-recessed rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105"
            title="Click to calibrate DNA"
          >
            <svg className="w-full h-full absolute top-0 left-0 -rotate-90 p-3" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#1f1e1e"
                strokeWidth="6"
              />
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
              <span className="font-mono-code text-[10px] text-[#8e9192] uppercase mt-0.5">Alignment</span>
            </div>
          </div>

          <p className="font-body text-sm text-[#8e9192] mt-2 leading-relaxed">
            Strong alignment with <span className="text-[#e5e2e1] font-medium">'{personaArchetype || 'The Strategic Operator'}'</span> archetype this week.
          </p>

          {predictiveInsights && (
            <div className="mt-4 p-3 rounded-xl border border-[#2a2a2a] bg-[#161616] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#c8c6c5] mt-0.5 shrink-0" />
              <p className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-wider leading-relaxed">
                Predictive focus: {suggestedFocus}
              </p>
            </div>
          )}
        </div>

        {/* Recent Evolution Section (full width span-3) */}
        <div className="lg:col-span-3 neo-card rounded-2xl p-8 bg-[#121212] border border-[#1e1e1e]/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl text-[#e5e2e1] font-semibold tracking-tight">
                Recent Evolution
              </h3>
              <p className="font-mono-code text-xs text-[#8e9192] mt-1">
                Real-time neuroplastic and behavioral delta logs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEvolutionModal(true)}
                className="neo-btn px-4 py-2 rounded-xl text-xs font-mono-code text-[#c8c6c5] flex items-center gap-1.5 border border-[#2a2a2a]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Breakthrough</span>
              </button>

              <button 
                onClick={() => onNavigate('evolution')}
                className="p-2 rounded-lg neo-recessed text-[#8e9192] hover:text-[#c8c6c5]"
                title="View full evolution history"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
          </div>

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
        </div>
      </div>

      {/* CTA Section */}
      <div className="pt-4 text-center flex flex-col md:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('simulator')}
          className="w-full md:w-auto neo-btn px-8 py-4 rounded-full font-mono-code text-xs text-[#c8c6c5] uppercase tracking-widest inline-flex items-center justify-center gap-3 border border-[#2a2a2a] hover:text-white font-semibold cursor-pointer group"
        >
          <span>Continue Persona Evolution</span>
          <Cpu className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate('dna')}
          className="w-full md:w-auto neo-recessed px-6 py-4 rounded-full font-mono-code text-xs text-[#8e9192] hover:text-[#c8c6c5] uppercase tracking-widest inline-flex items-center justify-center gap-2 border border-[#1e1e1e] transition-colors"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Calibrate DNA (6 Traits)</span>
        </button>
      </div>

      {/* Modal for logging new evolution */}
      {showEvolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]">
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-2">
              Log Persona Breakthrough
            </h3>
            <p className="font-body text-xs text-[#8e9192] mb-6">
              Record a real-world decision where you embodied your target archetype under pressure.
            </p>

            <form onSubmit={handleAddEvolutionSubmit} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Breakthrough Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Asymmetric Negotiation Restraint"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                >
                  <option value="Habit Anchor">Habit Anchor</option>
                  <option value="Composure Calibration">Composure Calibration</option>
                  <option value="Cognitive Endurance">Cognitive Endurance</option>
                  <option value="Strategic Leverage">Strategic Leverage</option>
                </select>
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Behavioral Outcome & Metrics
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe what happened and how your response differed from your old default pattern."
                  className="w-full bg-[#121212] rounded-xl neo-input p-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e1e1e]">
                <button
                  type="button"
                  onClick={() => setShowEvolutionModal(false)}
                  className="px-5 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a] hover:text-white"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
