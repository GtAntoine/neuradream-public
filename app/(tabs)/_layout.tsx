import { Tabs } from 'expo-router';
import { Moon, History, BarChart3, BookOpen } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation('fr');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#172554',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('title'),
          tabBarIcon: ({ color, size }) => (
            <Moon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('viewHistory'),
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('insights'),
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="themes"
        options={{
          title: 'Thèmes',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}