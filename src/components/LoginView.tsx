import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email.trim() || 'local@persona.forge');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 font-body relative overflow-hidden bg-[#121212] text-[#e5e2e1]">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 10%, rgba(200, 198, 197, 0.15) 0%, transparent 60%)',
        }}
      />

      <main className="w-full max-w-md bg-[#121212] rounded-2xl neo-extruded-large p-8 md:p-12 relative z-10 flex flex-col border border-[#1e1e1e]/60">
        <div className="flex items-center gap-2 mb-1">
          <img src="/pf-logo.png" alt="" className="w-5 h-5 object-contain" aria-hidden="true" />
          <span className="font-mono-code text-xs text-[#8e9192] uppercase tracking-[0.25em]">
            Persona Forge
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#e5e2e1] mt-2">
          Configure Local Profile
        </h1>
        <p className="font-body text-sm text-[#8e9192] mt-2 leading-relaxed">
          This is a local journal — your data stays in this browser. No account, no server.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label htmlFor="email" className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">
              Backup Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
              placeholder="local@persona.forge"
            />
          </div>

          <button
            type="submit"
            className="neo-btn w-full px-6 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Enter Forge
          </button>
        </form>
      </main>
    </div>
  );
};
