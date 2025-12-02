import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Platform 
} from 'react-native';
import { Brain, Search } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeAnalysis } from '@/hooks/useThemeAnalysis';
import { ThemeDetail } from '@/components/theme/ThemeDetail';
import { CommonThemes } from '@/components/theme/CommonThemes';
import { RecentAnalyses } from '@/components/theme/RecentAnalyses';
import { DeleteConfirmation } from '@/components/theme/DeleteConfirmation';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInRight 
} from 'react-native-reanimated';

const commonThemes = [
  'dents qui tombent',
  'voler',
  'être poursuivi',
  'être nu en public',
  'tomber',
  'être en retard',
  'maison',
  'eau',
  'mort',
  'examen',
  'serpent',
  'argent'
];

export default function ThemeAnalysisScreen() {
  const { t } = useTranslation('fr');
  const { 
    currentTheme,
    isAnalyzing,
    error,
    analyzeTheme,
    deleteTheme,
    savedThemes
  } = useThemeAnalysis();

  const [manualTheme, setManualTheme] = useState('');
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const handleManualSubmit = () => {
    if (manualTheme.trim()) {
      analyzeTheme(manualTheme.trim());
      setManualTheme('');
    }
  };

  const handleDelete = async (theme: string) => {
    await deleteTheme(theme);
    setThemeToDelete(null);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Manual Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={manualTheme}
          onChangeText={setManualTheme}
          placeholder="Entrez un thème à analyser..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleManualSubmit}
          disabled={!manualTheme.trim() || isAnalyzing}
          style={[
            styles.analyzeButton,
            (!manualTheme.trim() || isAnalyzing) && styles.buttonDisabled
          ]}
        >
          <Brain size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'Analyse...' : 'Analyser'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Common Themes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thèmes Communs</Text>
        <View style={styles.themeGrid}>
          {commonThemes.map(theme => (
            <TouchableOpacity
              key={theme}
              onPress={() => analyzeTheme(theme)}
              style={styles.themeButton}
            >
              <Text style={styles.themeButtonText}>{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Analyses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analyses Récentes</Text>
        {savedThemes.map(theme => (
          <Animated.View
            key={theme.theme}
            entering={FadeIn}
            style={styles.analysisCard}
          >
            <TouchableOpacity
              onPress={() => analyzeTheme(theme.theme)}
              style={styles.analysisContent}
            >
              <Text style={styles.analysisTitle}>{theme.theme}</Text>
              <Text 
                style={styles.analysisDescription}
                numberOfLines={2}
              >
                {theme.explanation}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setThemeToDelete(theme.theme)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Theme Detail */}
      {currentTheme && (
        <Animated.View
          entering={SlideInRight}
          style={styles.detailSection}
        >
          <ThemeDetail
            theme={currentTheme}
            isAnalyzing={isAnalyzing}
            error={error}
            onThemeSelect={analyzeTheme}
            onThemeDelete={setThemeToDelete}
          />
        </Animated.View>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        theme={themeToDelete}
        onConfirm={handleDelete}
        onCancel={() => setThemeToDelete(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#172554',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
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
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  analyzeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  analysisContent: {
    padding: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  analysisDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  detailSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
});