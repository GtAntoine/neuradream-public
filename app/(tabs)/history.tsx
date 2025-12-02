import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Platform 
} from 'react-native';
import { Brain, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useDreams } from '@/hooks/useDreams';
import { analyzeDream, generateDreamImage } from '@/lib/openai';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInRight 
} from 'react-native-reanimated';
import type { Dream } from '@/types';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation('fr');
  const { dreams, updateDream, deleteDream } = useDreams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [errorDreamId, setErrorDreamId] = useState<string | null>(null);
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null);

  const handleAnalyze = async (dream: Dream) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setErrorDreamId(null);
    try {
      const analysis = await analyzeDream(dream.content, { apiKey });
      const imageUrl = await generateDreamImage(analysis.imagePrompt, apiKey);
      
      const updatedDream: Dream = {
        ...dream,
        title: analysis.title,
        thumbnail: imageUrl,
        analysis: {
          ...analysis,
          timestamp: Date.now()
        }
      };
      
      await updateDream(updatedDream);
      router.push(`/dream/${dream.id}`);
    } catch (error) {
      setAnalysisError(t('analysisError'));
      setErrorDreamId(dream.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDreamItem = ({ item: dream }: { item: Dream }) => (
    <Animated.View
      entering={FadeIn.delay(200)}
      style={styles.dreamCard}
    >
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setDreamToDelete(dream.id)}
      >
        <Trash2 size={16} color="#ef4444" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push(`/dream/${dream.id}`)}
        style={styles.dreamContent}
      >
        {dream.thumbnail && (
          <Image
            source={{ uri: dream.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.dreamInfo}>
          <Text style={styles.date}>
            {new Date(dream.date).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {dream.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {dream.content}
          </Text>
        </View>
      </TouchableOpacity>

      {!dream.analysis && (
        <View style={styles.analyzeSection}>
          {errorDreamId === dream.id && analysisError && (
            <Text style={styles.errorText}>{analysisError}</Text>
          )}
          <TouchableOpacity
            onPress={() => handleAnalyze(dream)}
            disabled={isAnalyzing}
            style={[
              styles.analyzeButton,
              isAnalyzing && styles.analyzeButtonDisabled
            ]}
          >
            <Brain size={16} color="#fff" />
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? t('analyzing') : t('analyze')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {dreamToDelete === dream.id && (
        <View style={styles.deleteConfirmation}>
          <Text style={styles.deleteConfirmationText}>
            Voulez-vous vraiment supprimer ce rêve ?
          </Text>
          <View style={styles.deleteConfirmationButtons}>
            <TouchableOpacity
              onPress={() => {
                deleteDream(dream.id);
                setDreamToDelete(null);
              }}
              style={styles.confirmDeleteButton}
            >
              <Text style={styles.confirmDeleteButtonText}>
                Supprimer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDreamToDelete(null)}
              style={styles.cancelDeleteButton}
            >
              <Text style={styles.cancelDeleteButtonText}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        renderItem={renderDreamItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#172554',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  dreamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
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
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  dreamContent: {
    flexDirection: 'row',
    padding: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  dreamInfo: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  analyzeSection: {
    padding: 16,
    paddingTop: 0,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deleteConfirmation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  deleteConfirmationText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteConfirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmDeleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cancelDeleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelDeleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});