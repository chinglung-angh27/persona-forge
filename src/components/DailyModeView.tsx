import React, { useState, useEffect } from 'react';
import { DailyMission } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Plus,
  Flame,
  Zap
} from 'lucide-react';

interface DailyModeViewProps {
  missions: DailyMission[];
  onToggleMission: (id: string) => void;
  onAddMission: (mission: DailyMission) => void;
}

export const DailyModeView: React.FC<DailyModeViewProps> = ({
  missions,
  onToggleMission,
  onAddMission
}) => {
  // Focus Timer state (e.g. 25 min deep work protocol)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'deep' | 'standard' | 'recovery'>('deep');
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mode: 'deep' | 'standard' | 'recovery' = timerMode) => {
    setIsActive(false);
    setTimerMode(mode);
    if (mode === 'deep') setTimerSeconds(90 * 60);
    else if (mode === 'standard') setTimerSeconds(25 * 60);
    else setTimerSeconds(10 * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim()) return;
    onAddMission({
      id: `m-${Date.now()}`,
      title: newMissionTitle.trim(),
      description: 'Strategic daily operational protocol targeted to reinforce active archetype.',
      status: 'pending',
      category: 'Focus Block',
      xp: 150
    });
    setNewMissionTitle('');
    setShowAddModal(false);
  };

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Daily Mode
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2 max-w-2xl">
            Execute mission-critical protocols. Keep the persona consistent through high-agency daily execution.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="neo-btn px-5 py-3 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Protocol</span>
        </button>
      </header>

      {/* Bento Grid: Focus Engine + Protocol Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Deep Focus Tactical Timer (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 flex flex-col items-center justify-between text-center min-h-[420px]">
            <div className="w-full flex items-center justify-between">
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c8c6c5]" />
                Cognitive Flow Engine
              </span>
              <span className="font-mono-code text-[11px] text-emerald-400 px-2 py-0.5 rounded bg-[#1c1b1b] neo-recessed">
                {isActive ? 'ACTIVE FOCUS' : 'READY'}
              </span>
            </div>

            {/* Mode selection buttons */}
            <div className="flex gap-2 p-1.5 rounded-xl neo-recessed bg-[#121212] my-4 border border-[#1e1e1e]">
              <button
                onClick={() => resetTimer('standard')}
                className={`px-3 py-1.5 rounded-lg font-mono-code text-xs transition-all ${
                  timerMode === 'standard'
                    ? 'neo-extruded bg-[#1c1b1b] text-[#c8c6c5] font-bold'
                    : 'text-[#8e9192] hover:text-white'
                }`}
              >
                25m Sprint
              </button>
              <button
                onClick={() => resetTimer('deep')}
                className={`px-3 py-1.5 rounded-lg font-mono-code text-xs transition-all ${
                  timerMode === 'deep'
                    ? 'neo-extruded bg-[#1c1b1b] text-[#c8c6c5] font-bold'
                    : 'text-[#8e9192] hover:text-white'
                }`}
              >
                90m Deep Block
              </button>
              <button
                onClick={() => resetTimer('recovery')}
                className={`px-3 py-1.5 rounded-lg font-mono-code text-xs transition-all ${
                  timerMode === 'recovery'
                    ? 'neo-extruded bg-[#1c1b1b] text-[#c8c6c5] font-bold'
                    : 'text-[#8e9192] hover:text-white'
                }`}
              >
                10m Reset
              </button>
            </div>

            {/* Circular Timer Display */}
            <div className="w-52 h-52 neo-recessed rounded-full flex flex-col items-center justify-center relative my-2 border border-[#1e1e1e]">
              <span className="font-display text-5xl font-bold tracking-tight text-[#e5e2e1]">
                {formatTime(timerSeconds)}
              </span>
              <span className="font-mono-code text-[11px] text-[#8e9192] uppercase tracking-widest mt-1">
                Zero Interruptions
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-xl neo-btn flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1] border border-[#2a2a2a]"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTimer}
                className={`neo-btn px-8 py-3.5 rounded-xl font-mono-code text-xs uppercase tracking-widest font-bold flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#1c1b1b] text-amber-300 border-amber-500/40'
                    : 'bg-[#c8c6c5] text-[#121212] hover:bg-white border-[#c8c6c5]'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>PAUSE FOCUS</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>ENGAGE BLOCK</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Daily Protocol Checklist (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#e5e2e1]">
                  Mission Checklist
                </h2>
                <p className="font-mono-code text-xs text-[#8e9192] mt-1">
                  {completedCount} of {missions.length} protocols satisfied today ({progressPercent}%)
                </p>
              </div>

              {/* Progress pill */}
              <div className="w-32 h-3.5 neo-recessed rounded-full bg-[#0e0e0e] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#c8c6c5] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* List of Missions */}
            <div className="space-y-4">
              {missions.map((mission) => {
                const isDone = mission.status === 'completed';
                return (
                  <div
                    key={mission.id}
                    onClick={() => onToggleMission(mission.id)}
                    className={`neo-recessed p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isDone
                        ? 'border-emerald-500/20 bg-[#141815]'
                        : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#c8c6c5] hover:scale-110 transition-transform"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#8e9192]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-display text-lg font-semibold ${isDone ? 'line-through text-[#8e9192]' : 'text-[#e5e2e1]'}`}>
                          {mission.title}
                        </h3>
                        <span className="font-mono-code text-[11px] text-[#8e9192] px-2 py-0.5 rounded bg-[#1c1b1b]">
                          +{mission.xp} XP
                        </span>
                      </div>
                      <p className={`font-body text-sm leading-relaxed ${isDone ? 'text-[#7e7d7d]' : 'text-[#8e9192]'}`}>
                        {mission.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Operational Mandate */}
            <div className="p-4 rounded-xl neo-extruded bg-[#121212] border border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="font-body text-xs text-[#c4c7c7]">
                  Evening review unlocks at 20:00. Record cognitive variance in Reflections.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for new mission */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]">
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-2">
              Inject Daily Protocol
            </h3>
            <p className="font-body text-xs text-[#8e9192] mb-6">
              Add a high-consequence task or behavioral constraint for today.
            </p>

            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Protocol Title
                </label>
                <input
                  type="text"
                  required
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  placeholder="e.g. Reject 2 low-leverage meeting requests"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
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
                  Deploy Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
