import type { Dream } from '../../types';
import type { DreamAnalysisResponse, OpenAIConfig } from './types';
import { makeOpenAIRequest } from './client';

export async function analyzeDream(
  dream: string,
  { apiKey, language = 'fr' }: OpenAIConfig
): Promise<DreamAnalysisResponse> {
  const prompt = language === 'fr'
    ? `Analysez ce rêve et fournissez une interprétation structurée en français. Le titre doit être court et évocateur. 
       Pour chaque aspect du rêve, fournissez 2 à 3 explications différentes et complémentaires, classées par niveau de confiance.
       Créez aussi un prompt en anglais pour DALL-E qui générera une image artistique représentant ce rêve.
       Le prompt pour l'image doit être évocateur, poétique et détaillé, en mettant l'accent sur l'ambiance et les éléments visuels clés.
       Formatez la réponse comme un objet JSON avec la structure suivante:
      {
        "title": "string (un titre court et évocateur pour ce rêve)",
        "imagePrompt": "string (prompt en anglais pour DALL-E, détaillé et artistique)",
        "interpretations": [
          {
            "aspect": "string (l'aspect du rêve analysé)",
            "explanations": [
              {
                "explanation": "string (explication détaillée)",
                "confidence": "number (0-100)"
              }
            ]
          }
        ],
        "overallMood": "string (l'ambiance/ton général du rêve)",
        "keywords": ["tableau des thèmes/symboles clés"]
      }

      IMPORTANT: Pour chaque aspect du rêve, fournissez au moins 2 explications différentes pour offrir des perspectives variées.

      Rêve: ${dream}`
    : `Analyze this dream and provide a structured interpretation. The title should be short and evocative.
       For each aspect of the dream, provide 2 to 3 different and complementary explanations, ranked by confidence level.
       Also create an English prompt for DALL-E to generate an artistic image representing this dream.
       The image prompt should be evocative, poetic, and detailed, emphasizing the mood and key visual elements.
       Format the response as a JSON object with the following structure:
      {
        "title": "string (a short and evocative title for this dream)",
        "imagePrompt": "string (detailed and artistic English prompt for DALL-E)",
        "interpretations": [
          {
            "aspect": "string (the aspect of the dream being analyzed)",
            "explanations": [
              {
                "explanation": "string (detailed explanation)",
                "confidence": "number (0-100)"
              }
            ]
          }
        ],
        "overallMood": "string (general mood/tone of the dream)",
        "keywords": ["array of key themes/symbols"]
      }

      IMPORTANT: For each aspect of the dream, provide at least 2 different explanations to offer varied perspectives.

      Dream: ${dream}`;

  return makeOpenAIRequest<DreamAnalysisResponse>('chat/completions', apiKey, prompt);
}

export async function generateDreamImage(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      response_format: "b64_json"
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return `data:image/png;base64,${data.data[0].b64_json}`;
}