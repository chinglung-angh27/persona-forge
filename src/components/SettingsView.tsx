import React, { useState } from 'react';
import { UserSession } from '../types';
import { 
  User, 
  Mail, 
  Brain, 
  Trash2, 
  Save, 
  CheckCircle, 
  Sliders, 
  Download, 
  Upload, 
  AlertTriangle,
  Sparkles,
  Shield,
  Bell
} from 'lucide-react';

interface SettingsViewProps {
  session: UserSession;
  onUpdateSession: (updated: Partial<UserSession>) => void;
  onPurgeData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  session,
  onUpdateSession,
  onPurgeData
}) => {
  const [personaName, setPersonaName] = useState(session.personaName || 'Architect-X');
  const [email, setEmail] = useState(session.email || 'x.architect@forge.ai');
  const [intensity, setIntensity] = useState<'Passive' | 'Balanced' | 'Aggressive'>(
    session.modelIntensity || 'Aggressive'
  );
  const [predictiveInsights, setPredictiveInsights] = useState(
    session.predictiveInsights !== undefined ? session.predictiveInsights : true
  );
  const [tactileSound, setTactileSound] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ponytail: one export covers every pf_* slice; one import restores it and reloads.
  const PF_KEYS = [
    'pf_session', 'pf_traits', 'pf_blended_refs', 'pf_missions',
    'pf_habits', 'pf_reflections', 'pf_evolution'
  ];

  const handleExportJSON = () => {
    const bundle: Record<string, string> = {};
    PF_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) bundle[k] = v;
    });
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ app: 'persona-forge', exportDate: new Date().toISOString(), data: bundle }, null, 2)
    );
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `persona_forge_backup_${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const bundle = parsed?.data ?? parsed;
        if (typeof bundle !== 'object' || bundle === null) throw new Error('No persona data found in file.');
        let restored = 0;
        PF_KEYS.forEach((k) => {
          if (typeof bundle[k] === 'string') {
            localStorage.setItem(k, bundle[k]);
            restored++;
          }
        });
        if (restored === 0) throw new Error('File contains no recognizable persona keys.');
        setImportSuccess(true);
        setTimeout(() => window.location.reload(), 900);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to import file.');
      }
    };
    reader.onerror = () => setImportError('Could not read file.');
    reader.readAsText(file);
  };

  const getIntensitySliderVal = () => {
    if (intensity === 'Passive') return 20;
    if (intensity === 'Balanced') return 50;
    return 80;
  };

  const handleIntensityChange = (val: number) => {
    if (val <= 33) setIntensity('Passive');
    else if (val <= 66) setIntensity('Balanced');
    else setIntensity('Aggressive');
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSession({
      personaName,
      email,
      modelIntensity: intensity,
      predictiveInsights
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="pt-2">
        <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
          Settings
        </h1>
        <p className="font-body text-base md:text-lg text-[#8e9192] mt-2">
          Configure your Obsidian Tactile experience.
        </p>
      </header>

      {/* Save confirmation toast */}
      {saveToast && (
        <div className="p-4 rounded-xl neo-extruded bg-[#121212] border border-[#2a2a2a] text-emerald-400 font-mono-code text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Settings updated and synchronized across local terminal.</span>
          </div>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Account & Profile Card */}
        <section className="neo-card flex flex-col gap-6 bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60">
          <h2 className="font-display text-2xl text-[#c8c6c5] font-semibold flex items-center gap-3 tracking-tight">
            <User className="w-6 h-6 text-[#c8c6c5]" />
            <span>Account Details</span>
          </h2>

          <form onSubmit={handleSaveChanges} className="flex flex-col gap-5 flex-1">
            <div className="flex flex-col gap-2">
              <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-wider pl-1">
                Persona Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="neo-input bg-[#121212] font-body text-base text-[#e5e2e1] p-4 rounded-xl w-full border border-[#1e1e1e] placeholder-[#7e7d7d]"
                  placeholder="Architect-X"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono-code text-xs text-[#8e9192] uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neo-input bg-[#121212] font-body text-base text-[#e5e2e1] p-4 rounded-xl w-full border border-[#1e1e1e] placeholder-[#7e7d7d]"
                  placeholder="x.architect@forge.ai"
                />
              </div>
            </div>

            <div className="neo-recessed p-4 rounded-xl border border-[#1e1e1e] space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-[#8e9192] uppercase">Security Enclave Status</span>
                <span className="text-emerald-400 font-semibold">ENCRYPTED // V.2.4.1</span>
              </div>
              <p className="font-body text-xs text-[#7e7d7d]">
                All persona weights, habit logs, and reflections are securely isolated within local storage.
              </p>
            </div>

            {/* Actions in footer */}
            <div className="mt-auto pt-6 border-t border-[#1e1e1e] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(true)}
                className="neo-btn font-mono-code text-xs text-[#ffb4ab] px-5 py-3 rounded-xl flex items-center gap-2 border border-[#2a2a2a] hover:bg-[#201010] cursor-pointer"
                aria-label="Purge all persona data permanently"
              >
                <Trash2 className="w-4 h-4 text-[#ffb4ab]" />
                <span>PURGE DATA</span>
              </button>

              <button
                type="submit"
                className="neo-btn font-mono-code text-xs text-[#c8c6c5] hover:text-white px-6 py-3 rounded-xl flex items-center gap-2 border border-[#2a2a2a] font-semibold cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* AI Preferences Card */}
        <section className="neo-card flex flex-col gap-6 bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60">
          <h2 className="font-display text-2xl text-[#c8c6c5] font-semibold flex items-center gap-3 tracking-tight">
            <Brain className="w-6 h-6 text-[#c8c6c5]" />
            <span>AI Preferences</span>
          </h2>

          <div className="flex flex-col gap-6 flex-1">
            {/* Model Intensity Slider */}
            <div className="neo-recessed p-6 rounded-2xl bg-[#121212] border border-[#1e1e1e]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-body text-base text-[#e5e2e1] font-semibold">
                  Model Intensity
                </span>
                <span className="font-mono-code text-xs text-[#c8c6c5] bg-[#201f1f] px-3 py-1 rounded-lg neo-recessed border border-[#2a2a2a] font-semibold">
                  {intensity}
                </span>
              </div>

              {/* Neomorphic Custom Range Slider */}
              <div className="relative w-full h-4 neo-recessed rounded-full bg-[#121212] my-4">
                <div
                  className="absolute top-0 left-0 h-full neo-extruded bg-[#201f1f] rounded-full transition-all duration-150"
                  style={{ width: `${getIntensitySliderVal()}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={getIntensitySliderVal()}
                  onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  aria-label="Model Intensity"
                />
                {/* Visual thumb nub */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 neo-extruded bg-[#c8c6c5] rounded-full pointer-events-none flex items-center justify-center transition-all duration-150"
                  style={{ left: `${getIntensitySliderVal()}%` }}
                >
                  <div className="w-2 h-2 rounded-full neo-recessed bg-[#121212]" />
                </div>
              </div>

              <div className="flex justify-between mt-3 font-mono-code text-[11px] text-[#8e9192]">
                <span
                  onClick={() => setIntensity('Passive')}
                  className={`cursor-pointer hover:text-[#e5e2e1] ${intensity === 'Passive' ? 'text-[#c8c6c5] font-bold' : ''}`}
                >
                  Passive
                </span>
                <span
                  onClick={() => setIntensity('Balanced')}
                  className={`cursor-pointer hover:text-[#e5e2e1] ${intensity === 'Balanced' ? 'text-[#c8c6c5] font-bold' : ''}`}
                >
                  Balanced
                </span>
                <span
                  onClick={() => setIntensity('Aggressive')}
                  className={`cursor-pointer hover:text-[#e5e2e1] ${intensity === 'Aggressive' ? 'text-[#c8c6c5] font-bold' : ''}`}
                >
                  Aggressive
                </span>
              </div>
            </div>

            {/* Predictive Insights Toggle */}
            <div className="flex items-center justify-between neo-recessed p-5 rounded-2xl bg-[#121212] border border-[#1e1e1e]">
              <div>
                <p className="font-body text-base text-[#e5e2e1] font-semibold">
                  Predictive Insights
                </p>
                <p className="font-mono-code text-xs text-[#8e9192] mt-1">
                  Allow AI to synthesize daily missions and routines.
                </p>
              </div>

              {/* Neomorphic Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={predictiveInsights}
                onClick={() => setPredictiveInsights(!predictiveInsights)}
                className={`w-14 h-8 rounded-full neo-recessed p-1 transition-colors duration-300 cursor-pointer ${
                  predictiveInsights ? 'bg-[#2a2a2a]' : 'bg-[#121212]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full neo-extruded transition-transform duration-300 ${
                    predictiveInsights
                      ? 'translate-x-6 bg-[#c8c6c5]'
                      : 'translate-x-0 bg-[#8e9192]'
                  }`}
                />
              </button>
            </div>

            {/* Additional Tactile Preferences */}
            <div className="flex items-center justify-between neo-recessed p-5 rounded-2xl bg-[#121212] border border-[#1e1e1e]">
              <div>
                <p className="font-body text-base text-[#e5e2e1] font-semibold">
                  Tactile Audio Haptics
                </p>
                <p className="font-mono-code text-xs text-[#8e9192] mt-1">
                  Subtle resonance feedback on calibration sliders.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={tactileSound}
                onClick={() => setTactileSound(!tactileSound)}
                className={`w-14 h-8 rounded-full neo-recessed p-1 transition-colors duration-300 cursor-pointer ${
                  tactileSound ? 'bg-[#2a2a2a]' : 'bg-[#121212]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full neo-extruded transition-transform duration-300 ${
                    tactileSound
                      ? 'translate-x-6 bg-[#c8c6c5]'
                      : 'translate-x-0 bg-[#8e9192]'
                  }`}
                />
              </button>
            </div>

            {/* Export / Backup options */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1] flex items-center gap-2 border border-[#1e1e1e] flex-1 justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="neo-btn px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1] flex items-center gap-2 border border-[#1e1e1e] flex-1 justify-center"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Backup</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>

              {importSuccess && (
                <div className="p-3 rounded-xl neo-recessed border border-[#2a2a2a] text-emerald-400 font-mono-code text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Backup restored. Reloading…</span>
                </div>
              )}
              {importError && (
                <div className="p-3 rounded-xl neo-recessed border border-[#ffb4ab]/30 text-[#ffb4ab] font-mono-code text-xs flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{importError}</span>
                </div>
              )}
              <p className="font-mono-code text-[11px] text-[#7e7d7d] leading-relaxed">
                Export downloads every local slice (DNA, missions, habits, reflections, simulator logs). Import restores from a backup file — your only protection against the PURGE button.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal for Purge Data */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] neo-extruded-large rounded-2xl p-6 border border-[#93000a]/50 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#1c1b1b] neo-recessed flex items-center justify-center mx-auto text-[#ffb4ab]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-display text-xl font-bold text-[#e5e2e1]">
              Confirm Total Terminal Purge?
            </h3>
            <p className="font-body text-sm text-[#8e9192] leading-relaxed">
              This will permanently reset all calibrated DNA traits, daily streaks, simulator logs, and references to factory baseline.
            </p>

            <div className="flex justify-center gap-3 pt-4 border-t border-[#1e1e1e]">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="px-5 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onPurgeData();
                  setShowPurgeConfirm(false);
                }}
                className="px-6 py-2.5 rounded-xl font-mono-code text-xs font-bold text-white bg-[#93000a] hover:bg-[#b5000d] neo-extruded"
              >
                PURGE EVERYTHING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
