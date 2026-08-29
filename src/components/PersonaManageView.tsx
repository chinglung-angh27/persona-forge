import React, { useState } from 'react';
import { Persona, ViewMode, ARCHETYPES } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface PersonaManageViewProps {
  persona: Persona;
  onBack: () => void;
  onUpdateMeta: (id: string, meta: { name: string; archetype: string; identityStatement: string }) => void;
}

export const PersonaManageView: React.FC<PersonaManageViewProps> = ({
  persona, onBack, onUpdateMeta,
}) => {
  const [name, setName] = useState(persona.name);
  const [archetype, setArchetype] = useState(persona.archetype);
  const [identityStatement, setIdentity] = useState(persona.identityStatement);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display text-3xl text-[#e5e2e1] font-bold tracking-tight">Manage Persona</h1>
      </header>

      <div className="neo-card bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60 space-y-6">
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
        </div>
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Archetype</label>
          <select value={archetype} onChange={(e) => setArchetype(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]">
            {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Identity Statement</label>
          <textarea rows={2} value={identityStatement} onChange={(e) => setIdentity(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" placeholder="Who I am, in one line." />
        </div>
        <button
          onClick={() => { onUpdateMeta(persona.id, { name, archetype, identityStatement }); onBack(); }}
          className="neo-btn w-full px-6 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
};
