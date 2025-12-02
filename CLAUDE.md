# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeuraDream is a React Native mobile application built with Expo that allows users to record, analyze, and explore their dreams using AI-powered interpretation. The app uses OpenAI's GPT-4 for dream analysis and DALL-E 3 for generating dream visualizations.

## Development Commands

```bash
# Start the development server
npm start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator
npm run web        # Web browser
```

## Architecture

### Navigation Structure

The app uses Expo Router with a tab-based navigation structure:

- `app/_layout.tsx` - Root layout with initialization logic
- `app/(tabs)/` - Tab-based navigation container
  - `index.tsx` - Home screen (dream input and analysis)
  - `history.tsx` - Dream history list
  - `insights.tsx` - Analytics and insights dashboard
  - `themes.tsx` - Theme analysis exploration

### Core Data Flow

1. **Dream Input** → User enters dream content via `DreamForm`
2. **AI Analysis** → Dream sent to OpenAI API (`src/lib/openai/dream-analysis.ts`)
3. **Image Generation** → DALL-E creates visualization based on generated prompt
4. **Persistence** → Data saved to IndexedDB via `DreamDB` singleton (`src/lib/db.ts`)
5. **Display** → Analysis rendered in `DreamAnalysis` component with interactive elements

### Database Layer

`DreamDB` class (`src/lib/db.ts`) provides a singleton wrapper around IndexedDB with three object stores:

- `dreams` - Dream entries with content, analysis, and thumbnails
- `themes` - Theme-specific analyses (keyed by theme name)
- `globalAnalysis` - Aggregate analysis across all dreams

Important: Always call `await db.init()` before any operations. The class ensures initialization happens only once via `initPromise`.

### OpenAI Integration

Located in `src/lib/openai/`:

- `dream-analysis.ts` - Individual dream analysis and DALL-E image generation
- `theme-analysis.ts` - Deep-dive analysis of specific recurring themes
- `global-analysis.ts` - Aggregate analysis across multiple dreams
- `client.ts` - Shared request logic
- `types.ts` - TypeScript interfaces for API responses

All OpenAI functions require an API key (from `EXPO_PUBLIC_OPENAI_API_KEY`) and optional language parameter (`'fr'` or `'en'`).

### Analytics

`src/lib/analytics.ts` provides client-side analytics computed from dream data:

- Mood distribution across dreams
- Common themes extraction (from keywords)
- Time-based patterns
- Monthly trends with dominant moods/themes
- Confidence scoring and validation tracking

### Type System

Core types in `src/types/index.ts`:

```typescript
Dream {
  id: string;
  date: number;  // Unix timestamp
  title: string;
  content: string;
  analysis: DreamAnalysis | null;
  thumbnail: string | null;  // Base64 data URL from DALL-E
}

DreamAnalysis {
  interpretations: Array<{
    aspect: string;
    explanations: Array<{
      explanation: string;
      confidence: number;  // 0-100
      isValidated: boolean;  // User can validate interpretations
    }>;
  }>;
  overallMood: string;
  keywords: string[];
  timestamp: number;
}

ThemeAnalysis {
  theme: string;  // Used as primary key (lowercase)
  explanation: string;
  examples: string[];
  relatedThemes: string[];
  timestamp: number;
}
```

### State Management

App-level state is managed in `App.tsx` using React hooks:

- Dreams list maintained at root level
- Passed down to screens via navigation props
- `updateDreams` callback propagates changes back up
- Database initialization blocks rendering until complete

### Internationalization

Bilingual support (French/English) via `src/i18n/translations.ts`:

- Custom `useTranslation` hook in `src/hooks/useTranslation.ts`
- Language prop threaded through navigation
- All OpenAI prompts adapted based on language setting

### Component Structure

Components in `src/components/`:

- `DreamForm.tsx` - Dream input interface with validation
- `DreamAnalysis.tsx` - Interactive display of AI analysis results with validation toggles

### Platform Considerations

This is a React Native app using Expo:

- Uses `react-native-reanimated` for animations (requires worklet syntax)
- Platform-specific styling via `Platform.select()`
- Web support via IndexedDB (note: this is a web-only storage solution, not compatible with native mobile)
- AsyncStorage imported but primary persistence is IndexedDB

### Critical Implementation Notes

1. **Image Generation**: DALL-E returns base64 images via `response_format: "b64_json"` which are stored as data URLs
2. **Theme Storage**: Theme names are normalized to lowercase before storage/retrieval for consistency
3. **Confidence System**: Each interpretation has multiple explanations ranked by confidence (0-100), user can validate them
4. **Singleton Pattern**: `DreamDB` uses singleton pattern to prevent multiple instances
5. **Analysis Timestamps**: All analyses store timestamps for cache invalidation and historical tracking

### Environment Variables

Required in `.env`:

```
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

Note: Expo public variables are prefixed with `EXPO_PUBLIC_` and are embedded in the client bundle.
