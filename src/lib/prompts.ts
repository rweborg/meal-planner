export interface FamilyPreferences {
  memberId: string;
  memberName: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  diets: string[];
  cuisines: string[];
  favoriteDishes: string[];
  favoriteMeats: string[];
  favoriteVeggies: string[];
  willingToTry: string[];
  notes: string[];
}

export interface RatingInfo {
  recipeTitle: string;
  averageScore: number;
  ratingCount: number;
}

export interface GenerateRecipesInput {
  familyPreferences: FamilyPreferences[];
  highRatedRecipes: RatingInfo[];
  lowRatedRecipes: RatingInfo[];
  recentRecipes: string[];
  mealCount: number;
}

// Helper to aggregate preferences across all family members
function aggregateFamilyPreferences(members: FamilyPreferences[]): {
  commonCuisines: string[];
  allAllergies: string[];
  allDietaryRestrictions: string[];
  allDislikes: string[];
  popularMeats: string[];
  popularVeggies: string[];
  popularDishes: string[];
} {
  const cuisineCounts: Record<string, number> = {};
  const allergies = new Set<string>();
  const diets = new Set<string>();
  const dislikes = new Set<string>();
  const meatCounts: Record<string, number> = {};
  const veggieCounts: Record<string, number> = {};
  const dishCounts: Record<string, number> = {};

  for (const member of members) {
    // Count cuisines (popular = liked by multiple members)
    for (const cuisine of member.cuisines) {
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    }
    // Allergies must ALL be avoided
    for (const allergy of member.allergies) {
      allergies.add(allergy);
    }
    // Dietary restrictions must ALL be respected
    for (const diet of member.diets) {
      diets.add(diet);
    }
    // Dislikes should be avoided if possible
    for (const dislike of member.dislikes) {
      dislikes.add(dislike);
    }
    // Count popular meats
    for (const meat of member.favoriteMeats) {
      meatCounts[meat] = (meatCounts[meat] || 0) + 1;
    }
    // Count popular veggies
    for (const veggie of member.favoriteVeggies) {
      veggieCounts[veggie] = (veggieCounts[veggie] || 0) + 1;
    }
    // Count popular dishes
    for (const dish of member.favoriteDishes) {
      dishCounts[dish] = (dishCounts[dish] || 0) + 1;
    }
  }

  // Sort by popularity (most liked by family members)
  const sortByCount = (counts: Record<string, number>) =>
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);

  return {
    commonCuisines: sortByCount(cuisineCounts).slice(0, 5),
    allAllergies: Array.from(allergies),
    allDietaryRestrictions: Array.from(diets),
    allDislikes: Array.from(dislikes),
    popularMeats: sortByCount(meatCounts).slice(0, 5),
    popularVeggies: sortByCount(veggieCounts).slice(0, 5),
    popularDishes: sortByCount(dishCounts).slice(0, 5),
  };
}

