import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RecipeVariationRequest {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cuisine: string;
}

interface RecipeVariation {
  proteinSubstitution: string;
  modifiedTitle: string;
  modifiedIngredients: string[];
  modifiedInstructions: string[];
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecipeVariationRequest = await request.json();
    const { title, description, ingredients, instructions, cuisine } = body;

    // Build prompt for AI to generate recipe variations with protein substitutions
    const prompt = `You are a culinary expert. Given the following recipe, generate 3-5 variations by substituting different proteins. Focus on protein substitutions that work well with the recipe's cooking method and cuisine style.

Original Recipe:
Title: ${title}
Description: ${description}
Cuisine: ${cuisine}
Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Instructions:
${instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Generate 3-5 recipe variations, each with a different protein substitution. For each variation, provide:
1. The protein substitution (e.g., "chicken instead of beef", "tofu instead of pork")
2. A modified title that reflects the protein change
3. Modified ingredients list (only change the protein-related ingredients, keep everything else the same)
4. Modified instructions (only adjust steps that specifically mention the protein, keep cooking times and methods similar)
5. Brief notes about why this substitution works and any cooking tips

Return your response as a JSON array with this exact structure:
[
  {
    "proteinSubstitution": "chicken instead of beef",
    "modifiedTitle": "Chicken [Original Title]",
    "modifiedIngredients": ["list", "of", "modified", "ingredients"],
    "modifiedInstructions": ["list", "of", "modified", "instructions"],
    "notes": "Brief explanation of why this works and any tips"
  },
  ...
]

IMPORTANT:
- Return ONLY valid JSON, no markdown, no code blocks, no extra text
- Keep the same number of ingredients and instructions
- Only modify protein-related items, keep all other ingredients and steps the same
- Make sure the cooking method and times remain appropriate for the substituted protein
- Provide practical, realistic substitutions that maintain the dish's character`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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

    // Parse the JSON response
    let variations: RecipeVariation[] = [];
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        variations = JSON.parse(jsonMatch[0]);
      } else {
        variations = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!Array.isArray(variations) || variations.length === 0) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ variations });
  } catch (error) {
    console.error('Error generating recipe variations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe variations' },
      { status: 500 }
    );
  }
}
