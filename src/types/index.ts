export interface DreamAnalysis {
  interpretations: Array<{
    aspect: string;
    explanations: Array<{
      explanation: string;
      confidence: number;
      isValidated: boolean;
    }>;
  }>;
  overallMood: string;
  keywords: string[];
  timestamp: number;
}

export interface Dream {
  id: string;
  date: number;
  title: string;
  content: string;
  analysis: DreamAnalysis | null;
  thumbnail: string | null;
}

export interface OpenAIResponse {
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

export interface ThemeAnalysis {
  theme: string;
  explanation: string;
  examples: string[];
  relatedThemes: string[];
  timestamp: number;
}

export interface GlobalAnalysis {
  patterns: Array<{
    title: string;
    description: string;
    frequency: number;
    relatedDreams: number[];
  }>;
  psychologicalInsights: string;
  recommendations: string[];
  emotionalThemes: {
    dominant: string;
    secondary: string[];
    evolution: string;
  };
  timestamp: number;
}