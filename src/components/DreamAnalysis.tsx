import React from 'react';
import { Brain, Moon, Save, Pencil, Calendar, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Dream } from '../types';
import type { Language } from '../i18n/translations';

interface DreamAnalysisViewProps {
  dream: Dream | null;
  language: Language;
  onValidateExplanation: (dreamId: string, aspectIndex: number, explanationIndex: number) => void;
  onTitleChange: ((dreamId: string, newTitle: string) => void) | null;
  onDateChange?: (dreamId: string, newDate: number) => void;
  isAnalyzing?: boolean;
}

export function DreamAnalysisView({ 
  dream, 
  language, 
  onValidateExplanation, 
  onTitleChange,
  onDateChange,
  isAnalyzing = false
}: DreamAnalysisViewProps) {
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState('');
  const [isEditingDate, setIsEditingDate] = React.useState(false);
  const [editedDate, setEditedDate] = React.useState('');
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = React.useState(false);
  const [showThemeConfirm, setShowThemeConfirm] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (dream && !dream.thumbnail) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [dream?.thumbnail]);

  const handleTitleEdit = () => {
    if (!onTitleChange || !dream) return;
    
    if (isEditingTitle) {
      onTitleChange(dream.id, editedTitle);
      setIsEditingTitle(false);
    } else {
      setEditedTitle(dream.title);
      setIsEditingTitle(true);
    }
  };

  const handleDateEdit = () => {
    if (!onDateChange || !dream) return;

    if (isEditingDate) {
      if (!editedDate) {
        setDateError('La date ne peut pas être vide');
        return;
      }

      try {
        const date = new Date(editedDate);
        if (isNaN(date.getTime())) {
          setDateError('Date invalide');
          return;
        }

        let currentHours = 0;
        let currentMinutes = 0;

        try {
          const currentDate = new Date(dream.date);
          if (!isNaN(currentDate.getTime())) {
            currentHours = currentDate.getHours();
            currentMinutes = currentDate.getMinutes();
          }
        } catch {
          // Si la date actuelle est invalide, on utilise 00:00
        }

        date.setHours(currentHours, currentMinutes);
        
        setDateError(null);
        onDateChange(dream.id, date.getTime());
        setIsEditingDate(false);
      } catch (error) {
        setDateError('Date invalide');
      }
    } else {
      const initialDate = new Date(dream.date);
      setEditedDate(
        isNaN(initialDate.getTime()) 
          ? new Date().toISOString().split('T')[0]
          : initialDate.toISOString().split('T')[0]
      );
      setIsEditingDate(true);
      setDateError(null);
    }
  };

  const handleExplanationClick = (aspectIndex: number, explanationIndex: number) => {
    if (!dream) return;
    onValidateExplanation(dream.id, aspectIndex, explanationIndex);
  };

  const handleThemeClick = (theme: string) => {
    setShowThemeConfirm(theme);
  };

  const handleThemeConfirm = (theme: string) => {
    setShowThemeConfirm(null);
    navigate(`/themes?analyze=${encodeURIComponent(theme)}&returnTo=${encodeURIComponent(location.pathname)}`);
  };

  const formatDateForDisplay = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
    } catch {
      return 'Date invalide';
    }
  };

  if (!dream) return null;

  return (
    <div className="relative">
      {/* Image de fond avec effet de flou */}
      {dream.thumbnail && (
        <div 
          className="absolute inset-0 opacity-10 blur-3xl -z-10"
          style={{
            backgroundImage: `url(${dream.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Contenu principal */}
      <div className="relative space-y-8">
        {/* En-tête avec titre et date */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold bg-white/5 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold">{dream.title}</h2>
            )}
            {onTitleChange && (
              <button
                onClick={handleTitleEdit}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {isEditingTitle ? <Save className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70">
            {isEditingDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="bg-white/5 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button onClick={handleDateEdit} title={t('save')}>
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span>{formatDateForDisplay(dream.date)}</span>
                {onDateChange && (
                  <button
                    onClick={handleDateEdit}
                    className="hover:text-white transition-colors"
                    title={t('editDate')}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Image du rêve */}
        {(dream.thumbnail || isImageLoading) && (
          <div className="relative aspect-video rounded-lg overflow-hidden max-w-2xl mx-auto">
            {isImageLoading ? (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : dream.thumbnail && (
              <img
                src={dream.thumbnail}
                alt={dream.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            )}
          </div>
        )}

        {/* Contenu du rêve */}
        <p className="text-lg leading-relaxed">{dream.content}</p>

        {/* Analyse */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="relative">
              <Brain className="w-12 h-12 animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-50">
                <Brain className="w-12 h-12" />
              </div>
            </div>
            <p className="text-lg">{t('analyzing')}</p>
          </div>
        ) : dream.analysis ? (
          <div className="space-y-12">
        

            {/* Thèmes */}
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('keyThemes')}</h3>
              <div className="flex flex-wrap gap-3">
                {dream.analysis.keywords.map((keyword, i) => (
                  <div key={i} className="relative">
                    <button
                      onClick={() => handleThemeClick(keyword)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600/50 to-purple-600/50 hover:from-indigo-500/50 hover:to-purple-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      {keyword}
                    </button>
                    {showThemeConfirm === keyword && (
                      <div className="absolute z-10 mt-2" style={{ width: '200px', left: '50%', transform: 'translateX(-50%)' }}>
                        <div className="bg-gray-900/95 backdrop-blur rounded-lg p-4 shadow-lg">
                          <p className="text-sm mb-3 text-center">
                            Voulez-vous analyser le thème "{keyword}" ?
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleThemeConfirm(keyword)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition-colors"
                            >
                              Oui
                            </button>
                            <button
                              onClick={() => setShowThemeConfirm(null)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                            >
                              Non
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interprétations */}
            <div>
              <h3 className="text-xl font-semibold mb-6">{t('interpretations')}</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {dream.analysis.interpretations.map((interpretation, aspectIndex) => (
                  <div key={aspectIndex} className="space-y-3">
                    <h4 className="font-medium text-white/90">
                      {interpretation.aspect}
                    </h4>
                    <div className="space-y-3">
                      {interpretation.explanations.map((exp, expIndex) => (
                        <button
                          key={expIndex}
                          onClick={() => handleExplanationClick(aspectIndex, expIndex)}
                          className={`w-full text-left p-4 rounded-lg transition-all duration-500 ${
                            exp.isValidated
                              ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/30 hover:from-green-600/40 hover:to-emerald-600/40'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                exp.confidence > 80 ? 'bg-green-400' :
                                exp.confidence > 60 ? 'bg-yellow-400' :
                                'bg-orange-400'
                              }`} />
                              <span className="text-white/70">
                                {exp.confidence}% {t('confidence')}
                              </span>
                            </div>
                            {exp.isValidated && <Save className="w-4 h-4 text-green-400" />}
                          </div>
                          <p className="leading-relaxed">{exp.explanation}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-white/50">
            <Brain className="w-12 h-12 mx-auto mb-3" />
            <p>{t('noAnalysis')}</p>
          </div>
        )}
      </div>
    </div>
  );
}