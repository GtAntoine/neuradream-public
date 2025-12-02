import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Dream, ThemeAnalysis, GlobalAnalysis } from '@/types';

const STORAGE_KEYS = {
  DREAMS: '@NeuraDream:dreams',
  THEMES: '@NeuraDream:themes',
  GLOBAL_ANALYSIS: '@NeuraDream:globalAnalysis'
};

export class DreamDB {
  private static instance: DreamDB | null = null;
  private initialized: boolean = false;

  constructor() {
    if (DreamDB.instance) {
      return DreamDB.instance;
    }
    DreamDB.instance = this;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Vérifier si les clés de stockage existent, sinon les initialiser
      const keys = await AsyncStorage.getAllKeys();
      
      if (!keys.includes(STORAGE_KEYS.DREAMS)) {
        await AsyncStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify([]));
      }
      
      if (!keys.includes(STORAGE_KEYS.THEMES)) {
        await AsyncStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify([]));
      }
      
      if (!keys.includes(STORAGE_KEYS.GLOBAL_ANALYSIS)) {
        await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_ANALYSIS, JSON.stringify(null));
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  // Dreams
  async addDream(dream: Dream): Promise<void> {
    this.ensureInitialized();
    try {
      const dreams = await this.getAllDreams();
      dreams.push(dream);
      await AsyncStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams));
    } catch (error) {
      console.error('Failed to add dream:', error);
      throw new Error('Failed to add dream');
    }
  }

  async updateDream(dream: Dream): Promise<void> {
    this.ensureInitialized();
    try {
      const dreams = await this.getAllDreams();
      const index = dreams.findIndex(d => d.id === dream.id);
      if (index !== -1) {
        dreams[index] = dream;
        await AsyncStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams));
      }
    } catch (error) {
      console.error('Failed to update dream:', error);
      throw new Error('Failed to update dream');
    }
  }

  async deleteDream(id: string): Promise<void> {
    this.ensureInitialized();
    try {
      const dreams = await this.getAllDreams();
      const filteredDreams = dreams.filter(d => d.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(filteredDreams));
    } catch (error) {
      console.error('Failed to delete dream:', error);
      throw new Error('Failed to delete dream');
    }
  }

  async getAllDreams(): Promise<Dream[]> {
    this.ensureInitialized();
    try {
      const dreamsJson = await AsyncStorage.getItem(STORAGE_KEYS.DREAMS);
      return dreamsJson ? JSON.parse(dreamsJson) : [];
    } catch (error) {
      console.error('Failed to get dreams:', error);
      throw new Error('Failed to get dreams');
    }
  }

  // Theme Analysis
  async addThemeAnalysis(analysis: ThemeAnalysis): Promise<void> {
    this.ensureInitialized();
    try {
      const themes = await this.getAllThemeAnalyses();
      const index = themes.findIndex(t => t.theme === analysis.theme);
      if (index !== -1) {
        themes[index] = analysis;
      } else {
        themes.push(analysis);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
    } catch (error) {
      console.error('Failed to add theme analysis:', error);
      throw new Error('Failed to add theme analysis');
    }
  }

  async deleteThemeAnalysis(theme: string): Promise<void> {
    this.ensureInitialized();
    try {
      const themes = await this.getAllThemeAnalyses();
      const filteredThemes = themes.filter(t => t.theme !== theme.toLowerCase());
      await AsyncStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(filteredThemes));
    } catch (error) {
      console.error('Failed to delete theme analysis:', error);
      throw new Error('Failed to delete theme analysis');
    }
  }

  async getThemeAnalysis(theme: string): Promise<ThemeAnalysis | null> {
    this.ensureInitialized();
    try {
      const themes = await this.getAllThemeAnalyses();
      return themes.find(t => t.theme === theme.toLowerCase()) || null;
    } catch (error) {
      console.error('Failed to get theme analysis:', error);
      throw new Error('Failed to get theme analysis');
    }
  }

  async getAllThemeAnalyses(): Promise<ThemeAnalysis[]> {
    this.ensureInitialized();
    try {
      const themesJson = await AsyncStorage.getItem(STORAGE_KEYS.THEMES);
      return themesJson ? JSON.parse(themesJson) : [];
    } catch (error) {
      console.error('Failed to get theme analyses:', error);
      throw new Error('Failed to get theme analyses');
    }
  }

  async searchThemeAnalyses(query: string): Promise<ThemeAnalysis[]> {
    this.ensureInitialized();
    try {
      const themes = await this.getAllThemeAnalyses();
      const searchTerm = query.toLowerCase();
      return themes.filter(analysis => 
        analysis.theme.toLowerCase().includes(searchTerm) ||
        analysis.explanation.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Failed to search theme analyses:', error);
      throw new Error('Failed to search theme analyses');
    }
  }

  // Global Analysis
  async saveGlobalAnalysis(analysis: GlobalAnalysis): Promise<void> {
    this.ensureInitialized();
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_ANALYSIS, JSON.stringify(analysis));
    } catch (error) {
      console.error('Failed to save global analysis:', error);
      throw new Error('Failed to save global analysis');
    }
  }

  async getLatestGlobalAnalysis(): Promise<GlobalAnalysis | null> {
    this.ensureInitialized();
    try {
      const analysisJson = await AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_ANALYSIS);
      return analysisJson ? JSON.parse(analysisJson) : null;
    } catch (error) {
      console.error('Failed to get global analysis:', error);
      throw new Error('Failed to get global analysis');
    }
  }
}