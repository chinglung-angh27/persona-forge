import React, { useState } from 'react';
import { ReferenceItem, ViewMode, ARCHETYPES } from '../types';
import { ArrowRight, Check } from 'lucide-react';

interface CreatePersonaViewProps {
  references: ReferenceItem[];
  onNavigate: (view: ViewMode) => void;
  onCreate: (name: string, archetype: string, blendIds: string[]) => void;
}

export const CreatePersonaView: React.FC<CreatePersonaViewProps> = ({
  references, onNavigate, onCreate,
}) => {
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES[0]);
  const [blend, setBlend] = useState<string[]>([]);

  const toggle = (id: string) =>
    setBlend((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    onCreate(name.trim() || 'Untitled Persona', archetype, blend);
    onNavigate('today');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-16">
      <header className="pt-2">
        <h1 className="font-display text-4xl text-[#e5e2e1] font-bold tracking-tight">Forge New Persona</h1>
        <p className="font-body text-base text-[#8e9192] mt-2">Seed from templates, blend references, make it active.</p>
      </header>

      <div className="neo-card bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60 space-y-6">
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
            placeholder="Persona handle"
          />
        </div>

        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Archetype</label>
          <select
            value={archetype}
            onChange={(e) => setArchetype(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
          >
            {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">
            Reference Blend (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {references.map((r) => {
              const on = blend.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={`px-3 py-2 rounded-full font-mono-code text-xs border transition-all ${
                    on ? 'bg-[#c8c6c5] text-[#121212] border-[#c8c6c5]' : 'neo-recessed text-[#c8c6c5] border-[#2a2a2a]'
                  }`}
                >
                  {on && <Check className="w-3 h-3 inline mr-1" />}
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          className="neo-btn w-full px-6 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center justify-center gap-2"
        >
          Create &amp; Activate <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
