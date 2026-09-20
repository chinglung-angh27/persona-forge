import React, { useState } from 'react';
import { ReferenceItem, Trait } from '../types';
import { Search, Plus, Check, Sparkles, Quote, X, Edit, Trash2 } from 'lucide-react';
import { ReferenceEditorView } from './ReferenceEditorView';

interface ReferenceLibraryViewProps {
  references: ReferenceItem[];
  activeTraits: Trait[];
  onApplyReference: (ref: ReferenceItem) => void;
  blendedReferences: string[];
  onAddReference?: (ref: Omit<ReferenceItem, 'id'>) => void;
  onUpdateReference?: (id: string, ref: Partial<ReferenceItem>) => void;
  onDeleteReference?: (id: string) => void;
  isInitialReference?: (id: string) => boolean;
}

export const ReferenceLibraryView: React.FC<ReferenceLibraryViewProps> = ({
  references,
  activeTraits,
  onApplyReference,
  blendedReferences,
  onAddReference,
  onUpdateReference,
  onDeleteReference,
  isInitialReference
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedReference, setSelectedReference] = useState<ReferenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingReference, setEditingReference] = useState<ReferenceItem | null>(null);

  const categories = [
    'All',
    'Tech Visionaries',
    'Athletes',
    'Fictional',
    'Historical',
    'Philosophers'
  ];

  const handleAddNewReference = () => {
    setEditingReference(null);
    setShowEditor(true);
  };

  const handleEditReference = (ref: ReferenceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReference(ref);
    setShowEditor(true);
  };

  const handleDeleteReference = (ref: ReferenceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteReference || isInitialReference?.(ref.id)) return;
    if (window.confirm(`Delete "${ref.name}"? This cannot be undone.`)) {
      onDeleteReference(ref.id);
      setToastMessage(`Deleted ${ref.name}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleEditorSave = (ref: Omit<ReferenceItem, 'id'>) => {
    if (editingReference && onUpdateReference) {
      onUpdateReference(editingReference.id, ref);
      setToastMessage(`Updated ${ref.name}`);
    } else if (onAddReference) {
      onAddReference(ref);
      setToastMessage(`Added ${ref.name}`);
    }
    setTimeout(() => setToastMessage(null), 3000);
    setShowEditor(false);
    setEditingReference(null);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingReference(null);
  };

  const filteredReferences = references.filter((ref) => {
    const matchesCategory =
      selectedCategory === 'All' || ref.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ref.name.toLowerCase().includes(query) ||
      ref.title.toLowerCase().includes(query) ||
      ref.traits.some((t) => t.toLowerCase().includes(query)) ||
      ref.bio.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleAddClick = (ref: ReferenceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onApplyReference(ref);
    setToastMessage(`Blended ${ref.name}'s mental models into your DNA matrix!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header & Global Search */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Reference Library
          </h1>
          {onAddReference && (
            <button
              onClick={handleAddNewReference}
              className="neo-btn px-6 py-3 rounded-xl font-mono-code text-xs font-semibold text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2"
              aria-label="Add new reference"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reference</span>
            </button>
          )}
        </div>

        {/* Global Search - Recessed Well */}
        <div className="w-full max-w-2xl relative neo-recessed rounded-full bg-[#121212] flex items-center px-6 py-3.5 border border-[#1e1e1e]">
          <Search className="w-5 h-5 text-[#8e9192] mr-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search references, traits, or archetypes..."
            className="bg-transparent border-none outline-none text-[#e5e2e1] font-body text-base w-full placeholder-[#7e7d7d] focus:ring-0 px-0"
            aria-label="Search references"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#8e9192] hover:text-[#e5e2e1] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Categories */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 hide-scrollbar items-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-6 py-3 rounded-full font-mono-code text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'neo-recessed bg-[#121212] text-[#c8c6c5] border border-[#2a2a2a] font-semibold'
                  : 'neo-extruded bg-[#121212] text-[#8e9192] hover:text-[#e5e2e1] border border-[#1e1e1e]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl neo-extruded bg-[#121212] border border-[#2a2a2a] text-[#c8c6c5] flex items-center justify-between font-mono-code text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#8e9192] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reference Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredReferences.map((ref) => {
          const isBlended = blendedReferences.includes(ref.id);

          return (
            <div
              key={ref.id}
              onClick={() => setSelectedReference(ref)}
              className="neo-card rounded-3xl bg-[#121212] p-6 flex flex-col gap-6 relative group overflow-hidden border border-[#1e1e1e]/60 hover:border-[#2a2a2a] cursor-pointer transition-all duration-300"
            >
              {/* Image Container (Recessed well) */}
              <div className="w-full h-56 rounded-2xl neo-recessed overflow-hidden relative bg-[#0e0e0e] border border-[#1c1b1b]">
                <img
                  src={ref.imageUrl}
                  alt={ref.altText || ref.name}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80 pointer-events-none" />

                {isBlended && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full neo-recessed bg-[#121212]/90 border border-emerald-500/40 text-emerald-400 font-mono-code text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Blended</span>
                  </div>
                )}
              </div>

              {/* Text & Traits Info */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-2xl text-[#e5e2e1] font-bold group-hover:text-white transition-colors">
                    {ref.name}
                  </h2>
                  {(onUpdateReference || onDeleteReference) && !isInitialReference?.(ref.id) && (
                    <div className="flex items-center gap-1">
                      {onUpdateReference && (
                        <button
                          onClick={(e) => handleEditReference(ref, e)}
                          className="p-1.5 rounded-lg neo-recessed text-[#8e9192] hover:text-[#e5e2e1] transition-colors"
                          aria-label={`Edit ${ref.name}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteReference && (
                        <button
                          onClick={(e) => handleDeleteReference(ref, e)}
                          className="p-1.5 rounded-lg neo-recessed text-[#8e9192] hover:text-[#ffb4ab] transition-colors"
                          aria-label={`Delete ${ref.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="font-mono-code text-xs text-[#8e9192] uppercase tracking-[0.2em] mb-4">
                  {ref.title}
                </p>

                {/* Traits Tags (Recessed) */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {ref.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="neo-recessed px-3.5 py-1.5 rounded-lg font-mono-code text-[11px] text-[#c4c7c7] bg-[#121212] border border-[#1e1e1e]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Action Button (Extruded) */}
                <button
                  onClick={(e) => handleAddClick(ref, e)}
                  className={`mt-auto neo-btn w-full py-3.5 rounded-xl font-mono-code text-xs font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 border cursor-pointer ${
                    isBlended
                      ? 'bg-[#1c1b1b] text-emerald-300 border-emerald-500/30'
                      : 'bg-[#121212] text-[#c8c6c5] hover:text-white border-[#2a2a2a]'
                  }`}
                  aria-label={`Add ${ref.name} traits to persona`}
                >
                  {isBlended ? (
                    <>
                      <span>ACTIVE IN PERSONA</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <span>ADD TO PERSONA</span>
                      <Plus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReferences.length === 0 && (
        <div className="neo-recessed p-12 rounded-2xl text-center border border-[#1e1e1e] space-y-3">
          <p className="font-display text-lg text-[#c8c6c5]">No references matched "{searchQuery}"</p>
          <p className="font-body text-sm text-[#8e9192]">Try searching by traits like "Discipline", "Focus", or "Stoic"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a] mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Reference Detail Inspection Modal */}
      {selectedReference && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121212] neo-extruded-large rounded-3xl p-6 md:p-8 border border-[#2a2a2a] relative overflow-hidden">
            <button
              onClick={() => setSelectedReference(null)}
              className="absolute top-6 right-6 p-2 rounded-full neo-recessed text-[#8e9192] hover:text-[#e5e2e1]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="w-full md:w-48 h-48 rounded-2xl neo-recessed overflow-hidden shrink-0 bg-[#0e0e0e]">
                <img
                  src={selectedReference.imageUrl}
                  alt={selectedReference.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-mono-code text-[11px] text-[#8e9192] uppercase tracking-widest px-2.5 py-1 rounded bg-[#1c1b1b] neo-recessed inline-block mb-2">
                  {selectedReference.category}
                </span>
                <h3 className="font-display text-3xl font-bold text-[#e5e2e1] mb-1">
                  {selectedReference.name}
                </h3>
                <p className="font-mono-code text-xs text-[#c8c6c5] uppercase tracking-wider mb-4">
                  {selectedReference.title}
                </p>

                {selectedReference.quote && (
                  <div className="neo-recessed p-3.5 rounded-xl border border-[#1e1e1e] flex gap-2.5 text-xs font-body italic text-[#c4c7c7] mb-3">
                    <Quote className="w-4 h-4 text-[#8e9192] shrink-0" />
                    <span>"{selectedReference.quote}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-1.5">
                  Architectural Biography
                </h4>
                <p className="font-body text-sm text-[#e5e2e1] leading-relaxed">
                  {selectedReference.bio}
                </p>
              </div>

              <div>
                <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192] mb-2">
                  DNA Modifiers Applied On Blend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(selectedReference.dnaModifiers).map(([trait, mod]) => (
                    <div key={trait} className="neo-recessed p-2.5 rounded-lg border border-[#1e1e1e] text-center">
                      <div className="font-mono-code text-[11px] text-[#8e9192]">{trait}</div>
                      <div className="font-mono-code text-sm font-bold text-emerald-400">+{mod}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1e1e1e]">
              <button
                onClick={() => setSelectedReference(null)}
                className="px-5 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleAddClick(selectedReference);
                  setSelectedReference(null);
                }}
                className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs font-semibold text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Inject Traits into Persona</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Editor Modal */}
      {showEditor && (
        <ReferenceEditorView
          initialRef={editingReference}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          isInitial={editingReference ? isInitialReference?.(editingReference.id) : false}
        />
      )}
    </div>
  );
};
