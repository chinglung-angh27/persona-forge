import { useState, useEffect, useCallback } from 'react';
import { ReferenceItem } from '../types';
import { INITIAL_REFERENCES } from '../data/initialData';

const REFERENCES_KEY = 'pf_references';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useReferenceLibrary() {
  const [references, setReferences] = useState<ReferenceItem[]>(() => {
    const saved = localStorage.getItem(REFERENCES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ReferenceItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedIds = new Set(parsed.map(r => r.id));
          const initialRefs = INITIAL_REFERENCES.filter(r => !savedIds.has(r.id));
          return [...parsed, ...initialRefs];
        }
      } catch {
        /* fall through to initial */
      }
    }
    return INITIAL_REFERENCES;
  });

  useEffect(() => {
    localStorage.setItem(REFERENCES_KEY, JSON.stringify(references));
  }, [references]);

  const addReference = useCallback((ref: Omit<ReferenceItem, 'id'>) => {
    const newRef: ReferenceItem = {
      ...ref,
      id: uid('ref'),
    };
    setReferences(prev => [...prev, newRef]);
    return newRef.id;
  }, []);

  const updateReference = useCallback((id: string, partial: Partial<ReferenceItem>) => {
    setReferences(prev => prev.map(r => r.id === id ? { ...r, ...partial } : r));
  }, []);

  const deleteReference = useCallback((id: string) => {
    const isInitial = INITIAL_REFERENCES.some(r => r.id === id);
    if (isInitial) return false;
    setReferences(prev => prev.filter(r => r.id !== id));
    return true;
  }, []);

  const getReference = useCallback((id: string) => {
    return references.find(r => r.id === id);
  }, [references]);

  const isInitialReference = useCallback((id: string) => {
    return INITIAL_REFERENCES.some(r => r.id === id);
  }, []);

  return {
    references,
    addReference,
    updateReference,
    deleteReference,
    getReference,
    isInitialReference,
  };
}