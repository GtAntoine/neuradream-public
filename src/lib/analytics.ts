import type { Dream, DreamAnalysis } from '../types';

export interface DreamInsights {
  totalDreams: number;
  analyzedDreams: number;
  moodDistribution: Record<string, number>;
  commonThemes: Array<{theme: string; count: number}>;
  timeDistribution: Record<string, number>;
  averageConfidence: number;
  validatedInterpretations: number;
  monthlyTrends: Array<{
    month: string;
    count: number;
    dominantMood: string;
    dominantThemes: string[];
  }>;
}

export function analyzeDreams(dreams: Dream[]): DreamInsights {
  const analyzedDreams = dreams.filter(dream => dream.analysis);
  
  // Mood distribution
  const moodDistribution = analyzedDreams.reduce((acc, dream) => {
    const mood = dream.analysis?.overallMood || 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Common themes
  const themesCount = analyzedDreams.reduce((acc, dream) => {
    dream.analysis?.keywords.forEach(keyword => {
      acc[keyword] = (acc[keyword] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const commonThemes = Object.entries(themesCount)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Time distribution
  const timeDistribution = dreams.reduce((acc, dream) => {
    const hour = new Date(dream.date).getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    acc[timeSlot] = (acc[timeSlot] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Average confidence
  let totalConfidence = 0;
  let totalExplanations = 0;
  let validatedInterpretations = 0;

  analyzedDreams.forEach(dream => {
    dream.analysis?.interpretations.forEach(interpretation => {
      interpretation.explanations.forEach(exp => {
        totalConfidence += exp.confidence;
        totalExplanations++;
        if (exp.isValidated) validatedInterpretations++;
      });
    });
  });

  // Monthly trends
  const monthlyData = dreams.reduce((acc, dream) => {
    const date = new Date(dream.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        count: 0,
        moods: {} as Record<string, number>,
        themes: {} as Record<string, number>
      };
    }
    
    acc[monthKey].count++;
    
    if (dream.analysis) {
      const mood = dream.analysis.overallMood;
      acc[monthKey].moods[mood] = (acc[monthKey].moods[mood] || 0) + 1;
      
      dream.analysis.keywords.forEach(theme => {
        acc[monthKey].themes[theme] = (acc[monthKey].themes[theme] || 0) + 1;
      });
    }
    
    return acc;
  }, {} as Record<string, any>);

  const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => {
    const dominantMood = Object.entries(data.moods)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    const dominantThemes = Object.entries(data.themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);

    return {
      month,
      count: data.count,
      dominantMood,
      dominantThemes
    };
  }).sort((a, b) => b.month.localeCompare(a.month));

  return {
    totalDreams: dreams.length,
    analyzedDreams: analyzedDreams.length,
    moodDistribution,
    commonThemes,
    timeDistribution,
    averageConfidence: totalExplanations ? totalConfidence / totalExplanations : 0,
    validatedInterpretations,
    monthlyTrends
  };
}