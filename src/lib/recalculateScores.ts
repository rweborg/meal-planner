import { prisma } from './db';
import { calculateRecipeMatchScore, FamilyPreferences } from './prompts';

interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}

/**
 * Converts raw preferences from DB into the FamilyPreferences format
 */
function buildFamilyPreferences(
  member: { id: string; name: string },
  preferences: { category: string; value: string }[]
): FamilyPreferences {
  const prefs: FamilyPreferences = {
    memberId: member.id,
    memberName: member.name,
    likes: [],
    dislikes: [],
    allergies: [],
    diets: [],
    cuisines: [],
    favoriteDishes: [],
    favoriteMeats: [],
    favoriteVeggies: [],
    willingToTry: [],
    notes: [],
  };

  for (const pref of preferences) {
    switch (pref.category) {
      case 'like':
        prefs.likes.push(pref.value);
        break;
      case 'dislike':
        prefs.dislikes.push(pref.value);
        break;
      case 'allergy':
        prefs.allergies.push(pref.value);
        break;
      case 'diet':
        prefs.diets.push(pref.value);
        break;
      case 'cuisine':
        prefs.cuisines.push(pref.value);
        break;
      case 'favorite_dish':
        prefs.favoriteDishes.push(pref.value);
        break;
      case 'favorite_meat':
        prefs.favoriteMeats.push(pref.value);
        break;
      case 'favorite_veggie':
        prefs.favoriteVeggies.push(pref.value);
        break;
      case 'willing_to_try':
        prefs.willingToTry.push(pref.value);
        break;
      case 'note':
        prefs.notes.push(pref.value);
        break;
    }
  }

  return prefs;
}

/**
 * Recalculates family match scores for all recipes based on current preferences.
 * Call this after any family member's preferences are updated.
 */
export async function recalculateAllRecipeScores(): Promise<{ updated: number }> {
  // Fetch all family members with their preferences
  const members = await prisma.familyMember.findMany({
    include: {
      preferences: true,
    },
  });

  // Build FamilyPreferences for each member
  const familyPreferences: FamilyPreferences[] = members.map((member) =>
    buildFamilyPreferences(
      { id: member.id, name: member.name },
      member.preferences
    )
  );

  // Fetch all recipes
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      cuisine: true,
      ingredients: true,
      description: true,
    },
  });

  let updated = 0;

  // Recalculate match scores for each recipe
  for (const recipe of recipes) {
    let ingredients: string[] = [];
    try {
      ingredients = JSON.parse(recipe.ingredients) as string[];
    } catch {
      ingredients = [];
    }

    const recipeData = {
      title: recipe.title,
      cuisine: recipe.cuisine,
      ingredients,
      description: recipe.description,
    };

    // Calculate match score for each family member
    const familyMatch: FamilyMatchScore[] = familyPreferences.map((member) => {
      const result = calculateRecipeMatchScore(recipeData, member);
      return {
        name: member.memberName,
        score: result.score,
        reason: result.reason,
      };
    });

    // Update the recipe with new family match scores
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        familyMatch: JSON.stringify(familyMatch),
      },
    });

    updated++;
  }

  return { updated };
}

/**
 * Recalculates family match scores for a single recipe.
 * Useful when you only need to update one recipe.
 */
export async function recalculateSingleRecipeScores(recipeId: string): Promise<FamilyMatchScore[]> {
  // Fetch all family members with their preferences
  const members = await prisma.familyMember.findMany({
    include: {
      preferences: true,
    },
  });

  // Build FamilyPreferences for each member
  const familyPreferences: FamilyPreferences[] = members.map((member) =>
    buildFamilyPreferences(
      { id: member.id, name: member.name },
      member.preferences
    )
  );

  // Fetch the recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      title: true,
      cuisine: true,
      ingredients: true,
      description: true,
    },
  });

  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeId}`);
  }

  let ingredients: string[] = [];
  try {
    ingredients = JSON.parse(recipe.ingredients) as string[];
  } catch {
    ingredients = [];
  }

  const recipeData = {
    title: recipe.title,
    cuisine: recipe.cuisine,
    ingredients,
    description: recipe.description,
  };

  // Calculate match score for each family member
  const familyMatch: FamilyMatchScore[] = familyPreferences.map((member) => {
    const result = calculateRecipeMatchScore(recipeData, member);
    return {
      name: member.memberName,
      score: result.score,
      reason: result.reason,
    };
  });

  // Update the recipe with new family match scores
  await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      familyMatch: JSON.stringify(familyMatch),
    },
  });

  return familyMatch;
}
