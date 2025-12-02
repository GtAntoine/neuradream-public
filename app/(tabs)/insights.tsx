import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import { Brain } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useDreams } from '@/hooks/useDreams';
import { analyzeDreams } from '@/lib/analytics';
import Animated, { 
  FadeIn,
  SlideInRight 
} from 'react-native-reanimated';

export default function InsightsScreen() {
  const { t } = useTranslation('fr');
  const { dreams } = useDreams();
  const insights = analyzeDreams(dreams);

  const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <Animated.View
      entering={FadeIn.delay(200)}
      style={styles.statCard}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Animated.View>
  );

  const ProgressBar = ({ 
    label, 
    count, 
    total, 
    color = '#4F46E5' 
  }: { 
    label: string; 
    count: number; 
    total: number;
    color?: string;
  }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressCount}>{count}</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          entering={SlideInRight}
          style={[
            styles.progressBar,
            {
              width: `${(count / total) * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <StatCard 
          title={t('totalDreams')} 
          value={insights.totalDreams} 
        />
        <StatCard 
          title={t('analyzedDreams')} 
          value={insights.analyzedDreams} 
        />
        <StatCard 
          title={t('averageConfidence')} 
          value={`${Math.round(insights.averageConfidence)}%`} 
        />
        <StatCard 
          title={t('validatedInterpretations')} 
          value={insights.validatedInterpretations} 
        />
      </View>

      {/* Mood Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('moodDistribution')}</Text>
        <View style={styles.progressList}>
          {Object.entries(insights.moodDistribution).map(([mood, count]) => (
            <ProgressBar
              key={mood}
              label={mood}
              count={count}
              total={insights.analyzedDreams}
              color="#8B5CF6"
            />
          ))}
        </View>
      </View>

      {/* Recurring Themes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recurringThemes')}</Text>
        <View style={styles.progressList}>
          {insights.commonThemes.map(({ theme, count }) => (
            <ProgressBar
              key={theme}
              label={theme}
              count={count}
              total={insights.analyzedDreams}
              color="#4F46E5"
            />
          ))}
        </View>
      </View>

      {/* Monthly Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('monthlyTrends')}</Text>
        {insights.monthlyTrends.map(trend => (
          <View key={trend.month} style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendMonth}>{trend.month}</Text>
              <Text style={styles.trendCount}>
                {trend.count} {t('dreams').toLowerCase()}
              </Text>
            </View>
            <Text style={styles.trendMood}>
              {trend.dominantMood}
            </Text>
            <View style={styles.trendThemes}>
              {trend.dominantThemes.map((theme, index) => (
                <View key={index} style={styles.themeTag}>
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  progressList: {
    gap: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  progressCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  trendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendMonth: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  trendCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trendMood: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 8,
  },
  trendThemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
});