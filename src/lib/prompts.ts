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
    prompt += `### ⚠️ CRITICAL - FOODS TO AVOID (disliked by family members)\n`;
    prompt += `NEVER include these ingredients in recipes: ${familySummary.allDislikes.join(', ')}\n`;
    prompt += `If a recipe contains ANY of these disliked ingredients, that family member will give it a very low score (0-20).\n`;
    prompt += `Prioritize recipes that completely avoid these ingredients.\n\n`;
  }

  // Individual member details - emphasize dislikes and allergies
  prompt += `## Individual Member Preferences\n\n`;
  for (const member of familyPreferences) {
    prompt += `### ${member.memberName}\n`;
    const prefs: string[] = [];
    
    // CRITICAL: Allergies and dislikes first
    if (member.allergies.length > 0) prefs.push(`🚫 ALLERGIES (NEVER include): ${member.allergies.join(', ')}`);
    if (member.dislikes.length > 0) prefs.push(`⚠️ DISLIKES (avoid - causes 0-20 score): ${member.dislikes.join(', ')}`);
    
    // Then positive preferences
    if (member.cuisines.length > 0) prefs.push(`Cuisines: ${member.cuisines.join(', ')}`);
    if (member.favoriteDishes.length > 0) prefs.push(`Favorite dishes: ${member.favoriteDishes.join(', ')}`);
    if (member.favoriteMeats.length > 0) prefs.push(`Proteins: ${member.favoriteMeats.join(', ')}`);
    if (member.favoriteVeggies.length > 0) prefs.push(`Veggies: ${member.favoriteVeggies.join(', ')}`);
    if (member.likes.length > 0) prefs.push(`Also likes: ${member.likes.join(', ')}`);
    if (member.willingToTry.length > 0) prefs.push(`Willing to try: ${member.willingToTry.join(', ')}`);
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

  prompt += `## RECIPE SELECTION STRATEGY (in priority order)
1. SAFETY FIRST: Never include any allergens - recipes with allergens get score 0
2. AVOID DISLIKES: Never include disliked ingredients - recipes with dislikes get score 0-20 for that member
   - If a member dislikes "steak", do NOT create steak recipes
   - If a member dislikes "mushrooms", do NOT include mushrooms in recipes
   - Dislikes override all positive preferences - a recipe with a disliked ingredient will score 0-20 even if it matches favorite cuisine
3. RESPECT DIETS: All recipes must comply with dietary restrictions
4. MAXIMIZE ENJOYMENT: Choose dishes that incorporate family favorites (cuisines, proteins, vegetables)
5. LEARN FROM FEEDBACK: Create dishes similar to high-rated recipes, avoid patterns from low-rated ones
6. VARIETY: Include different cuisines and cooking methods across the week
7. BALANCE: Try to include something each family member will love, but NEVER at the expense of including their dislikes

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
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "tips": ["Tip 1"],
  "nutrition": {"calories": 450, "protein": "30g", "carbs": "40g", "fat": "15g"},
  "imageSearchTerm": "specific dish name for image (e.g. stuffed shells, not Italian chicken)",
  "familyMatch": [
    {"name": "Member Name", "score": 85, "reason": "Brief reason why they'd like it"}
  ]
}

IMPORTANT INSTRUCTIONS:
- Return valid JSON only. No trailing commas. No comments.
- For imageSearchTerm: Use the specific dish type that describes what the food looks like (e.g. "stuffed shells", "tacos", "stir fry"), not the full recipe title or cuisine. This ensures the recipe image matches the actual dish.
- For familyMatch: Include a score (0-100) for EACH family member indicating how likely they are to enjoy the dish based on their preferences.

CRITICAL SCORING RULES FOR familyMatch (in priority order):
1. ALLERGIES = ZERO: If a recipe contains an allergen, that member's score MUST be 0. No exceptions.
2. DISLIKES = SEVERE PENALTY (0-20 MAX): If a recipe contains ANY ingredient a member dislikes:
   - Their score MUST be 0-20 (typically 15-20 for one dislike, lower for multiple)
   - Dislikes OVERRIDE all positive preferences
   - Even if recipe matches favorite cuisine AND favorite protein, if it contains a disliked ingredient, score is 0-20
   - Example: If "John" dislikes "steak", a "Grilled Steak with Italian Herbs" recipe should give John score = 15-20 with reason "Contains disliked: steak; Favorite cuisine: Italian"
3. FAVORITE CUISINE: If recipe matches their favorite cuisine AND has no dislikes, add +30 points.
4. FAVORITE PROTEIN/MEAT: If recipe contains their favorite meat/protein AND has no dislikes, add +20 points.
5. FAVORITE DISH: If recipe matches their favorite dish AND has no dislikes, add +25 points.
6. FAVORITE VEGETABLE: If recipe contains their favorite vegetable AND has no dislikes, add +15 points.
7. LIKED INGREDIENTS: If recipe contains ingredients they like AND has no dislikes, add +10 per match (max +30).
8. BASE SCORE: Start at 50 (neutral), then add/subtract based on matches. BUT if dislikes are present, score is capped at 0-20.

Example scoring:
- Recipe with steak for member who dislikes steak: score = 15-20, reason = "Contains disliked: steak" (even if it's their favorite cuisine)
- Recipe with chicken + Italian cuisine for member who loves both: score = 100, reason = "Favorite cuisine: Italian; Favorite protein: chicken"
- Recipe with mushrooms for member who dislikes mushrooms but loves Italian: score = 15-20, reason = "Contains disliked: mushrooms; Favorite cuisine: Italian"
- Recipe with no matches: score = 50, reason = "Neutral match"

The reason should clearly state WHY the score is high or low (e.g., "Contains disliked: steak" or "Favorite cuisine: Italian; Favorite protein: chicken").`;

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

/**
 * Deterministic function to calculate recipe match score for a family member
 * based on actual ingredient and preference matching.
 * 
 * IMPORTANT: Dietary restrictions and dislikes override all positive preferences.
 * If a recipe violates a dietary restriction or contains a disliked ingredient,
 * the score is capped at 0-20 regardless of how many positive matches it has.
 * 
 * Scoring rules (in priority order):
 * 1. Contains allergy: 0 (absolute disqualifier)
 * 2. Violates dietary restriction(s): 0-20 (severe penalty, overrides positives)
 *    - Examples: "no red meat" → flags beef, pork, lamb, etc.
 *    - "vegetarian" → flags all meat
 *    - "vegan" → flags all animal products
 *    - One violation: 15
 *    - Multiple violations: 0-15 (5 points deducted per additional violation)
 * 3. Contains disliked ingredient(s): 0-20 (severe penalty, overrides positives)
 *    - Combined with diet violations for total violation count
 *    - One violation: 15
 *    - Multiple violations: 0-15 (5 points deducted per additional violation)
 * 4. Matches favorite cuisine: +30 (only if no violations)
 * 5. Matches favorite dish: +25 (only if no violations)
 * 6. Contains favorite meat/protein: +20 (only if no violations)
 * 7. Contains favorite vegetable: +15 (only if no violations)
 * 8. Contains liked ingredient: +10 per match, max +30 (only if no violations)
 * 9. Willing to try: +5 (only if no violations)
 * 10. Base score: 50 (neutral, if no matches)
 */
export function calculateRecipeMatchScore(
  recipe: { title: string; cuisine: string; ingredients: string[]; description?: string },
  member: FamilyPreferences
): { score: number; reason: string } {
  let score = 50; // Base neutral score
  const reasons: string[] = [];
  const ingredientText = recipe.ingredients.join(' ').toLowerCase();
  const titleText = recipe.title.toLowerCase();
  const descriptionText = recipe.description?.toLowerCase() || '';
  const allText = `${titleText} ${descriptionText} ${ingredientText}`;

  // Check for allergies FIRST (absolute disqualifier)
  for (const allergy of member.allergies) {
    if (matchesIngredient(allText, allergy)) {
      return { score: 0, reason: `Contains allergen: ${allergy}` };
    }
  }

  // Check for dietary restrictions SECOND - treat as severe penalty like dislikes
  const dietViolations = checkDietaryRestrictions(allText, member.diets);
  const hasDietViolations = dietViolations.violatedDiets.length > 0;
  
  // Check for dislikes THIRD - this is critical and should override positives
  const dislikedMatches: string[] = [];
  for (const dislike of member.dislikes) {
    if (matchesIngredient(allText, dislike)) {
      dislikedMatches.push(dislike);
    }
  }
  
  // If dietary restrictions are violated OR dislikes are found, score is severely capped
  const hasViolations = hasDietViolations || dislikedMatches.length > 0;
  
  if (hasViolations) {
    // Count total violations (diet violations + dislikes)
    const totalViolations = dietViolations.violatedDiets.length + dislikedMatches.length;
    
    // Multiple violations = worse score
    // Base score: 15 for one violation, decreasing by 5 for each additional violation
    const baseViolationScore = Math.max(0, 15 - (totalViolations - 1) * 5);
    score = baseViolationScore; // Override any positive scoring
    
    // Add reasons for violations
    if (hasDietViolations) {
      reasons.push(`Violates dietary restriction: ${dietViolations.violatedDiets.join(', ')}`);
    }
    if (dislikedMatches.length > 0) {
      reasons.push(`Contains disliked: ${dislikedMatches.join(', ')}`);
    }
    
    // Still check positives for the reason, but they don't affect score
    // This helps explain why the score is low despite having some positives
  }

  // Track if we have violations - if so, positives don't increase score but are noted
  const hasDislikes = hasViolations;
  
  // Check for favorite cuisine match
  let hasFavoriteCuisine = false;
  for (const cuisine of member.cuisines) {
    if (recipe.cuisine.toLowerCase() === cuisine.toLowerCase()) {
      if (!hasDislikes) score += 30;
      reasons.push(`Favorite cuisine: ${cuisine}`);
      hasFavoriteCuisine = true;
      break; // Only count once
    }
  }

  // Check for favorite dish match
  let hasFavoriteDish = false;
  for (const dish of member.favoriteDishes) {
    if (matchesIngredient(allText, dish)) {
      if (!hasDislikes) score += 25;
      reasons.push(`Favorite dish: ${dish}`);
      hasFavoriteDish = true;
      break; // Only count once
    }
  }

  // Check for favorite meats/proteins
  let meatMatches = 0;
  let hasFavoriteMeat = false;
  for (const meat of member.favoriteMeats) {
    if (matchesIngredient(allText, meat)) {
      meatMatches++;
      if (!hasDislikes) score += 20;
      reasons.push(`Favorite protein: ${meat}`);
      hasFavoriteMeat = true;
      break; // Only count once
    }
  }

  // Check for favorite vegetables
  let veggieMatches = 0;
  let hasFavoriteVeggie = false;
  for (const veggie of member.favoriteVeggies) {
    if (matchesIngredient(allText, veggie)) {
      veggieMatches++;
      if (!hasDislikes) score += 15;
      reasons.push(`Favorite vegetable: ${veggie}`);
      hasFavoriteVeggie = true;
      break; // Only count once per veggie type
    }
  }

  // Check for general likes (smaller bonus, capped)
  let likeMatches = 0;
  for (const like of member.likes) {
    if (matchesIngredient(allText, like)) {
      likeMatches++;
      if (!hasDislikes && likeMatches <= 3) {
        score += 10; // Max +30 from likes
      }
    }
  }
  if (likeMatches > 0) {
    reasons.push(`Contains liked ingredients (${Math.min(likeMatches, 3)} matches)`);
  }

  // Check for willing to try (small bonus)
  let hasWillingToTry = false;
  for (const item of member.willingToTry) {
    if (matchesIngredient(allText, item)) {
      if (!hasDislikes) score += 5;
      reasons.push(`Willing to try: ${item}`);
      hasWillingToTry = true;
      break;
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Generate reason string - ALWAYS prioritize violations (diet restrictions and dislikes) in the reason
  let reason = '';
  if (reasons.length > 0) {
    // Find violation reasons (diet restrictions and dislikes) - these are most important
    const dietViolationReason = reasons.find(r => r.startsWith('Violates dietary restriction:'));
    const dislikeReason = reasons.find(r => r.startsWith('Contains disliked:'));
    const otherReasons = reasons.filter(r => 
      !r.startsWith('Contains disliked:') && !r.startsWith('Violates dietary restriction:')
    );
    
    // Combine violation reasons
    const violationReasons: string[] = [];
    if (dietViolationReason) violationReasons.push(dietViolationReason);
    if (dislikeReason) violationReasons.push(dislikeReason);
    
    if (violationReasons.length > 0) {
      // Violations are most important - mention them first
      if (otherReasons.length > 0) {
        // Show violations + one positive to explain why score isn't 0
        reason = `${violationReasons.join('; ')}; ${otherReasons[0]}`;
      } else {
        reason = violationReasons.join('; ');
      }
    } else {
      // No violations, show top 2 positive reasons
      reason = otherReasons.slice(0, 2).join('; ');
    }
  } else {
    reason = 'Neutral match - no strong preferences matched';
  }

  return { score: Math.round(score), reason };
}

/**
 * Maps dietary restrictions to ingredients they prohibit
 * Returns an array of ingredient keywords that violate the dietary restriction
 */
function getProhibitedIngredientsForDiet(diet: string): string[] {
  const normalizedDiet = diet.toLowerCase().trim();
  
  // Red meat restrictions
  if (normalizedDiet.includes('no red meat') || normalizedDiet.includes('no redmeat') || 
      normalizedDiet.includes('no beef') || normalizedDiet.includes('no pork')) {
    return ['beef', 'pork', 'lamb', 'veal', 'venison', 'steak', 'ground beef', 'ground pork', 
            'ribeye', 'sirloin', 'brisket', 'bacon', 'ham', 'sausage', 'chorizo'];
  }
  
  // Vegetarian (no meat, but may include dairy/eggs)
  if (normalizedDiet.includes('vegetarian')) {
    return ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'veal', 'venison', 'duck', 'goose',
            'fish', 'seafood', 'shrimp', 'crab', 'lobster', 'tuna', 'salmon', 'meat', 
            'steak', 'bacon', 'ham', 'sausage', 'chorizo', 'ground beef', 'ground pork',
            'ground turkey', 'ground chicken'];
  }
  
  // Vegan (no animal products)
  if (normalizedDiet.includes('vegan')) {
    return ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'veal', 'venison', 'duck', 'goose',
            'fish', 'seafood', 'shrimp', 'crab', 'lobster', 'tuna', 'salmon', 'meat',
            'milk', 'cheese', 'butter', 'cream', 'yogurt', 'eggs', 'egg', 'honey',
            'gelatin', 'whey', 'casein'];
  }
  
  // Pescatarian (no meat, but fish/seafood is OK)
  if (normalizedDiet.includes('pescatarian')) {
    return ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'veal', 'venison', 'duck', 'goose',
            'meat', 'steak', 'bacon', 'ham', 'sausage', 'chorizo', 'ground beef', 
            'ground pork', 'ground turkey', 'ground chicken'];
  }
  
  // No pork specifically
  if (normalizedDiet.includes('no pork') || normalizedDiet.includes('no pig')) {
    return ['pork', 'bacon', 'ham', 'sausage', 'chorizo', 'prosciutto', 'pancetta', 
            'ground pork', 'pork chop', 'pork tenderloin'];
  }
  
  // No beef specifically
  if (normalizedDiet.includes('no beef') || normalizedDiet.includes('no cow')) {
    return ['beef', 'steak', 'ground beef', 'ribeye', 'sirloin', 'brisket', 'roast beef'];
  }
  
  // No chicken
  if (normalizedDiet.includes('no chicken') || normalizedDiet.includes('no poultry')) {
    return ['chicken', 'turkey', 'duck', 'goose', 'poultry', 'ground turkey', 'ground chicken'];
  }
  
  // Dairy-free / Lactose-free
  if (normalizedDiet.includes('dairy-free') || normalizedDiet.includes('lactose-free') ||
      normalizedDiet.includes('no dairy') || normalizedDiet.includes('no lactose')) {
    return ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'whey', 'casein',
            'dairy', 'lactose'];
  }
  
  // Gluten-free (check for obvious gluten sources, but be careful - many recipes can be gluten-free)
  if (normalizedDiet.includes('gluten-free') || normalizedDiet.includes('no gluten') ||
      normalizedDiet.includes('celiac')) {
    // Only flag obvious gluten sources if they're not specified as gluten-free alternatives
    // This is a conservative approach - we'll flag wheat, bread, pasta, etc.
    // but the user should verify if alternatives are used
    return ['wheat', 'bread', 'pasta', 'flour', 'gluten'];
  }
  
  // Return empty array if no match - the diet restriction might be custom
  return [];
}

