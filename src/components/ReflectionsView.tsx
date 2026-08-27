import React, { useState } from 'react';
import { ReflectionEntry } from '../types';
import { Brain, Plus, Sparkles, BookOpen, Quote, Calendar, Tag, CheckCircle } from 'lucide-react';

interface ReflectionsViewProps {
  reflections: ReflectionEntry[];
  onAddReflection: (entry: ReflectionEntry) => void;
}

export const ReflectionsView: React.FC<ReflectionsViewProps> = ({
  reflections,
  onAddReflection
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [prompt, setPrompt] = useState(
    'Where did you compromise standard today, and what was the hidden cost?'
  );
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('Stoic Detachment, Operational Velocity');

  const defaultPrompts = [
    'Where did you compromise standard today, and what was the hidden cost?',
    'What was the most stoic decision you made under pressure?',
    'Which decision today required the highest agency and courage?',
    'How did you calibrate composure when facing sudden friction?'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddReflection({
      id: `r-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      prompt,
      content: content.trim(),
      sentiment: 'breakthrough',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
    });
    setContent('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Cognitive Reflections
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2 max-w-2xl">
            Deep structured contemplation to distill daily lessons and consolidate psychological neuroplasticity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="neo-btn px-5 py-3 rounded-xl font-mono-code text-xs text-[#c8c6c5] hover:text-white flex items-center gap-2 border border-[#2a2a2a]"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </header>

      {/* Reflections list */}
      <div className="space-y-6">
        {reflections.map((ref) => (
          <div
            key={ref.id}
            className="neo-card bg-[#121212] p-8 rounded-3xl border border-[#1e1e1e]/60 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
              <span className="font-mono-code text-xs text-[#8e9192] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {ref.date}
              </span>
              <div className="flex gap-2">
                {ref.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="font-mono-code text-[11px] px-2.5 py-0.5 rounded bg-[#1c1b1b] text-[#c8c6c5] neo-recessed"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="font-display text-lg font-semibold text-[#c8c6c5] flex items-start gap-2">
              <Quote className="w-5 h-5 text-[#8e9192] shrink-0 mt-0.5" />
              <span>{ref.prompt}</span>
            </div>

            <p className="font-body text-base text-[#e5e2e1] leading-relaxed neo-recessed p-6 rounded-2xl border border-[#1e1e1e]">
              {ref.content}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for new reflection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#2a2a2a]">
            <h3 className="font-display text-xl font-bold text-[#c8c6c5] mb-2">
              Record Cognitive Reflection
            </h3>
            <p className="font-body text-xs text-[#8e9192] mb-4">
              Select or customize a prompt to introspect on today's tactical operations.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Reflection Prompt
                </label>
                <select
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#121212] rounded-xl neo-input p-3 text-xs text-[#e5e2e1] border border-[#1e1e1e] mb-2"
                >
                  {defaultPrompts.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Or write custom prompt..."
                  className="w-full h-10 bg-[#121212] rounded-xl neo-input px-3 text-xs text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Introspection Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Examine the sequence of events without emotional bias..."
                  className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Stoic Detachment, Focus, Boundaries"
                  className="w-full h-10 bg-[#121212] rounded-xl neo-input px-3 text-xs text-[#e5e2e1] border border-[#1e1e1e]"
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
                  Archive Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
