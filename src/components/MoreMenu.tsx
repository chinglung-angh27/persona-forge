import React from 'react';
import { ViewMode } from '../types';
import { UserCheck, Bookmark, TrendingUp, Settings, X, Library } from 'lucide-react';

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

const ENTRIES: { id: ViewMode; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'library',         label: 'Persona Library', hint: 'Switch, create, manage personas',       icon: <Library className="w-5 h-5" /> },
  { id: 'more-persona',    label: 'My Persona',     hint: 'Profile, archetype, blended references', icon: <UserCheck className="w-5 h-5" /> },
  { id: 'more-references', label: 'Reference Library', hint: 'Browse and apply archetypes',        icon: <Bookmark className="w-5 h-5" /> },
  { id: 'more-evolution',  label: 'Evolution Log',  hint: 'Full history of breakthroughs',         icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'more-settings',   label: 'Settings',       hint: 'Account, AI intensity, data',           icon: <Settings className="w-5 h-5" /> },
];

export const MoreMenu: React.FC<MoreMenuProps> = ({ open, onClose, onNavigate }) => {
  if (!open) return null;

  const handlePick = (id: ViewMode) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-end md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md bg-[#121212] neo-extruded-large rounded-t-3xl md:rounded-2xl p-6 border border-[#2a2a2a] md:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[#c8c6c5] tracking-tight">More</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="font-mono-code text-[11px] text-[#8e9192] uppercase tracking-widest mb-4">
          Less-used features
        </p>

        <div className="flex flex-col gap-1.5">
          {ENTRIES.map((e) => (
            <button
              key={e.id}
              onClick={() => handlePick(e.id)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-left neo-extruded-sm bg-[#121212] hover:text-[#e5e2e1] text-[#c8c6c5]"
              style={{ transition: 'color 150ms ease, box-shadow 150ms ease' }}
            >
              <span className="text-[#c8c6c5]">{e.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-mono-code text-sm tracking-wide">{e.label}</span>
                <span className="block font-body text-[11px] text-[#8e9192] mt-0.5">{e.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
