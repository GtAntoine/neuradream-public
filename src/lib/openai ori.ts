import type { Language } from '../i18n/translations';
import type { ThemeAnalysis, Dream, GlobalAnalysis } from '../types';

interface DreamAnalysisResponse {
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

export async function analyzeDream(dream: string, apiKey: string, language: Language = 'fr'): Promise<DreamAnalysisResponse> {
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
              },
              {
                "explanation": "string (explication alternative)",
                "confidence": "number (0-100)"
              },
              {
                "explanation": "string (autre interprétation possible)",
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
              },
              {
                "explanation": "string (alternative explanation)",
                "confidence": "number (0-100)"
              },
              {
                "explanation": "string (another possible interpretation)",
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze dream');
  }

  const data = await response.json();
  const analysisString = data.choices[0].message.content;
  
  try {
    // Extraire le JSON du bloc de code Markdown si présent
    const jsonMatch = analysisString.match(/```json\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : analysisString;
    
    return JSON.parse(jsonString) as DreamAnalysisResponse;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response:', analysisString);
    throw new Error('Failed to parse OpenAI response');
  }
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
      style: "vivid"
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.data[0].url;
}

export async function analyzeTheme(theme: string, apiKey: string, language: Language = 'fr'): Promise<ThemeAnalysis> {
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze theme');
  }

  const data = await response.json();
  const analysisString = data.choices[0].message.content;
  
  try {
    const jsonMatch = analysisString.match(/```json\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : analysisString;
    const analysis = JSON.parse(jsonString);
    
    return {
      ...analysis,
      theme: theme.toLowerCase(),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response:', analysisString);
    throw new Error('Failed to parse theme analysis');
  }
}

export async function analyzeGlobalDreams(dreams: Dream[], apiKey: string, language: Language = 'fr'): Promise<GlobalAnalysis> {
  const recentDreams = dreams
    .filter(dream => dream.content)
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  // Extraire les interprétations validées
  const validatedInterpretations = recentDreams.map(dream => {
    const validatedExplanations = dream.analysis?.interpretations
      .flatMap(interpretation => 
        interpretation.explanations
          .filter(exp => exp.isValidated)
          .map(exp => ({
            aspect: interpretation.aspect,
            explanation: exp.explanation
          }))
      ) || [];

    return {
      content: dream.content,
      validatedExplanations
    };
  });

  const prompt = language === 'fr'
    ? `Analysez ces ${recentDreams.length} rêves récents et trouvez des liens, motifs ou thèmes récurrents. 
       Pour chaque rêve, je vous fournis également les interprétations que l'utilisateur a validées comme pertinentes.
       Utilisez ces validations pour affiner votre analyse et la personnaliser.
       
       Rêves à analyser:
       ${validatedInterpretations.map((dream, i) => `
         ${i + 1}. Rêve: ${dream.content}
         ${dream.validatedExplanations.length > 0 
           ? `   Interprétations validées:
              ${dream.validatedExplanations.map(exp => 
                `   - ${exp.aspect}: ${exp.explanation}`
              ).join('\n')}`
           : '   Aucune interprétation validée'
         }
       `).join('\n\n')}

       Formatez la réponse comme un objet JSON avec la structure suivante:
      {
        "patterns": [
          {
            "title": "string (titre du motif identifié)",
            "description": "string (description détaillée basée sur les interprétations validées)",
            "frequency": "number (pourcentage d'occurrence)",
            "relatedDreams": [number] (indices des rêves concernés, 1-based)
          }
        ],
        "psychologicalInsights": "string (insights psychologiques globaux, en tenant compte des validations)",
        "recommendations": [
          "string (recommandations ou suggestions personnalisées)"
        ],
        "emotionalThemes": {
          "dominant": "string (émotion dominante)",
          "secondary": ["string (émotions secondaires)"],
          "evolution": "string (évolution émotionnelle observée)"
        }
      }`
    : `Analyze these ${recentDreams.length} recent dreams and find connections, patterns, or recurring themes.
       For each dream, I'm also providing the interpretations that the user has validated as relevant.
       Use these validations to refine your analysis and personalize it.
       
       Dreams to analyze:
       ${validatedInterpretations.map((dream, i) => `
         ${i + 1}. Dream: ${dream.content}
         ${dream.validatedExplanations.length > 0 
           ? `   Validated interpretations:
              ${dream.validatedExplanations.map(exp => 
                `   - ${exp.aspect}: ${exp.explanation}`
              ).join('\n')}`
           : '   No validated interpretations'
         }
       `).join('\n\n')}

       Format the response as a JSON object with the following structure:
      {
        "patterns": [
          {
            "title": "string (identified pattern title)",
            "description": "string (detailed description based on validated interpretations)",
            "frequency": "number (occurrence percentage)",
            "relatedDreams": [number] (indices of related dreams, 1-based)
          }
        ],
        "psychologicalInsights": "string (global psychological insights, taking validations into account)",
        "recommendations": [
          "string (personalized recommendations or suggestions)"
        ],
        "emotionalThemes": {
          "dominant": "string (dominant emotion)",
          "secondary": ["string (secondary emotions)"],
          "evolution": "string (observed emotional evolution)"
        }
      }`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze dreams globally');
  }

  const data = await response.json();
  const analysisString = data.choices[0].message.content;
  
  try {
    const jsonMatch = analysisString.match(/```json\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : analysisString;
    const analysis = JSON.parse(jsonString);
    
    return {
      ...analysis,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response:', analysisString);
    throw new Error('Failed to parse global analysis');
  }
}