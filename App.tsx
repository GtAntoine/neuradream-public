import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import type { Language } from './src/i18n/translations';
import { Home } from './src/screens/Home';
import { History } from './src/screens/History';
import { DreamDetail } from './src/screens/DreamDetail';
import { Insights } from './src/screens/Insights';
import { ThemeAnalysis } from './src/screens/ThemeAnalysis';
import { DreamDB } from './src/lib/db';
import type { Dream } from './src/types';

const Stack = createNativeStackNavigator();
const db = new DreamDB();

export default function App() {
  const [language] = useState<Language>('fr');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  React.useEffect(() => {
    const initDB = async () => {
      await db.init();
      setIsDbInitialized(true);
      const loadedDreams = await db.getAllDreams();
      setDreams(loadedDreams.sort((a, b) => b.date - a.date));
    };
    initDB();
  }, []);

  const updateDreams = (newDream: Dream) => {
    setDreams(prev => [newDream, ...prev.filter(d => d.id !== newDream.id)]);
  };

  if (!isDbInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-950">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Initialisation...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#172554',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#172554',
          },
        }}
      >
        <Stack.Screen name="Home">
          {props => (
            <Home
              {...props}
              language={language}
              dreams={dreams}
              onDreamUpdate={updateDreams}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="History">
          {props => (
            <History
              {...props}
              dreams={dreams}
              language={language}
              onDreamUpdate={updateDreams}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="DreamDetail">
          {props => (
            <DreamDetail
              {...props}
              dreams={dreams}
              language={language}
              onDreamUpdate={updateDreams}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Insights">
          {props => (
            <Insights
              {...props}
              dreams={dreams}
              language={language}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ThemeAnalysis">
          {props => (
            <ThemeAnalysis
              {...props}
              language={language}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}