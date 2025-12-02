import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Language } from './i18n/translations';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { DreamDetail } from './pages/DreamDetail';
import { Insights } from './pages/Insights';
import { ThemeAnalysis } from './pages/ThemeAnalysis';
import { DreamDB } from './lib/db';
import type { Dream } from './types';

const db = new DreamDB();

function App() {
  const [language] = useState<Language>('fr');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      await db.init();
      setIsDbInitialized(true);
      const loadedDreams = await db.getAllDreams();
      setDreams(loadedDreams.sort((a, b) => b.date - a.date));
    };
    initDB();
  }, []);

  const updateDreams = (newDream: Dream) => {
    setDreams(prev => [newDream, ...prev.filter(d => d.id !== newDream.id)]);
  };

  if (!isDbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4 mx-auto"></div>
          <p className="text-white">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout language={language}>
        <Routes>
          <Route 
            path="/" 
            element={<Home language={language} dreams={dreams} onDreamUpdate={updateDreams} />} 
          />
          <Route 
            path="/history" 
            element={<History dreams={dreams} language={language} onDreamUpdate={updateDreams} />} 
          />
          <Route 
            path="/dream/:id" 
            element={<DreamDetail dreams={dreams} language={language} onDreamUpdate={updateDreams} />} 
          />
          <Route 
            path="/insights" 
            element={<Insights dreams={dreams} language={language} />} 
          />
          <Route 
            path="/themes" 
            element={<ThemeAnalysis language={language} />} 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App