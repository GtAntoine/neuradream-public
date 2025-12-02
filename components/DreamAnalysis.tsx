import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform 
} from 'react-native';
import { Brain, Loader2 } from 'lucide-react-native';
import type { Dream } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInRight 
} from 'react-native-reanimated';

interface DreamAnalysisViewProps {
  dream: Dream | null;
  onValidateExplanation: (dreamId: string, aspectIndex: number, explanationIndex: number) => void;
  onTitleChange: ((dreamId: string, newTitle: string) => void) | null;
  isAnalyzing?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function DreamAnalysisView({
  dream,
  onValidateExplanation,
  onTitleChange,
  isAnalyzing = false
}: DreamAnalysisViewProps) {
  const { t } = useTranslation('fr');

  if (isAnalyzing) {
    return (
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={styles.loadingContainer}
      >
        <Loader2 size={32} color="#fff" />
        <Text style={styles.loadingText}>{t('analyzing')}</Text>
      </Animated.View>
    );
  }

  if (!dream) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{dream.title}</Text>
        <Text style={styles.date}>
          {new Date(dream.date).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {/* Dream Image */}
      {dream.thumbnail && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: dream.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Dream Content */}
      <Text style={styles.content}>{dream.content}</Text>

      {/* Analysis */}
      {dream.analysis ? (
        <Animated.View 
          entering={SlideInRight} 
          style={styles.analysisContainer}
        >
          {/* Mood */}
          <View style={styles.moodContainer}>
            <Text style={styles.sectionTitle}>{t('overallMood')}</Text>
            <Text style={styles.mood}>{dream.analysis.overallMood}</Text>
          </View>

          {/* Keywords */}
          <View style={styles.keywordsContainer}>
            <Text style={styles.sectionTitle}>{t('keyThemes')}</Text>
            <View style={styles.keywordsList}>
              {dream.analysis.keywords.map((keyword, index) => (
                <View key={index} style={styles.keyword}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Interpretations */}
          <View style={styles.interpretationsContainer}>
            <Text style={styles.sectionTitle}>{t('interpretations')}</Text>
            {dream.analysis.interpretations.map((interpretation, aspectIndex) => (
              <View key={aspectIndex} style={styles.interpretation}>
                <Text style={styles.aspectTitle}>{interpretation.aspect}</Text>
                {interpretation.explanations.map((exp, expIndex) => (
                  <AnimatedTouchableOpacity
                    key={expIndex}
                    onPress={() => onValidateExplanation(dream.id, aspectIndex, expIndex)}
                    style={[
                      styles.explanation,
                      exp.isValidated && styles.explanationValidated
                    ]}
                  >
                    <View style={styles.confidenceContainer}>
                      <View style={[
                        styles.confidenceDot,
                        { backgroundColor: exp.confidence > 80 ? '#22c55e' : 
                                        exp.confidence > 60 ? '#eab308' : 
                                        '#f97316' }
                      ]} />
                      <Text style={styles.confidenceText}>
                        {exp.confidence}% {t('confidence')}
                      </Text>
                    </View>
                    <Text style={styles.explanationText}>{exp.explanation}</Text>
                  </AnimatedTouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
      ) : (
        <View style={styles.noAnalysisContainer}>
          <Brain size={32} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.noAnalysisText}>{t('noAnalysis')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 24,
    marginBottom: 24,
  },
  analysisContainer: {
    gap: 24,
  },
  moodContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  mood: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  keywordsContainer: {
    marginBottom: 24,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  interpretationsContainer: {
    gap: 16,
  },
  interpretation: {
    gap: 8,
  },
  aspectTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  explanation: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  explanationValidated: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 20,
  },
  noAnalysisContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  noAnalysisText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
    textAlign: 'center',
  },
});