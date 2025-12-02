import { useState, useEffect } from 'react';
import { DreamDB } from '@/lib/db';
import type { Dream } from '@/types';

const db = new DreamDB();

export function useDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      await db.init();
      const loadedDreams = await db.getAllDreams();
      setDreams(loadedDreams.sort((a, b) => b.date - a.date));
    } catch (err) {
      setError('Failed to load dreams');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addDream = async (dream: Dream) => {
    try {
      await db.addDream(dream);
      setDreams(prev => [dream, ...prev]);
    } catch (err) {
      setError('Failed to add dream');
      console.error(err);
    }
  };

  const updateDream = async (dream: Dream) => {
    try {
      await db.updateDream(dream);
      setDreams(prev => [
        dream,
        ...prev.filter(d => d.id !== dream.id)
      ]);
    } catch (err) {
      setError('Failed to update dream');
      console.error(err);
    }
  };

  const deleteDream = async (id: string) => {
    try {
      await db.deleteDream(id);
      setDreams(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError('Failed to delete dream');
      console.error(err);
    }
  };

  return {
    dreams,
    isLoading,
    error,
    addDream,
    updateDream,
    deleteDream,
    refresh: loadDreams
  };
}