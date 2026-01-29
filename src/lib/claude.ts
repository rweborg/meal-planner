import Anthropic from '@anthropic-ai/sdk';
import { buildRecipeGenerationPrompt, parseRecipeResponse, GenerateRecipesInput, RecipeOutput } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateRecipes(input: GenerateRecipesInput): Promise<{
  recipes: RecipeOutput[];
  promptUsed: string;
}> {
  const prompt = buildRecipeGenerationPrompt(input);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const recipes = parseRecipeResponse(responseText);

  return {
    recipes,
    promptUsed: prompt,
  };
}
