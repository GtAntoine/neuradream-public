import type { Language } from '../../i18n/translations';

export interface DreamAnalysisResponse {
  title: string;
  imagePrompt: string;
  interpretations: Array<{
    aspect: string;
    explanations: Array<{
      explanation: string;
      confidence: number;
    }>;
  }>;
  overallMood: string;
  keywords: string[];
}

export interface OpenAIConfig {
  apiKey: string;
  language?: Language;
}