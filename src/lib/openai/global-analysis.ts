import type { Dream, GlobalAnalysis } from '../../types';
import type { OpenAIConfig } from './types';
import { makeOpenAIRequest } from './client';

export async function analyzeGlobalDreams(
  dreams: Dream[],
  { apiKey, language = 'fr' }: OpenAIConfig
): Promise<GlobalAnalysis> {
  const recentDreams = dreams
    .filter(dream => dream.content)
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

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

  const analysis = await makeOpenAIRequest<Omit<GlobalAnalysis, 'timestamp'>>(
    'chat/completions',
    apiKey,
    prompt
  );

  return {
    ...analysis,
    timestamp: Date.now()
  };
}