import type { Dream, ThemeAnalysis, GlobalAnalysis } from '../types';

export class DreamDB {
  private static instance: DreamDB | null = null;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly DB_NAME = 'NeuraDreamDB';
  private readonly STORES = {
    dreams: 'dreams',
    themes: 'themes',
    globalAnalysis: 'globalAnalysis'
  };
  private readonly VERSION = 3;

  constructor() {
    if (DreamDB.instance) {
      return DreamDB.instance;
    }
    DreamDB.instance = this;
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORES.dreams)) {
          db.createObjectStore(this.STORES.dreams, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(this.STORES.themes)) {
          db.createObjectStore(this.STORES.themes, { keyPath: 'theme' });
        }

        if (!db.objectStoreNames.contains(this.STORES.globalAnalysis)) {
          db.createObjectStore(this.STORES.globalAnalysis, { keyPath: 'id' });
        }
      };
    });

    return this.initPromise;
  }

  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  async addDream(dream: Dream): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.dreams], 'readwrite');
      const store = transaction.objectStore(this.STORES.dreams);
      const request = store.add(dream);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateDream(dream: Dream): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.dreams], 'readwrite');
      const store = transaction.objectStore(this.STORES.dreams);
      const request = store.put(dream);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteDream(id: string): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.dreams], 'readwrite');
      const store = transaction.objectStore(this.STORES.dreams);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllDreams(): Promise<Dream[]> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.dreams], 'readonly');
      const store = transaction.objectStore(this.STORES.dreams);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addThemeAnalysis(analysis: ThemeAnalysis): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.themes], 'readwrite');
      const store = transaction.objectStore(this.STORES.themes);
      const request = store.put(analysis);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteThemeAnalysis(theme: string): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.themes], 'readwrite');
      const store = transaction.objectStore(this.STORES.themes);
      const request = store.delete(theme.toLowerCase());

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getThemeAnalysis(theme: string): Promise<ThemeAnalysis | null> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.themes], 'readonly');
      const store = transaction.objectStore(this.STORES.themes);
      const request = store.get(theme.toLowerCase());

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllThemeAnalyses(): Promise<ThemeAnalysis[]> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.themes], 'readonly');
      const store = transaction.objectStore(this.STORES.themes);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async searchThemeAnalyses(query: string): Promise<ThemeAnalysis[]> {
    const allAnalyses = await this.getAllThemeAnalyses();
    const searchTerm = query.toLowerCase();
    
    return allAnalyses.filter(analysis => 
      analysis.theme.toLowerCase().includes(searchTerm) ||
      analysis.explanation.toLowerCase().includes(searchTerm)
    );
  }

  async saveGlobalAnalysis(analysis: GlobalAnalysis): Promise<void> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.globalAnalysis], 'readwrite');
      const store = transaction.objectStore(this.STORES.globalAnalysis);
      const request = store.put({
        id: 'latest',
        ...analysis
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLatestGlobalAnalysis(): Promise<GlobalAnalysis | null> {
    await this.init();
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.globalAnalysis], 'readonly');
      const store = transaction.objectStore(this.STORES.globalAnalysis);
      const request = store.get('latest');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          delete result.id;
          resolve(result);
        } else {
          resolve(null);
        }
      };
    });
  }
}