import React, { useState } from 'react';
import { HabitItem } from '../types';
import { 
  CheckSquare, 
  Flame, 
  Plus, 
  Check, 
  Calendar, 
  Sparkles, 
  TrendingUp,
  X
} from 'lucide-react';

interface HabitsViewProps {
  habits: HabitItem[];
  onToggleHabitDay: (habitId: string, dayIndex: number) => void;
  onAddHabit: (habit: HabitItem) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabitDay,
  onAddHabit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Execution Protocol');

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    onAddHabit({
      id: `h-${Date.now()}`,
      name: habitName.trim(),
      streak: 1,
      targetPerWeek: 7,
      days: [false, false, false, false, false, false, false],
      icon: 'checklist',
      category: habitCategory
    });
    setHabitName('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Habit Anchors
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2 max-w-2xl">
            Atomic behavioral protocols that physically reinforce your calibrated persona DNA.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="neo-btn px-5 py-3 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
        >
          <Plus className="w-4 h-4" />
          <span>New Anchor</span>
        </button>
      </header>

      {/* Habit Cards Matrix */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const completedDays = habit.days.filter(Boolean).length;
          return (
            <div
              key={habit.id}
              className="neo-card bg-[#121212] p-6 md:p-8 rounded-3xl border border-[#1e1e1e]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#1c1b1b] neo-recessed font-mono-code text-[10px] text-[#8e9192] uppercase">
                    {habit.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-mono-code text-xs">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{habit.streak} Day Streak</span>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-[#e5e2e1] mb-1">
                  {habit.name}
                </h3>
                <p className="font-mono-code text-xs text-[#7e7d7d]">
                  {completedDays} / {habit.targetPerWeek} completed this cycle
                </p>
              </div>

              {/* 7-Day Matrix */}
              <div className="flex items-center gap-2 sm:gap-3">
                {habit.days.map((isDone, dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => onToggleHabitDay(habit.id, dayIdx)}
                    className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center font-mono-code text-xs transition-all cursor-pointer border ${
                      isDone
                        ? 'neo-recessed bg-[#1a201b] text-emerald-400 border-emerald-500/40 font-bold'
                        : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border-[#1e1e1e]'
                    }`}
                  >
                    <span className="text-[10px] text-[#7e7d7d] mb-0.5">{daysOfWeek[dayIdx]}</span>
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for new habit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]">
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-2">
              Create Habit Anchor
            </h3>
            <p className="font-body text-xs text-[#8e9192] mb-6">
              Establish a consistent daily ritual to reinforce your target persona archetype.
            </p>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Habit Description
                </label>
                <input
                  type="text"
                  required
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. 20-minute daily pre-mortem"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                >
                  <option value="Priming Protocol">Priming Protocol</option>
                  <option value="Focus & Deep Work">Focus & Deep Work</option>
                  <option value="Emotional Resilience">Emotional Resilience</option>
                  <option value="Physiological Baseline">Physiological Baseline</option>
                </select>
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
                  Initialize Anchor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
