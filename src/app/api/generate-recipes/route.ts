import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateRecipes } from '@/lib/claude';
import { FamilyPreferences, RatingInfo, validateAndRecalculateScores } from '@/lib/prompts';
import { getFoodImageUrl, getCuisineFallbackImage } from '@/lib/images';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mealCount = 7 } = body;

  // Get all family members with preferences
  const members = await prisma.familyMember.findMany({
    include: {
      preferences: true,
    },
  });

  // Build family preferences for AI
  const familyPreferences: FamilyPreferences[] = members.map((member) => ({
    memberId: member.id,
    memberName: member.name,
    likes: member.preferences.filter((p) => p.category === 'like').map((p) => p.value),
    dislikes: member.preferences.filter((p) => p.category === 'dislike').map((p) => p.value),
    allergies: member.preferences.filter((p) => p.category === 'allergy').map((p) => p.value),
    diets: member.preferences.filter((p) => p.category === 'diet').map((p) => p.value),
    cuisines: member.preferences.filter((p) => p.category === 'cuisine').map((p) => p.value),
    favoriteDishes: member.preferences.filter((p) => p.category === 'favorite_dish').map((p) => p.value),
    favoriteMeats: member.preferences.filter((p) => p.category === 'favorite_meat').map((p) => p.value),
    favoriteVeggies: member.preferences.filter((p) => p.category === 'favorite_veggie').map((p) => p.value),
    willingToTry: member.preferences.filter((p) => p.category === 'willing_to_try').map((p) => p.value),
    notes: member.preferences.filter((p) => p.category === 'note').map((p) => p.value),
  }));

  // Get rated recipes for feedback (include family member info)
  const recipesWithRatings = await prisma.recipe.findMany({
    include: {
      ratings: {
        include: {
          familyMember: true,
        },
      },
    },
  });

  const ratingInfos: { recipe: string; avgScore: number; count: number; raters: string[] }[] = [];
  for (const recipe of recipesWithRatings) {
    if (recipe.ratings.length > 0) {
      const avgScore =
        recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length;
      const raters = recipe.ratings.map(r => `${r.familyMember.name}: ${r.score}/5`);
      ratingInfos.push({
        recipe: recipe.title,
        avgScore,
        count: recipe.ratings.length,
        raters,
      });
    }
  }

  const highRatedRecipes: RatingInfo[] = ratingInfos
    .filter((r) => r.avgScore >= 4)
    .map((r) => ({
      recipeTitle: r.recipe,
      averageScore: r.avgScore,
      ratingCount: r.count,
    }));

  const lowRatedRecipes: RatingInfo[] = ratingInfos
    .filter((r) => r.avgScore <= 2)
    .map((r) => ({
      recipeTitle: r.recipe,
      averageScore: r.avgScore,
      ratingCount: r.count,
    }));

  // Get recent recipes to avoid repetition
  const recentMealPlans = await prisma.mealPlan.findMany({
    include: {
      recipes: {
        include: {
          recipe: true,
        },
      },
    },
    orderBy: {
      weekStart: 'desc',
    },
    take: 2,
  });

  const recentRecipes = recentMealPlans.flatMap((plan) =>
    plan.recipes.map((r) => r.recipe.title)
  );

  try {
    const { recipes, promptUsed } = await generateRecipes({
      familyPreferences,
      highRatedRecipes,
      lowRatedRecipes,
      recentRecipes,
      mealCount,
    });

    // Validate and recalculate scores using deterministic logic
    // This ensures dislikes result in low scores (0-20) as expected
    const validatedRecipes = validateAndRecalculateScores(recipes, familyPreferences);

    // Store generated recipes in database with images
    const savedRecipes = await Promise.all(
      validatedRecipes.map(async (recipe) => {
        // Get image URL based on the recipe's title, search term, and cuisine
        const searchTerm = recipe.imageSearchTerm || recipe.title;
        const imageUrl = getFoodImageUrl(searchTerm, recipe.cuisine);

        return prisma.recipe.create({
          data: {
            title: recipe.title,
            description: recipe.description,
            cuisine: recipe.cuisine,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty || 'Medium',
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: JSON.stringify(recipe.instructions),
            tips: JSON.stringify(recipe.tips || []),
            nutrition: JSON.stringify(recipe.nutrition || null),
            familyMatch: JSON.stringify(recipe.familyMatch || []),
            imageUrl,
            aiPromptUsed: promptUsed,
          },
        });
      })
    );

    return NextResponse.json({ recipes: savedRecipes });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
