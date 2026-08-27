import React, { useState } from 'react';
import {
  HabitItem,
  ReflectionEntry,
  EvolutionItem
} from '../types';
import {
  CheckSquare,
  Plus,
  Check,
  Calendar,
  Sparkles,
  TrendingUp,
  X,
  Quote,
  Sun,
  Scale,
  Zap,
  BookOpen
} from 'lucide-react';

interface JournalViewProps {
  habits: HabitItem[];
  onToggleHabitDay: (habitId: string, dayIndex: number) => void;
  onAddHabit: (habit: HabitItem) => void;
  reflections: ReflectionEntry[];
  onAddReflection: (entry: ReflectionEntry) => void;
  evolutionItems: EvolutionItem[];
  onAddEvolution: (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => void;
}

const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ponytail: Journal collapses Habits + Reflections + Evolution onto one page with
// quick-add buttons + a unified timeline. Was 3 separate nav destinations; one
// concept (your day/week/history) collapsed to 1 surface.
export const JournalView: React.FC<JournalViewProps> = ({
  habits,
  onToggleHabitDay,
  onAddHabit,
  reflections,
  onAddReflection,
  evolutionItems,
  onAddEvolution
}) => {
  const [openModal, setOpenModal] = useState<'habit' | 'reflection' | 'win' | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Execution Protocol');
  const [reflPrompt, setReflPrompt] = useState(
    'Where did you compromise standard today, and what was the hidden cost?'
  );
  const [reflContent, setReflContent] = useState('');
  const [reflTags, setReflTags] = useState('Stoic Detachment, Operational Velocity');
  const [winTitle, setWinTitle] = useState('');
  const [winDescription, setWinDescription] = useState('');

  const reset = () => {
    setHabitName(''); setHabitCategory('Execution Protocol');
    setReflContent(''); setWinTitle(''); setWinDescription('');
  };

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
    reset();
    setOpenModal(null);
  };

