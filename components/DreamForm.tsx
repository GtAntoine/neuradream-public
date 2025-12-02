import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Brain, Moon } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

interface DreamFormProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
}

export function DreamForm({ onSubmit, isAnalyzing }: DreamFormProps) {
  const { t } = useTranslation('fr');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  const pulseStyle = useAnimatedStyle(() => {
    if (!isAnalyzing) return {};
    return {
      transform: [{
        scale: withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1000, easing: Easing.ease }),
            withTiming(1, { duration: 1000, easing: Easing.ease })
          ),
          -1,
          true
        )
      }]
    };
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Moon size={24} color="#fff" style={styles.icon} />
        <Text style={styles.title}>{t('recordDream')}</Text>
      </View>

      {/* Dream Input */}
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t('describeDream')}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        multiline
        textAlignVertical="top"
        style={styles.input}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isAnalyzing || !content.trim()}
        style={[
          styles.button,
          (!content.trim() || isAnalyzing) && styles.buttonDisabled
        ]}
      >
        <Animated.View style={[styles.buttonContent, pulseStyle]}>
          <Brain size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {isAnalyzing ? t('analyzing') : t('analyze')}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  input: {
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});