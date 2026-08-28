import React, { useState } from 'react';
import { Persona } from '../types';
import { ChevronDown, Plus, Library, Check } from 'lucide-react';

interface PersonaSwitcherProps {
  personas: Persona[];
  activePersonaId: string;
  onSwitch: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenCreate: () => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  personas, activePersonaId, onSwitch, onOpenLibrary, onOpenCreate,
}) => {
  const [open, setOpen] = useState(false);
  const active = personas.find((p) => p.id === activePersonaId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl neo-recessed bg-[#121212] hover:border-[#2a2a2a] transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#1c1b1b] neo-extruded flex items-center justify-center border border-[#2a2a2a]/60 shrink-0">
          <span className="font-display text-sm font-bold text-[#c8c6c5]">
            {(active?.name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-semibold text-[#e5e2e1] truncate">
            {active?.name || 'No persona'}
          </div>
          <div className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest truncate">
            {active?.archetype || ''}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8e9192] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-[#161616] neo-extruded-large rounded-2xl p-2 border border-[#2a2a2a] shadow-2xl">
          <div className="px-2 py-1.5 font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest">
            Active Persona
          </div>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSwitch(p.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f]"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-mono-code text-sm text-[#e5e2e1] truncate">{p.name}</span>
                <span className="block font-body text-[11px] text-[#8e9192] truncate">{p.archetype}</span>
              </span>
              {p.id === activePersonaId && <Check className="w-4 h-4 text-[#c8c6c5] shrink-0" />}
            </button>
          ))}
          <div className="border-t border-[#1e1e1e] my-1.5" />
          <button
            onClick={() => { onOpenLibrary(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f] text-[#c8c6c5]"
          >
            <Library className="w-4 h-4" />
            <span className="font-mono-code text-sm">Persona Library</span>
          </button>
          <button
            onClick={() => { onOpenCreate(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f] text-[#c8c6c5]"
          >
            <Plus className="w-4 h-4" />
            <span className="font-mono-code text-sm">Create Persona</span>
          </button>
        </div>
      )}
    </div>
  );
};
