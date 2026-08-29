import React from 'react';
import { Persona, ViewMode } from '../types';
import { Library, Plus, Check, Archive, Pencil } from 'lucide-react';

interface PersonaLibraryViewProps {
  personas: Persona[];
  activePersonaId: string;
  onSwitch: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  onArchive: (id: string) => void;
}

export const PersonaLibraryView: React.FC<PersonaLibraryViewProps> = ({
  personas, activePersonaId, onSwitch, onNavigate, onArchive,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Persona Library
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2">
            Select an identity to live through, or forge a new one.
          </p>
        </div>
        <button
          onClick={() => onNavigate('persona-new')}
          className="neo-btn px-5 py-3 rounded-xl font-mono-code text-xs text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" /> New Persona
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {personas.map((p) => {
          const isActive = p.id === activePersonaId;
          const core = p.traits.slice(0, 4);
          return (
            <div
              key={p.id}
              className={`neo-card bg-[#121212] rounded-2xl p-6 border flex flex-col gap-4 ${
                isActive ? 'border-[#c8c6c5]/50' : 'border-[#1e1e1e]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-xl font-bold text-[#e5e2e1]">{p.name}</div>
                  <div className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest mt-1">
                    {p.archetype}
                  </div>
                </div>
                {isActive && (
                  <span className="font-mono-code text-[10px] px-2 py-1 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5] flex items-center gap-1">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </div>

              {p.identityStatement && (
                <p className="font-body text-sm text-[#8e9192] italic leading-relaxed">"{p.identityStatement}"</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {core.map((t) => (
                  <span key={t.id} className="font-mono-code text-[10px] px-2 py-1 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5]">
                    {t.name} {t.value}
                  </span>
                ))}
              </div>

              <div className="font-mono-code text-[11px] text-[#7e7d7d]">
                {p.blendedReferenceIds.length} references · created {new Date(p.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#1e1e1e]">
                {isActive ? (
                  <button
                    onClick={() => onNavigate('today')}
                    className="flex-1 neo-btn px-3 py-2 rounded-lg font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]"
                  >
                    Open Workspace
                  </button>
                ) : (
                  <button
                    onClick={() => onSwitch(p.id)}
                    className="flex-1 neo-btn px-3 py-2 rounded-lg font-mono-code text-xs text-[#121212] bg-[#c8c6c5] hover:bg-white font-semibold"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => onNavigate('persona-manage')}
                  className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1]"
                  title="Manage"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {!isActive && (
                  <button
                    onClick={() => onArchive(p.id)}
                    className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#ffb4ab]"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {personas.length === 0 && (
        <div className="neo-recessed p-10 rounded-2xl text-center border border-[#1e1e1e]">
          <Library className="w-8 h-8 text-[#8e9192] mx-auto mb-3" />
          <p className="font-body text-sm text-[#8e9192]">No personas yet. Create your first.</p>
        </div>
      )}
    </div>
  );
};