export function buildRecipeGenerationPrompt(input: GenerateRecipesInput): string {
  const { familyPreferences, highRatedRecipes, lowRatedRecipes, recentRecipes, mealCount } = input;

  // Aggregate family-wide preferences
  const familySummary = aggregateFamilyPreferences(familyPreferences);

  let prompt = `You are a family meal planning expert. Generate ${mealCount} dinner recipes that will please the ENTIRE family based on their combined preferences and past feedback.

## FAMILY OVERVIEW (${familyPreferences.length} members)

`;

  // Add family-wide summary first
  if (familySummary.allAllergies.length > 0) {
    prompt += `### CRITICAL - ALLERGIES (NEVER include these ingredients)\n`;
    prompt += `${familySummary.allAllergies.join(', ')}\n\n`;
  }

  if (familySummary.allDietaryRestrictions.length > 0) {
    prompt += `### Dietary Restrictions (ALL recipes must comply)\n`;
    prompt += `${familySummary.allDietaryRestrictions.join(', ')}\n\n`;
  }

  if (familySummary.commonCuisines.length > 0) {
    prompt += `### Family's Favorite Cuisines (prioritize these)\n`;
    prompt += `${familySummary.commonCuisines.join(', ')}\n\n`;
  }

  if (familySummary.popularMeats.length > 0) {
    prompt += `### Popular Proteins in the Family\n`;
    prompt += `${familySummary.popularMeats.join(', ')}\n\n`;
  }

  if (familySummary.popularVeggies.length > 0) {
    prompt += `### Popular Vegetables in the Family\n`;
    prompt += `${familySummary.popularVeggies.join(', ')}\n\n`;
  }

  if (familySummary.popularDishes.length > 0) {
    prompt += `### Family's Favorite Dishes (use as inspiration)\n`;
    prompt += `${familySummary.popularDishes.join(', ')}\n\n`;
  }

  if (familySummary.allDislikes.length > 0) {
    prompt += `### Foods to Avoid (disliked by family members)\n`;
    prompt += `${familySummary.allDislikes.join(', ')}\n\n`;
  }

  // Individual member details
  prompt += `## Individual Member Preferences\n\n`;
  for (const member of familyPreferences) {
    prompt += `### ${member.memberName}\n`;
    const prefs: string[] = [];
    if (member.cuisines.length > 0) prefs.push(`Cuisines: ${member.cuisines.join(', ')}`);
    if (member.favoriteDishes.length > 0) prefs.push(`Favorite dishes: ${member.favoriteDishes.join(', ')}`);
    if (member.favoriteMeats.length > 0) prefs.push(`Proteins: ${member.favoriteMeats.join(', ')}`);
    if (member.favoriteVeggies.length > 0) prefs.push(`Veggies: ${member.favoriteVeggies.join(', ')}`);
    if (member.likes.length > 0) prefs.push(`Also likes: ${member.likes.join(', ')}`);
    if (member.willingToTry.length > 0) prefs.push(`Willing to try: ${member.willingToTry.join(', ')}`);
    if (member.dislikes.length > 0) prefs.push(`Dislikes: ${member.dislikes.join(', ')}`);
    if (member.allergies.length > 0) prefs.push(`ALLERGIES: ${member.allergies.join(', ')}`);
    if (member.diets.length > 0) prefs.push(`Diet: ${member.diets.join(', ')}`);
    if (member.notes.length > 0) prefs.push(`Notes: ${member.notes.join('; ')}`);
    prompt += prefs.join(' | ') + '\n\n';
  }

  // Rating feedback - THIS IS IMPORTANT FOR LEARNING
  if (highRatedRecipes.length > 0 || lowRatedRecipes.length > 0) {
    prompt += `## IMPORTANT: PAST RECIPE FEEDBACK\n\n`;
    prompt += `The family has rated previous recipes. Use this feedback to guide your choices:\n\n`;
  }

  if (highRatedRecipes.length > 0) {
    prompt += `### HITS - Recipes the family LOVED (create similar dishes)\n`;
    for (const recipe of highRatedRecipes) {
      prompt += `- "${recipe.recipeTitle}" - ${recipe.averageScore.toFixed(1)}/5 stars (${recipe.ratingCount} ratings)\n`;
    }
    prompt += `\n`;
  }

  if (lowRatedRecipes.length > 0) {
    prompt += `### MISSES - Recipes the family did NOT enjoy (avoid similar dishes)\n`;
    for (const recipe of lowRatedRecipes) {
      prompt += `- "${recipe.recipeTitle}" - ${recipe.averageScore.toFixed(1)}/5 stars (${recipe.ratingCount} ratings)\n`;
    }
    prompt += `\n`;
  }

  if (recentRecipes.length > 0) {
    prompt += `## Recently Made (do NOT repeat these)\n`;
    prompt += recentRecipes.join(', ') + '\n\n';
  }

  prompt += `## RECIPE SELECTION STRATEGY
1. SAFETY FIRST: Never include any allergens
2. RESPECT DIETS: All recipes must comply with dietary restrictions
3. MAXIMIZE ENJOYMENT: Choose dishes that incorporate family favorites
4. LEARN FROM FEEDBACK: Create dishes similar to high-rated recipes, avoid patterns from low-rated ones
5. VARIETY: Include different cuisines and cooking methods across the week
6. BALANCE: Try to include something each family member will love

## Response Format
Return ONLY a valid JSON array with ${mealCount} recipes. No markdown, no extra text.
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "cuisine": "Italian",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Medium",
  "ingredients": ["2 chicken breasts", "1 cup breadcrumbs", "1/2 cup parmesan cheese", "2 eggs", "1 cup marinara sauce", "1 cup shredded mozzarella", "2 medium zucchini"],
  "instructions": [
    "Preheat oven to 375°F and grease a 9x13 baking dish with butter or cooking spray. Set aside.",
    "Cook the bacon in a large skillet over medium heat for 8-10 minutes, flipping occasionally, until crispy and golden. Transfer to a paper towel-lined plate to drain, then chop into small pieces.",
    "In the same skillet, add the ground beef and diced onion. Cook over medium-high heat for 6-8 minutes, breaking up the meat with a spoon, until the beef is browned and no pink remains. Drain any excess fat."
  ],
  "tips": ["Tip 1"],
  "nutrition": {"calories": 450, "protein": "30g", "carbs": "40g", "fat": "15g"},
  "imageSearchTerm": "dish name",
  "familyMatch": [
    {"name": "Member Name", "score": 85, "reason": "Brief reason why they'd like it"}
  ]
}

IMPORTANT INSTRUCTIONS:
- Return valid JSON only. No trailing commas. No comments.
- For ingredients: EACH ingredient MUST include quantity and unit. Use standard measurements: cups, tbsp, tsp, oz, lb, g, ml, cloves, slices, etc. Examples: "2 chicken breasts", "1 cup breadcrumbs", "1/2 tsp salt", "3 cloves garlic", "1 medium onion", "2 tbsp olive oil". Never list ingredients without amounts.
- For instructions: Each step must be DETAILED and instructional. Include: exact temperatures (e.g., "375°F"), cooking times (e.g., "8-10 minutes"), heat levels (e.g., "medium-high"), techniques (e.g., "whisk until smooth", "sauté until golden"), and doneness cues (e.g., "until no pink remains", "until fragrant"). Break complex actions into separate steps. A cook should be able to follow each step without guessing. Avoid vague phrases like "cook until done"—specify what "done" looks like.
- For familyMatch: Include a score (0-100) for EACH family member indicating how likely they are to enjoy the dish based on their preferences. Consider their likes, dislikes, favorite cuisines, dietary restrictions, and notes. The reason should be a brief explanation (e.g., "loves Italian cuisine" or "contains disliked ingredient").`;

  return prompt;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}

