import React from 'react';
import { HabitItem } from '../types';
import { TrendingUp, Calendar } from 'lucide-react';

interface StreakAnalyticsProps {
  habits: HabitItem[];
}

const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const StreakAnalytics: React.FC<StreakAnalyticsProps> = ({ habits }) => {
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // For each day index, count how many habits have that day checked
  const dayCompletionCounts = daysOfWeek.map((_, dayIndex) =>
    habits.filter((h) => h.days[dayIndex]).length
  );
  const totalHabits = habits.length || 1;

  // Weekly completion rate: average of (days[i].filter(Boolean).length / targetPerWeek)
  const weeklyCompletionRate =
    habits.length > 0
      ? habits.reduce((sum, h) => {
          const done = h.days.filter(Boolean).length;
          return sum + done / h.targetPerWeek;
        }, 0) / habits.length
      : 0;

  const getDayColor = (count: number) => {
    const ratio = count / totalHabits;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio >= 0.25) return 'bg-amber-500';
    return 'bg-[#2a2a2a]';
  };

  return (
    <section>
      <h2 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-3 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5" />
        Streak Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Longest streak card */}
        <div className="neo-recessed bg-[#121212] p-4 rounded-xl border border-[#2a2a2a] text-center">
          <div className="font-mono-code text-[10px] text-[#7e7d7d] uppercase mb-1">
            Longest Streak
          </div>
          <div className="font-display text-3xl font-bold text-emerald-400">
            {longestStreak}
          </div>
          <div className="font-mono-code text-[10px] text-[#7e7d7d]">days</div>
        </div>

        {/* Weekly completion rate card */}
        <div className="neo-recessed bg-[#121212] p-4 rounded-xl border border-[#2a2a2a] text-center">
          <div className="font-mono-code text-[10px] text-[#7e7d7d] uppercase mb-1">
            Weekly Rate
          </div>
          <div className="font-display text-3xl font-bold text-[#c8c6c5]">
            {Math.round(weeklyCompletionRate * 100)}%
          </div>
          <div className="font-mono-code text-[10px] text-[#7e7d7d]">targets met</div>
        </div>

        {/* Habit count card */}
        <div className="neo-recessed bg-[#121212] p-4 rounded-xl border border-[#2a2a2a] text-center">
          <div className="font-mono-code text-[10px] text-[#7e7d7d] uppercase mb-1">
            Active Habits
          </div>
          <div className="font-display text-3xl font-bold text-[#c8c6c5]">
            {habits.length}
          </div>
          <div className="font-mono-code text-[10px] text-[#7e7d7d]">tracking</div>
        </div>
      </div>
    </section>
  );
};

export const WeeklyHeatmap: React.FC<{ habits: HabitItem[] }> = ({ habits }) => {
  const dayCompletionCounts = daysOfWeek.map((_, dayIndex) =>
    habits.filter((h) => h.days[dayIndex]).length
  );
  const totalHabits = habits.length || 1;

  const getDayColor = (count: number) => {
    const ratio = count / totalHabits;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio >= 0.25) return 'bg-amber-500';
    return 'bg-[#2a2a2a]';
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-3.5 h-3.5 text-[#7e7d7d]" />
        <span className="font-mono-code text-[11px] text-[#8e9192] uppercase tracking-wider">
          This Week
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Day headers */}
          <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
            <span className="font-mono-code text-[10px] text-[#7e7d7d]"></span>
            {daysOfWeek.map((d) => (
              <span key={d} className="font-mono-code text-[10px] text-[#7e7d7d] text-center">
                {d}
              </span>
            ))}
          </div>

          {/* Habit rows */}
          {habits.map((habit) => {
            const done = habit.days.filter(Boolean).length;
            return (
              <div key={habit.id} className="grid gap-1.5 mb-1.5 items-center" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
                <div className="flex items-center gap-1.5 min-w-[80px]">
                  <span className="font-mono-code text-[10px] text-[#c8c6c5] truncate">{habit.name}</span>
                  <span className="font-mono-code text-[9px] text-emerald-400 shrink-0">{habit.streak}d</span>
                </div>
                {habit.days.map((isDone, i) => (
                  <button
                    key={i}
                    className={`w-8 h-8 rounded-lg ${getDayColor(dayCompletionCounts[i])} border border-[#2a2a2a]/50 flex items-center justify-center transition-colors hover:opacity-80`}
                    title={`${daysOfWeek[i]} — ${habit.name}: ${isDone ? 'done' : 'missed'}`}
                  >
                    {isDone ? (
                      <span className="font-mono-code text-[9px] text-white font-bold">✓</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}

          {/* Day summary row */}
          <div className="grid gap-1.5 mt-3 pt-3 border-t border-[#1e1e1e] items-center" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
            <span className="font-mono-code text-[9px] text-[#7e7d7d]">Rate</span>
            {dayCompletionCounts.map((count) => {
              const ratio = count / totalHabits;
              const colorClass = ratio > 0.5 ? 'text-emerald-400' : ratio >= 0.25 ? 'text-amber-400' : 'text-[#7e7d7d]';
              return <span key={count} className={`font-mono-code text-[9px] text-center ${colorClass}`}>{Math.round(ratio * 100)}%</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
