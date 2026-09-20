import React, { useState, useEffect } from 'react';
import { ReferenceItem } from '../types';
import { X, Plus, Minus, Save } from 'lucide-react';

interface ReferenceEditorViewProps {
  initialRef?: ReferenceItem | null;
  onClose: () => void;
  onSave: (ref: Omit<ReferenceItem, 'id'>) => void;
  isInitial?: boolean;
}

const CATEGORIES = ['Tech Visionaries', 'Athletes', 'Fictional', 'Historical', 'Philosophers'] as const;
const CATEGORIES_ARRAY = [...CATEGORIES];

export const ReferenceEditorView: React.FC<ReferenceEditorViewProps> = ({
  initialRef,
  onClose,
  onSave,
  isInitial = false
}) => {
  const [formData, setFormData] = useState<Omit<ReferenceItem, 'id'>>({
    name: '',
    title: '',
    category: CATEGORIES_ARRAY[0],
    imageUrl: '',
    altText: '',
    traits: [''],
    quote: '',
    bio: '',
    dnaModifiers: {},
  });

  useEffect(() => {
    if (initialRef) {
      setFormData({
        name: initialRef.name,
        title: initialRef.title,
        category: initialRef.category,
        imageUrl: initialRef.imageUrl,
        altText: initialRef.altText,
        traits: initialRef.traits.length > 0 ? [...initialRef.traits] : [''],
        quote: initialRef.quote || '',
        bio: initialRef.bio,
        dnaModifiers: { ...initialRef.dnaModifiers },
      });
    }
  }, [initialRef]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTraitChange = (index: number, value: string) => {
    const newTraits = [...formData.traits];
    newTraits[index] = value;
    setFormData(prev => ({ ...prev, traits: newTraits }));
  };

  const addTrait = () => {
    setFormData(prev => ({ ...prev, traits: [...prev.traits, ''] }));
  };

  const removeTrait = (index: number) => {
    if (formData.traits.length <= 1) return;
    setFormData(prev => ({ ...prev, traits: prev.traits.filter((_, i) => i !== index) }));
  };

  const handleModifierChange = (trait: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dnaModifiers: { ...prev.dnaModifiers, [trait]: value }
    }));
  };

  const handleAddModifier = () => {
    setFormData(prev => ({ ...prev, dnaModifiers: { ...prev.dnaModifiers, 'New Trait': 0 } }));
  };

  const handleRemoveModifier = (trait: string) => {
    setFormData(prev => {
      const { [trait]: removed, ...rest } = prev.dnaModifiers;
      return { ...prev, dnaModifiers: rest };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.imageUrl.trim() || !formData.bio.trim()) return;
    onSave({
      ...formData,
      traits: formData.traits.filter(t => t.trim()),
      dnaModifiers: Object.fromEntries(
        Object.entries(formData.dnaModifiers).filter(([, v]) => v !== 0)
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#121212] neo-extruded-large rounded-3xl border border-[#2a2a2a] relative max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e1e] sticky top-0 bg-[#121212] z-10">
          <div>
            <h3 className="font-display text-xl font-bold text-[#c8c6c5]">
              {initialRef ? 'Edit Reference' : 'Add Custom Reference'}
            </h3>
            <p className="font-body text-xs text-[#8e9192] mt-1">
              Define a mental model to blend into your persona's DNA matrix.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full neo-recessed text-[#8e9192] hover:text-[#e5e2e1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-6">
            <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. Nikola Tesla"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Title / Archetype</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="e.g. ELECTRICAL GENIUS"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Category</label>
                <select
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                >
                  {CATEGORIES_ARRAY.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={e => handleChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Alt Text</label>
                <input
                  type="text"
                  value={formData.altText}
                  onChange={e => handleChange('altText', e.target.value)}
                  placeholder="Description for accessibility"
                  className="w-full h-12 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#1e1e1e]">
            <div className="flex items-center justify-between">
              <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">Key Traits</h4>
              <button
                type="button"
                onClick={addTrait}
                className="px-3 py-1.5 rounded-lg neo-btn font-mono-code text-[10px] text-[#c8c6c5] border border-[#2a2a2a] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Trait
              </button>
            </div>
            <div className="space-y-2">
              {formData.traits.map((trait, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={trait}
                    onChange={e => handleTraitChange(index, e.target.value)}
                    placeholder={`Trait ${index + 1}`}
                    className="flex-1 h-10 bg-[#121212] rounded-xl neo-input px-4 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
                  />
                  {formData.traits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="p-2 rounded-lg neo-recessed text-[#8e9192] hover:text-[#ffb4ab]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-[#1e1e1e]">
            <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">Narrative</h4>
            <div>
              <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Defining Quote (optional)</label>
              <textarea
                rows={2}
                value={formData.quote}
                onChange={e => handleChange('quote', e.target.value)}
                placeholder='"Your most characteristic statement..."'
                className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
              />
            </div>
            <div>
              <label className="block font-mono-code text-xs text-[#c4c7c7] mb-1.5 uppercase">Biography</label>
              <textarea
                rows={4}
                required
                value={formData.bio}
                onChange={e => handleChange('bio', e.target.value)}
                placeholder="Describe the figure's achievements, mindset, and relevance to your archetype..."
                className="w-full bg-[#121212] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#1e1e1e]">
            <h4 className="font-mono-code text-xs uppercase tracking-widest text-[#8e9192]">DNA Modifiers</h4>
            <p className="font-body text-xs text-[#8e9192]">
              Define how blending this reference shifts persona traits. Positive = boost, negative = dampen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(formData.dnaModifiers).map(([trait, value]) => (
                <div key={trait} className="flex items-center gap-3 neo-recessed p-3 rounded-lg border border-[#1e1e1e]">
                  <input
                    type="text"
                    value={trait}
                    onChange={e => {
                      if (e.target.value !== trait) {
                        setFormData(prev => {
                          const { [trait]: _, ...rest } = prev.dnaModifiers;
                          return { ...prev, dnaModifiers: { ...rest, [e.target.value]: value } };
                        });
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[#e5e2e1]"
                    placeholder="Trait name"
                  />
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    value={value}
                    onChange={e => handleModifierChange(trait, parseInt(e.target.value, 10) || 0)}
                    className="w-20 h-8 bg-[#121212] rounded-xl neo-input px-3 text-sm text-[#e5e2e1] border border-[#1e1e1e] text-center font-mono-code"
                  />
                  <span className="font-mono-code text-xs text-[#8e9192]">%</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveModifier(trait)}
                    className="p-1.5 rounded text-[#8e9192] hover:text-[#ffb4ab]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddModifier}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg neo-btn font-mono-code text-[10px] text-[#c8c6c5] border border-[#2a2a2a]"
              >
                <Plus className="w-3 h-3" />
                Add Modifier
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#1e1e1e] sticky bottom-0 bg-[#121212] z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-mono-code text-xs text-[#8e9192] hover:text-[#e5e2e1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn px-6 py-2.5 rounded-xl font-mono-code text-xs font-semibold text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2"
              disabled={!formData.name.trim() || !formData.title.trim() || !formData.imageUrl.trim() || !formData.bio.trim()}
            >
              <Save className="w-4 h-4" />
              <span>{initialRef ? 'Save Changes' : 'Add Reference'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};