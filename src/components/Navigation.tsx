import React, { useState } from 'react';
import { ViewMode, Persona } from '../types';
import {
  Sun,
  Fingerprint,
  Cpu,
  BookOpen,
  Bell,
  LogOut,
  MoreHorizontal,
  Plus,
  Library,
  Check,
} from 'lucide-react';
import { PersonaSwitcher } from './PersonaSwitcher';

interface NavigationProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  userEmail: string;
  personaName: string;
  onLogout: () => void;
  onOpenMore: () => void;
  personas: Persona[];
  activePersonaId: string;
  onSwitchPersona: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenCreate: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  userEmail,
  personaName,
  onLogout,
  onOpenMore,
  personas,
  activePersonaId,
  onSwitchPersona,
  onOpenLibrary,
  onOpenCreate,
}) => {
  // 4 primary tabs. Anything else (persona profile, references, evolution, settings)
  // lives under the More menu.
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: 'today',    label: 'Today',  icon: <Sun className="w-5 h-5" />,         hint: 'Your focus for today' },
    { id: 'dna',      label: 'DNA',    icon: <Fingerprint className="w-5 h-5" />, hint: 'Calibrate your traits' },
    { id: 'train',    label: 'Train',  icon: <Cpu className="w-5 h-5" />,         hint: 'Practice scenarios & mentors' },
    { id: 'journal',  label: 'Journal',icon: <BookOpen className="w-5 h-5" />,    hint: 'Habits, reflections, history' },
  ];

  const isMoreOpen = currentView === 'more-settings';

  // Compact persona picker that lives in the mobile top nav.
  // Renders the active persona's initial as a circular icon; tapping opens
  // a dropdown with the persona list + Library + Create (same surface as
  // the desktop PersonaSwitcher, but in a popover rather than a sidebar block).
  const PersonaTrigger: React.FC<{
    personas: Persona[];
    activePersonaId: string;
    onSwitch: (id: string) => void;
    onOpenLibrary: () => void;
    onOpenCreate: () => void;
  }> = ({ personas, activePersonaId, onSwitch, onOpenLibrary, onOpenCreate }) => {
    const [open, setOpen] = useState(false);
    const active = personas.find((p) => p.id === activePersonaId);

    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-10 h-10 rounded-full bg-[#121212] neo-btn flex items-center justify-center text-[#c8c6c5] hover:text-white ${open ? 'neo-recessed border border-[#c8c6c5]' : ''}`}
          title={`Persona: ${active?.name || 'None'}`}
          aria-label="Switch persona"
        >
          <span className="font-display text-sm font-bold text-[#c8c6c5]">
            {(active?.name || '?').charAt(0).toUpperCase()}
          </span>
        </button>

        {open && (
          <>
            {/* Click-away catcher. */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 z-40 bg-[#161616] neo-extruded-large rounded-2xl p-2 border border-[#2a2a2a] shadow-2xl">
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
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Nav Bar */}
      <header className="md:hidden fixed top-0 left-0 w-full z-40 bg-[#121212] shadow-[-6px_-6px_12px_rgba(255,255,255,0.03),6px_6px_12px_rgba(0,0,0,0.5)] flex flex-col gap-3 px-6 pt-3 pb-3 border-b border-[#1c1b1b]">
        <div className="flex justify-between items-center h-14">
          <div
            onClick={() => onNavigate('today')}
            className="cursor-pointer flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#121212] neo-extruded-sm flex items-center justify-center p-1 border border-[#2a2a2a]/40">
              <img src="/pf-logo.png" alt="Persona Forge" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight text-[#c8c6c5]">Persona Forge</div>
              <div className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest">Evolution Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('today')}
              className="w-10 h-10 rounded-full bg-[#121212] neo-btn flex items-center justify-center text-[#c8c6c5] hover:text-white"
              title="Today"
            >
              <Bell className="w-4 h-4" />
            </button>

            <PersonaTrigger
              personas={personas}
              activePersonaId={activePersonaId}
              onSwitch={onSwitchPersona}
              onOpenLibrary={onOpenLibrary}
              onOpenCreate={onOpenCreate}
            />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-72 z-50 bg-[#121212] shadow-[6px_0_12px_rgba(0,0,0,0.5)] flex-col gap-3 p-6 overflow-y-auto custom-scrollbar border-r border-[#1e1e1e]">
        {/* Brand Header */}
        <div
          onClick={() => onNavigate('today')}
          className="cursor-pointer mb-6 px-3 pt-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#121212] neo-extruded flex items-center justify-center p-1.5 border border-[#2a2a2a]/60">
              <img src="/pf-logo.png" alt="Persona Forge" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#c8c6c5]">
              Persona Forge
            </h1>
          </div>
          <p className="font-mono-code text-[11px] text-[#8e9192] uppercase tracking-widest pl-1">
            Evolution Engine
          </p>
        </div>

        {/* PersonaSwitcher — prominent, right after brand header */}
        <div className="mb-2">
          <PersonaSwitcher
            personas={personas}
            activePersonaId={activePersonaId}
            onSwitch={onSwitchPersona}
            onOpenLibrary={onOpenLibrary}
            onOpenCreate={onOpenCreate}
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-3 flex-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-mono-code text-[13px] tracking-wider text-left ${
                  isActive
                    ? 'bg-[#121212] neo-recessed text-[#c8c6c5] border border-[#2a2a2a]/40 font-semibold'
                    : 'text-[#8e9192] hover:text-[#e5e2e1] neo-extruded-sm bg-[#121212]'
                }`}
                style={{ transition: 'color 150ms ease, box-shadow 150ms ease, background-color 150ms ease' }}
              >
                <span className={isActive ? 'text-[#c8c6c5]' : 'text-[#8e9192]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'dna' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#c8c6c5] opacity-80" />
                )}
                {item.id === 'train' && (
                  <span className="ml-auto text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-[#201f1f] text-[#c8c6c5] border border-[#2a2a2a]">
                    AI
                  </span>
                )}
              </button>
            );
          })}

          {/* More button — opens the demoted-features sheet */}
          <button
            onClick={onOpenMore}
            title="Persona, References, Evolution, Settings"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-mono-code text-[13px] tracking-wider text-left mt-1 ${
              isMoreOpen
                ? 'bg-[#121212] neo-recessed text-[#c8c6c5] border border-[#2a2a2a]/40 font-semibold'
                : 'text-[#8e9192] hover:text-[#e5e2e1] neo-extruded-sm bg-[#121212]'
            }`}
            style={{ transition: 'color 150ms ease, box-shadow 150ms ease, background-color 150ms ease' }}
          >
            <span className={isMoreOpen ? 'text-[#c8c6c5]' : 'text-[#8e9192]'}>
              <MoreHorizontal className="w-5 h-5" />
            </span>
            <span>More</span>
          </button>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="pt-4 border-t border-[#1e1e1e] flex flex-col gap-3">
          <div
            onClick={() => onNavigate('more-settings')}
            className="flex items-center gap-3 p-2.5 rounded-xl neo-recessed bg-[#121212] cursor-pointer hover:border-[#2a2a2a] transition-all"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden neo-extruded border border-[#2a2a2a] shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOZBmr9POmtU2A4eEGNJiIZ3I0RNbiQ_S5irH1Or_aT00iHTnDZ-Lzj_mWXJ3PYZUNncZWAeNbJZ3h_XK4mzJ9lWdrrsg9JQwERiKWOY2SmIlueBykNlpzwIwE_wItQww5bY08u_MFHrowgl5f8nkqm98f6UaKI2v0d5I93i4qUzeZxVOx7KHfiOZc0YW97oXoqKFV4C2YL8q9ia3NgROzkBSQpym_7wOLxDrs0VodjCc6Sva_oRQ" 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm font-semibold text-[#e5e2e1] truncate">{personaName || 'Operator'}</div>
              <div className="font-mono-code text-[10px] text-[#8e9192] truncate">{userEmail}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[#8e9192] hover:text-[#ffb4ab] font-mono-code text-xs transition-colors hover:bg-[#1a1414]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-[#121212] shadow-[0_-8px_16px_rgba(0,0,0,0.7)] border-t border-[#1e1e1e] flex justify-around items-center px-3 py-2 h-20">
        {(
          [
            ...navItems,
            { id: '__more__', label: 'More', icon: <MoreHorizontal className="w-5 h-5" /> },
          ] as { id: string; label: string; icon: React.ReactNode }[]
        ).map((tab) => {
          const isActive = tab.id === '__more__' ? isMoreOpen : currentView === (tab.id as ViewMode);
          const handle = tab.id === '__more__' ? onOpenMore : () => onNavigate(tab.id as ViewMode);
          return (
            <button
              key={tab.id}
              onClick={handle}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#c8c6c5] neo-recessed p-2'
                  : 'text-[#8e9192] hover:text-[#e5e2e1]'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-mono-code text-[10px] mt-1 uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