  const handleCreateReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflContent.trim()) return;
    onAddReflection({
      id: `r-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      prompt: reflPrompt,
      content: reflContent.trim(),
      sentiment: 'breakthrough',
      tags: reflTags.split(',').map((t) => t.trim()).filter(Boolean)
    });
    reset();
    setOpenModal(null);
  };

  const handleCreateWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winTitle.trim()) return;
    onAddEvolution({
      title: winTitle.trim(),
      description: winDescription.trim() || 'Logged breakthrough moment.',
      icon: 'trending_up',
      category: 'Breakthrough',
      changeValue: '+1 Step'
    });
    reset();
    setOpenModal(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-16">
      <header className="pt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Journal
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2 max-w-2xl">
            Your day, week, and history. Anchor habits, log reflections, and capture breakthroughs as they happen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpenModal('habit')}
            className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
          >
            <Plus className="w-4 h-4" /><span>Add habit</span>
          </button>
          <button
            onClick={() => setOpenModal('reflection')}
            className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
          >
            <BookOpen className="w-4 h-4" /><span>Reflect</span>
          </button>
          <button
            onClick={() => setOpenModal('win')}
            className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
          >
            <Sparkles className="w-4 h-4" /><span>Log win</span>
          </button>
        </div>
      </header>

      {/* HABITS */}
      <section>
        <h2 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-3">
          Habit anchors
        </h2>
        {habits.length === 0 ? (
          <div className="neo-recessed p-6 rounded-2xl border border-[#1e1e1e] text-center">
            <p className="font-body text-sm text-[#8e9192]">No habits yet.</p>
            <button onClick={() => setOpenModal('habit')} className="mt-2 font-mono-code text-xs text-[#c8c6c5] hover:text-white">
              Add your first &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const done = habit.days.filter(Boolean).length;
              return (
                <div key={habit.id} className="neo-card bg-[#121212] p-5 md:p-6 rounded-2xl border border-[#1e1e1e]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-[#1c1b1b] neo-recessed font-mono-code text-[10px] text-[#8e9192] uppercase">
                        {habit.category}
                      </span>
                      <span className="font-mono-code text-[11px] text-amber-400">{habit.streak}d streak</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#e5e2e1]">{habit.name}</h3>
                    <p className="font-mono-code text-[10px] text-[#7e7d7d] mt-0.5">
                      {done} / {habit.targetPerWeek} this week
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {habit.days.map((isDone, i) => (
                      <button
                        key={i}
                        onClick={() => onToggleHabitDay(habit.id, i)}
                        className={`w-9 h-11 rounded-lg flex flex-col items-center justify-center font-mono-code text-[10px] border ${
                          isDone
                            ? 'neo-recessed bg-[#1a201b] text-emerald-400 border-emerald-500/40 font-bold'
                            : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border-[#1e1e1e]'
                        }`}
                        title={daysOfWeek[i]}
                      >
                        <span className="text-[9px] text-[#7e7d7d] mb-0.5">{daysOfWeek[i]}</span>
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* REFLECTIONS */}
      <section>
        <h2 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-3">
          Reflections
        </h2>
        {reflections.length === 0 ? (
          <div className="neo-recessed p-6 rounded-2xl border border-[#1e1e1e] text-center">
            <p className="font-body text-sm text-[#8e9192]">No reflections yet.</p>
            <button onClick={() => setOpenModal('reflection')} className="mt-2 font-mono-code text-xs text-[#c8c6c5] hover:text-white">
              Write the first one &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reflections.slice(0, 5).map((r) => (
              <div key={r.id} className="neo-card bg-[#121212] p-6 rounded-2xl border border-[#1e1e1e]/60 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-2">
                  <span className="font-mono-code text-[11px] text-[#8e9192] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />{r.date}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.map((t, i) => (
                      <span key={i} className="font-mono-code text-[10px] px-2 py-0.5 rounded bg-[#1c1b1b] text-[#c8c6c5] neo-recessed">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="font-display text-sm font-semibold text-[#c8c6c5] flex items-start gap-2">
                  <Quote className="w-4 h-4 text-[#8e9192] shrink-0 mt-0.5" />
                  <span>{r.prompt}</span>
                </div>
                <p className="font-body text-sm text-[#e5e2e1] leading-relaxed neo-recessed p-4 rounded-xl border border-[#1e1e1e]">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TIMELINE */}
      <section>
        <h2 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-3">
          Timeline
        </h2>
        {evolutionItems.length === 0 ? (
          <div className="neo-recessed p-6 rounded-2xl border border-[#1e1e1e] text-center">
            <p className="font-body text-sm text-[#8e9192]">No breakthroughs yet.</p>
            <button onClick={() => setOpenModal('win')} className="mt-2 font-mono-code text-xs text-[#c8c6c5] hover:text-white">
              Log a win &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {evolutionItems.slice(0, 10).map((item) => (
              <div key={item.id} className="neo-recessed p-5 rounded-2xl border border-[#1e1e1e] flex items-start gap-4">
                <div className="w-9 h-9 rounded-full neo-extruded bg-[#121212] flex items-center justify-center shrink-0 border border-[#2a2a2a]">
                  {item.icon === 'wb_sunny' ? <Sun className="w-4 h-4 text-amber-300" />
                    : item.icon === 'balance' ? <Scale className="w-4 h-4 text-[#c8c6c5]" />
                    : item.icon === 'trending_up' ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                    : <Zap className="w-4 h-4 text-[#c8c6c5]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="font-display text-sm font-semibold text-[#e5e2e1]">{item.title}</h4>
                    {item.changeValue && (
                      <span className="font-mono-code text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-[#1a1a1a]">
                        {item.changeValue}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-[#8e9192] leading-relaxed">{item.description}</p>
                  <div className="mt-1 font-mono-code text-[10px] text-[#7e7d7d]">{item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-md bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-[#c8c6c5]">
                {openModal === 'habit' && 'Create habit anchor'}
                {openModal === 'reflection' && 'Record reflection'}
                {openModal === 'win' && 'Log breakthrough'}
              </h3>
              <button onClick={() => setOpenModal(null)} className="text-[#8e9192] hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {openModal === 'habit' && (
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Name</label>
                  <input required value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g. 20-minute pre-mortem"
                    className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Category</label>
                  <select value={habitCategory} onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]">
                    <option>Priming Protocol</option>
                    <option>Focus & Deep Work</option>
                    <option>Emotional Resilience</option>
                    <option>Physiological Baseline</option>
                    <option>Execution Protocol</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#1e1e1e]">
                  <button type="button" onClick={() => setOpenModal(null)} className="px-4 py-2 rounded-xl font-mono-code text-xs text-[#8e9192]">Cancel</button>
                  <button type="submit" className="neo-btn px-5 py-2 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]">Add</button>
                </div>
              </form>
            )}

            {openModal === 'reflection' && (
              <form onSubmit={handleCreateReflection} className="space-y-3">
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Prompt</label>
                  <input value={reflPrompt} onChange={(e) => setReflPrompt(e.target.value)}
                    className="w-full bg-[#121212] rounded-xl neo-input p-3 text-xs text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Content</label>
                  <textarea rows={4} required value={reflContent} onChange={(e) => setReflContent(e.target.value)}
                    className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Tags (comma separated)</label>
                  <input value={reflTags} onChange={(e) => setReflTags(e.target.value)}
                    className="w-full h-10 bg-[#121212] rounded-xl neo-input px-3 text-xs text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#1e1e1e]">
                  <button type="button" onClick={() => setOpenModal(null)} className="px-4 py-2 rounded-xl font-mono-code text-xs text-[#8e9192]">Cancel</button>
                  <button type="submit" className="neo-btn px-5 py-2 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]">Save</button>
                </div>
              </form>
            )}

            {openModal === 'win' && (
              <form onSubmit={handleCreateWin} className="space-y-3">
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Title</label>
                  <input required value={winTitle} onChange={(e) => setWinTitle(e.target.value)} placeholder="e.g. Held the line under pressure"
                    className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div>
                  <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">What happened</label>
                  <textarea rows={3} value={winDescription} onChange={(e) => setWinDescription(e.target.value)}
                    className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#1e1e1e]">
                  <button type="button" onClick={() => setOpenModal(null)} className="px-4 py-2 rounded-xl font-mono-code text-xs text-[#8e9192]">Cancel</button>
                  <button type="submit" className="neo-btn px-5 py-2 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]">Log</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