export interface RecipeMatchInput {
  title: string;
  cuisine: string;
  ingredients: string[];
  description?: string | null;
}

/**
 * Calculates how well a recipe matches a family member's preferences (0-100).
 * Used when recalculating scores after preference updates.
 */
export function calculateRecipeMatchScore(
  recipe: RecipeMatchInput,
  member: FamilyPreferences
): { score: number; reason: string } {
  const text = [
    recipe.title,
    recipe.description ?? '',
    recipe.cuisine,
    ...recipe.ingredients,
  ]
    .join(' ')
    .toLowerCase();

  const reasons: string[] = [];

  // Critical: allergies - any match = very low score
  for (const allergy of member.allergies) {
    if (allergy && text.includes(allergy.toLowerCase())) {
      return {
        score: 10,
        reason: `Contains allergen: ${allergy}`,
      };
    }
  }

  // Dietary restrictions - significant penalty
  for (const diet of member.diets) {
    const dietLower = diet.toLowerCase();
    if (dietLower.includes('vegetarian') && /\b(beef|pork|chicken|fish|meat|bacon)\b/.test(text)) {
      return { score: 15, reason: 'Contains meat; conflicts with vegetarian diet' };
    }
    if (dietLower.includes('vegan') && /\b(beef|pork|chicken|fish|meat|bacon|egg|dairy|cheese|milk)\b/.test(text)) {
      return { score: 15, reason: 'Contains animal products; conflicts with vegan diet' };
    }
  }

  // Dislikes - subtract points
  let score = 70;
  for (const dislike of member.dislikes) {
    if (dislike && text.includes(dislike.toLowerCase())) {
      score -= 25;
      reasons.push(`contains disliked: ${dislike}`);
    }
  }

  // Positive matches
  if (member.cuisines.some((c) => text.includes(c.toLowerCase()))) {
    score += 15;
    reasons.push('matches favorite cuisine');
  }
  if (member.favoriteDishes.some((d) => text.includes(d.toLowerCase()))) {
    score += 10;
    reasons.push('similar to favorite dish');
  }
  if (member.favoriteMeats.some((m) => text.includes(m.toLowerCase()))) {
    score += 8;
    reasons.push('contains preferred protein');
  }
  if (member.favoriteVeggies.some((v) => text.includes(v.toLowerCase()))) {
    score += 5;
    reasons.push('contains preferred vegetable');
  }
  if (member.likes.some((l) => text.includes(l.toLowerCase()))) {
    score += 5;
    reasons.push('includes liked ingredient');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    reason: reasons.length > 0 ? reasons.join('; ') : 'General match to preferences',
  };
}

