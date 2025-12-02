import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Brain, Loader2, Trash2 } from 'lucide-react-native';
import type { ThemeAnalysis } from '@/types';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ThemeDetailProps {
  theme: ThemeAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  onThemeSelect: (theme: string) => void;
  onThemeDelete: (theme: string) => void;
}

export function ThemeDetail({
  theme,
  isAnalyzing,
  error,
  onThemeSelect,
  onThemeDelete
}: ThemeDetailProps) {
  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <Loader2 size={32} color="#fff" />
        <Text style={styles.loadingText}>Analyse en cours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!theme) {
    return (
      <View style={styles.emptyContainer}>
        <Brain size={32} color="rgba(255, 255, 255, 0.5)" />
        <Text style={styles.emptyText}>
          Sélectionnez un thème à analyser
        </Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn}>
      <View style={styles.header}>
        <Text style={styles.title}>{theme.theme}</Text>
        <TouchableOpacity
          onPress={() => onThemeDelete(theme.theme)}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signification</Text>
        <Text style={styles.explanation}>{theme.explanation}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exemples de Rêves</Text>
        {theme.examples.map((example, index) => (
          <View key={index} style={styles.example}>
            <Text style={styles.exampleText}>{example}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thèmes Connexes</Text>
        <View style={styles.relatedThemes}>
          {theme.relatedThemes.map((relatedTheme, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onThemeSelect(relatedTheme)}
              style={styles.relatedTheme}
            >
              <Text style={styles.relatedThemeText}>
                {relatedTheme}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
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
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  explanation: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    lineHeight: 24,
  },
  example: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  relatedThemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedTheme: {
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  relatedThemeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
});