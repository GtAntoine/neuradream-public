# NeuraDream Mobile Technical Documentation

## Overview

NeuraDream is a React Native application built with Expo that allows users to record, analyze, and explore their dreams using AI-powered interpretation. The app features a modern, intuitive interface with smooth animations and a dark theme optimized for nighttime use.

## Technical Stack

### Core Technologies
- React Native 
- Expo SDK 
- Expo Router
- TypeScript
- AsyncStorage for local data persistence

### Key Dependencies
- `@expo-google-fonts/inter`: Typography
- `react-native-reanimated`: Advanced animations
- `lucide-react-native`: Icon system
- `@react-native-async-storage/async-storage`: Local storage
- OpenAI API integration for dream analysis

## Architecture

### Navigation Structure
```
app/
├── _layout.tsx                 # Root layout with initialization
└── (tabs)/                    # Tab-based navigation
    ├── _layout.tsx            # Tab configuration
    ├── index.tsx              # Home screen
    ├── history.tsx            # Dream history
    ├── insights.tsx           # Analytics & insights
    └── themes.tsx             # Theme analysis
```

### Component Organization
```
components/
├── DreamForm/                 # Dream input form
├── DreamAnalysis/            # Dream analysis display
└── theme/                    # Theme-related components
    ├── ThemeDetail.tsx
    └── DeleteConfirmation.tsx
```

### Data Flow
1. User Input → DreamForm
2. OpenAI Analysis → Dream Analysis
3. Local Storage → AsyncStorage
4. State Management → React Hooks

## Key Features

### 1. Dream Recording & Analysis
- Real-time dream content input
- AI-powered analysis using OpenAI GPT-4
- DALL-E image generation for dream visualization
- Multi-aspect interpretation with confidence levels

### 2. Data Persistence
```typescript
// Storage Keys Structure
const STORAGE_KEYS = {
  DREAMS: '@NeuraDream:dreams',
  THEMES: '@NeuraDream:themes',
  GLOBAL_ANALYSIS: '@NeuraDream:globalAnalysis'
};
```

### 3. Animations & UI
- Reanimated for smooth transitions
- Custom hooks for animation control
- Responsive design with platform-specific adaptations

Example:
```typescript
const pulseStyle = useAnimatedStyle(() => ({
  transform: [{
    scale: withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    )
  }]
}));
```

### 4. Internationalization
- Built-in support for French and English
- Extensible translation system
- Type-safe translations using TypeScript

## Data Models

### Dream
```typescript
interface Dream {
  id: string;
  date: number;
  title: string;
  content: string;
  analysis: DreamAnalysis | null;
  thumbnail: string | null;
}
```

### Theme Analysis
```typescript
interface ThemeAnalysis {
  theme: string;
  explanation: string;
  examples: string[];
  relatedThemes: string[];
  timestamp: number;
}
```

## API Integration

### OpenAI Configuration
```typescript
interface OpenAIConfig {
  apiKey: string;
  language?: Language;
}
```

### Environment Variables
```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENAI_API_KEY: string;
    }
  }
}
```

## Performance Optimizations

1. **Memory Management**
   - Image caching for dream thumbnails
   - Lazy loading for theme analyses
   - Efficient list rendering with FlatList

2. **Animation Performance**
   - Hardware acceleration with native drivers
   - Optimized re-renders using useCallback and useMemo
   - Worklet-based animations with Reanimated

3. **Storage Optimization**
   - Batch updates for AsyncStorage operations
   - Compression for large text content
   - Cleanup routines for old data

## Security Considerations

1. **API Key Protection**
   - Environment variables for sensitive data
   - API key validation
   - Request rate limiting

2. **Data Privacy**
   - Local storage encryption
   - Secure API communications
   - User data isolation

## Testing Strategy

1. **Unit Tests**
   - Component rendering
   - Hook behavior
   - Utility functions

2. **Integration Tests**
   - Navigation flows
   - Data persistence
   - API integration

3. **E2E Tests**
   - User journeys
   - Cross-platform behavior
   - Performance metrics

## Development Guidelines

### Code Style
- Strict TypeScript usage
- Component-based architecture
- Custom hooks for logic reuse

### Best Practices
1. Platform-specific code:
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
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
    }),
  },
});
```

2. Error Handling:
```typescript
try {
  await analyzeTheme(theme);
} catch (error) {
  console.error('Theme analysis failed:', error);
  setError('Failed to analyze theme');
} finally {
  setIsAnalyzing(false);
}
```

3. Component Structure:
```typescript
interface Props {
  // Clear prop definitions
}

function Component({ prop1, prop2 }: Props) {
  // State management
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Event logic
  };

  // Render
  return (
    <View>
      {/* Component JSX */}
    </View>
  );
}
```

## Deployment

### Build Configuration
- Expo EAS Build system
- Platform-specific optimizations
- Asset optimization

### Release Process
1. Version bump
2. Changelog update
3. Build generation
4. Store submission

## Maintenance

### Regular Tasks
- Dependency updates
- Performance monitoring
- Error tracking
- User feedback collection

### Troubleshooting
- Common issues and solutions
- Debug procedures
- Support contact information

## Future Improvements

1. **Technical Enhancements**
   - Offline support
   - Push notifications
   - Background tasks

2. **Feature Additions**
   - Social sharing
   - Dream patterns
   - Advanced analytics

3. **Performance Optimization**
   - Image optimization
   - Cache management
   - Network handling