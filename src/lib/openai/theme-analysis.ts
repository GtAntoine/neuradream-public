import type { ThemeAnalysis } from '../../types';
import type { OpenAIConfig } from './types';
import { makeOpenAIRequest } from './client';

export async function analyzeTheme(
  theme: string,
  { apiKey, language = 'fr' }: OpenAIConfig
): Promise<ThemeAnalysis> {
  const prompt = language === 'fr'
    ? `Analysez la signification du thème "${theme}" dans les rêves. Fournissez une explication détaillée et structurée en français.
       Formatez la réponse comme un objet JSON avec la structure suivante:
      {
        "theme": "string (le thème analysé)",
        "explanation": "string (explication détaillée de la signification)",
        "examples": ["tableau d'exemples de rêves contenant ce thème"],
        "relatedThemes": ["tableau de thèmes connexes"]
      }`
    : `Analyze the meaning of the theme "${theme}" in dreams. Provide a detailed and structured explanation.
       Format the response as a JSON object with the following structure:
      {
        "theme": "string (the analyzed theme)",
        "explanation": "string (detailed explanation of the meaning)",
        "examples": ["array of example dreams containing this theme"],
        "relatedThemes": ["array of related themes"]
      }`;

  const analysis = await makeOpenAIRequest<Omit<ThemeAnalysis, 'timestamp'>>(
    'chat/completions',
    apiKey,
    prompt
  );

  return {
    ...analysis,
    theme: theme.toLowerCase(),
    timestamp: Date.now()
  };
}