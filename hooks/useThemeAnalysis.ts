import { useState, useEffect } from 'react';
import { DreamDB } from '@/lib/db';
import { analyzeTheme } from '@/lib/openai';
import type { ThemeAnalysis } from '@/types';

const db = new DreamDB();
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export function useThemeAnalysis() {
  const [currentTheme, setCurrentTheme] = useState<ThemeAnalysis | null>(null);
  const [savedThemes, setSavedThemes] = useState<ThemeAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedThemes();
  }, []);

  const loadSavedThemes = async () => {
    try {
      const themes = await db.getAllThemeAnalyses();
      setSavedThemes(themes);
    } catch (err) {
      console.error('Failed to load themes:', err);
    }
  };

  const analyzeNewTheme = async (theme: string) => {
    if (!theme.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const existingAnalysis = await db.getThemeAnalysis(theme);
      if (existingAnalysis) {
        setCurrentTheme(existingAnalysis);
        return;
      }

      const analysis = await analyzeTheme(theme, { apiKey });
      await db.addThemeAnalysis(analysis);
      setCurrentTheme(analysis);
      await loadSavedThemes();
    } catch (err) {
      setError('Échec de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteTheme = async (theme: string) => {
    try {
      await db.deleteThemeAnalysis(theme);
      if (currentTheme?.theme === theme) {
        setCurrentTheme(null);
      }
      await loadSavedThemes();
    } catch (err) {
      console.error('Failed to delete theme:', err);
    }
  };

  return {
    currentTheme,
    savedThemes,
    isAnalyzing,
    error,
    analyzeTheme: analyzeNewTheme,
    deleteTheme,
  };
}