export interface RecipeOutput {
  title: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  nutrition: NutritionInfo;
  imageSearchTerm: string;
  familyMatch: FamilyMatchScore[];
}

export function parseRecipeResponse(response: string): RecipeOutput[] {
  // Try to extract JSON from the response
  let jsonStr = response.trim();

  // Handle markdown code blocks
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Find the array in the response
  const arrayStart = jsonStr.indexOf('[');
  const arrayEnd = jsonStr.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1) {
    jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
  }

  // Try to fix common JSON issues
  // Remove trailing commas before ] or }
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

  // Try to parse, and if it fails, try to extract individual recipes
  let recipes: RecipeOutput[];
  try {
    recipes = JSON.parse(jsonStr) as RecipeOutput[];
  } catch (parseError) {
    console.error('Initial JSON parse failed, attempting recovery...');

    // Try to find complete recipe objects and parse them individually
    const recipeMatches = jsonStr.match(/\{[^{}]*"title"[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (recipeMatches && recipeMatches.length > 0) {
      recipes = [];
      for (const match of recipeMatches) {
        try {
          const recipe = JSON.parse(match) as RecipeOutput;
          if (recipe.title && recipe.ingredients) {
            recipes.push(recipe);
          }
        } catch {
          // Skip malformed individual recipes
          console.warn('Skipping malformed recipe object');
        }
      }
      if (recipes.length === 0) {
        throw new Error('Could not parse any recipes from response');
      }
    } else {
      throw parseError;
    }
  }

  // Validate and set defaults for each recipe
  const validRecipes: RecipeOutput[] = [];
  for (const recipe of recipes) {
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      console.warn('Skipping recipe with missing required fields');
      continue;
    }

    // Set defaults for optional fields
    validRecipes.push({
      title: recipe.title,
      description: recipe.description || 'A delicious homemade dish.',
      cuisine: recipe.cuisine || 'American',
      prepTime: recipe.prepTime || 15,
      cookTime: recipe.cookTime || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'Medium',
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips || [],
      nutrition: recipe.nutrition || { calories: 400, protein: '25g', carbs: '35g', fat: '15g' },
      imageSearchTerm: recipe.imageSearchTerm || recipe.title,
      familyMatch: recipe.familyMatch || [],
    });
  }

  if (validRecipes.length === 0) {
    throw new Error('No valid recipes found in response');
  }

  return validRecipes;
}
