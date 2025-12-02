import React, { useState } from 'react';
import { Brain, Sparkles, Moon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../i18n/translations';

interface DreamFormProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
  language: Language;
}

export function DreamForm({ onSubmit, isAnalyzing, language }: DreamFormProps) {
  const { t } = useTranslation(language);
  const [content, setContent] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <div className="relative dream-card p-8 mb-8 overflow-hidden">
      {/* Orbes lumineux */}
      <div className="dream-orb dream-orb-large opacity-20 -top-1/2 -left-1/2" />
      <div className="dream-orb dream-orb-medium opacity-10 top-1/4 -right-1/4" />
      
      {/* Étoiles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`star ${
              i % 3 === 0 ? 'star-large' : i % 2 === 0 ? 'star-medium' : 'star-small'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <Moon className="w-6 h-6 dream-float" />
          <h2 className="text-xl font-semibold">{t('recordDream')}</h2>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="dream-input w-full h-40 p-4 text-lg bg-transparent text-white placeholder-white/50 resize-none"
          placeholder={t('describeDream')}
          style={{ lineHeight: '1.6' }}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !content.trim()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="dream-button group relative px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 rounded-lg -z-10" />
            
            {/* Particules */}
            {!isAnalyzing && isHovered && (
              <>
                <Sparkles 
                  className="absolute w-4 h-4 text-yellow-300 dream-sparkle"
                  style={{ left: '10%', top: '20%' }}
                />
                <Sparkles 
                  className="absolute w-3 h-3 text-purple-300 dream-sparkle"
                  style={{ left: '80%', top: '60%', animationDelay: '0.5s' }}
                />
                <Sparkles 
                  className="absolute w-3 h-3 text-blue-300 dream-sparkle"
                  style={{ left: '40%', top: '80%', animationDelay: '1s' }}
                />
              </>
            )}

            <div className="relative flex items-center gap-2">
              {isAnalyzing ? (
                <>
                  <Brain className="w-5 h-5 dream-pulse" />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>{t('analyze')}</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}