/**
 * Check if a recipe violates any dietary restrictions
 * Returns an array of violated restrictions
 */
function checkDietaryRestrictions(
  allText: string,
  diets: string[]
): { violatedDiets: string[]; violatedIngredients: string[] } {
  const violatedDiets: string[] = [];
  const violatedIngredients: string[] = [];
  
  for (const diet of diets) {
    const prohibitedIngredients = getProhibitedIngredientsForDiet(diet);
    
    // Check if any prohibited ingredient is present
    for (const ingredient of prohibitedIngredients) {
      if (matchesIngredient(allText, ingredient)) {
        if (!violatedDiets.includes(diet)) {
          violatedDiets.push(diet);
        }
        if (!violatedIngredients.includes(ingredient)) {
          violatedIngredients.push(ingredient);
        }
      }
    }
  }
  
  return { violatedDiets, violatedIngredients };
}

/**
 * Helper function to check if an ingredient matches in text
 * Uses fuzzy matching to handle variations (e.g., "chicken breast" matches "chicken")
 */
function matchesIngredient(text: string, ingredient: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedIngredient = ingredient.toLowerCase();

  // Exact match
  if (normalizedText.includes(normalizedIngredient)) {
    return true;
  }

  // Check for word boundaries (e.g., "chicken" matches "chicken breast" but not "chickens")
  const words = normalizedIngredient.split(/\s+/);
  if (words.length === 1) {
    // Single word - check for word boundary
    const regex = new RegExp(`\\b${words[0]}\\b`, 'i');
    return regex.test(normalizedText);
  } else {
    // Multi-word - check if all words appear in order
    const regex = new RegExp(words.join('.*'), 'i');
    return regex.test(normalizedText);
  }
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

/**
 * Validates and recalculates familyMatch scores for recipes using deterministic logic.
 * This ensures scores accurately reflect actual ingredient/preference matching,
 * especially for dislikes which should result in very low scores.
 */
export function validateAndRecalculateScores(
  recipes: RecipeOutput[],
  familyPreferences: FamilyPreferences[]
): RecipeOutput[] {
  return recipes.map((recipe) => {
    // Recalculate scores for each family member
    const validatedScores: FamilyMatchScore[] = familyPreferences.map((member) => {
      const calculated = calculateRecipeMatchScore(
        {
          title: recipe.title,
          cuisine: recipe.cuisine,
          ingredients: recipe.ingredients,
          description: recipe.description,
        },
        member
      );

      // Use calculated score, but preserve AI's reason if it's similar
      // This allows AI to provide context while ensuring accurate scores
      let reason = calculated.reason;
      
      // Check if AI provided a score for this member
      const aiScore = recipe.familyMatch.find((m) => m.name === member.memberName);
      if (aiScore) {
        // If AI score is way off (more than 30 points difference), use our calculated score
        // Otherwise, trust AI's reason but use our score
        if (Math.abs(aiScore.score - calculated.score) > 30) {
          // AI was way off, use our reason
          reason = calculated.reason;
        } else {
          // AI was close, use their reason (might have better context)
          reason = aiScore.reason;
        }
      }

      return {
        name: member.memberName,
        score: calculated.score,
        reason,
      };
    });

    return {
      ...recipe,
      familyMatch: validatedScores,
    };
  });
}
