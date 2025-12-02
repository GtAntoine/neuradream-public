export async function makeOpenAIRequest<T>(
  endpoint: string,
  apiKey: string,
  prompt: string,
  model: string = 'gpt-4o-mini'
): Promise<T> {
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`Failed OpenAI request to ${endpoint}`);
  }

  const data = await response.json();
  const resultString = data.choices?.[0]?.message?.content;
  
  if (!resultString) {
    throw new Error('Invalid OpenAI response format');
  }

  try {
    const jsonMatch = resultString.match(/```json\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : resultString;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw response:', resultString);
    throw new Error('Failed to parse OpenAI response');
  }
}