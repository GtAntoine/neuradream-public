import { View, Text, StyleSheet } from 'react-native';
import { DreamForm } from '@/components/DreamForm';
import { DreamAnalysisView } from '@/components/DreamAnalysis';
import { useTranslation } from '@/hooks/useTranslation';
import { useDreams } from '@/hooks/useDreams';
import { useState } from 'react';
import type { Dream } from '@/types';

export default function HomeScreen() {
  const { t } = useTranslation('fr');
  const { dreams, addDream, updateDream } = useDreams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleNewDream = async (content: string) => {
    const dream: Dream = {
      id: crypto.randomUUID(),
      date: Date.now(),
      title: '',
      content,
      analysis: null,
      thumbnail: null
    };

    await addDream(dream);
    setSelectedDream(dream);
    await handleAnalyzeDream(dream);
  };

  const handleAnalyzeDream = async (dream: Dream) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Analyse du rêve
      const analysis = await analyzeDream(dream.content);
      
      const updatedDream: Dream = {
        ...dream,
        title: analysis.title,
        analysis: {
          ...analysis,
          timestamp: Date.now(),
          interpretations: analysis.interpretations.map(interp => ({
            ...interp,
            explanations: interp.explanations.map(exp => ({
              ...exp,
              isValidated: false
            }))
          }))
        }
      };
      
      await updateDream(updatedDream);
      setSelectedDream(updatedDream);

      // Génération de l'image en arrière-plan
      generateDreamImage(analysis.imagePrompt).then(async (imageUrl) => {
        const dreamWithImage: Dream = {
          ...updatedDream,
          thumbnail: imageUrl
        };
        await updateDream(dreamWithImage);
        setSelectedDream(dreamWithImage);
      }).catch(console.error);

    } catch (error) {
      setAnalysisError(t('analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <DreamForm 
        onSubmit={handleNewDream} 
        isAnalyzing={isAnalyzing}
      />

      {analysisError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{analysisError}</Text>
        </View>
      ) : selectedDream && (
        <View style={styles.analysisContainer}>
          <DreamAnalysisView
            dream={selectedDream}
            onValidateExplanation={async (dreamId, aspectIndex, explanationIndex) => {
              // Implementation
            }}
            onTitleChange={null}
            isAnalyzing={isAnalyzing}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#172554',
    padding: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  analysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
});