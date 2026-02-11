import { prisma } from '@/lib/db';
import {
  buildRecipeGenerationPrompt,
  parseRecipeResponse,
  FamilyPreferences,
  RatingInfo,
} from '@/lib/prompts';
import { getFoodImageUrl } from '@/lib/images';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TOTAL_STEPS = 9;

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function updateJob(
  jobId: string,
  data: {
    status?: string;
    step?: number;
    stepMessage?: string | null;
    totalSteps?: number;
    error?: string | null;
    mealPlanId?: string | null;
  }
) {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function runGenerationJob(jobId: string): Promise<void> {
  const mealCount = 7;

  try {
    await updateJob(jobId, { status: 'running', step: 1, stepMessage: 'Loading family members...' });

    const members = await prisma.familyMember.findMany({
      include: { preferences: true },
    });

    await updateJob(jobId, {
      step: 2,
      stepMessage: `Analyzing preferences for ${members.length} family member${members.length !== 1 ? 's' : ''}...`,
    });

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

    await updateJob(jobId, { step: 3, stepMessage: 'Reviewing past recipe ratings...' });

    const recipesWithRatings = await prisma.recipe.findMany({
      include: { ratings: { include: { familyMember: true } } },
    });

    const ratingInfos: { recipe: string; avgScore: number; count: number }[] = [];
    for (const recipe of recipesWithRatings) {
      if (recipe.ratings.length > 0) {
        const avgScore =
          recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length;
        ratingInfos.push({
          recipe: recipe.title,
          avgScore,
          count: recipe.ratings.length,
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

    await updateJob(jobId, { step: 4, stepMessage: 'Checking recent meal plans to avoid repetition...' });

    const recentMealPlans = await prisma.mealPlan.findMany({
      include: { recipes: { include: { recipe: true } } },
      orderBy: { weekStart: 'desc' },
      take: 2,
    });

    const recentRecipes = recentMealPlans.flatMap((plan) =>
      plan.recipes.map((r) => r.recipe.title)
    );

    await updateJob(jobId, { step: 5, stepMessage: 'Building personalized recipe request...' });

    const prompt = buildRecipeGenerationPrompt({
      familyPreferences,
      highRatedRecipes,
      lowRatedRecipes,
      recentRecipes,
      mealCount,
    });

    await updateJob(jobId, {
      step: 6,
      stepMessage: 'Asking AI to create personalized recipes... (this may take a moment)',
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text)
      .join('');

    await updateJob(jobId, { step: 7, stepMessage: 'Processing recipe suggestions...' });

    const recipes = parseRecipeResponse(responseText);

    const savedRecipes: { id: string }[] = [];
    const SAVE_TIMEOUT_MS = 120_000;
    const startTime = Date.now();

    for (let i = 0; i < recipes.length; i++) {
      if (Date.now() - startTime > SAVE_TIMEOUT_MS) {
        throw new Error('Saving recipes timed out. Try again.');
      }
      await updateJob(jobId, {
        step: 8,
        stepMessage: `Saving recipe ${i + 1} of ${recipes.length}...`,
      });

      const recipe = recipes[i];
      const searchTerm = recipe.imageSearchTerm || recipe.title;
      const imageUrl = getFoodImageUrl(searchTerm, recipe.cuisine);

      const saved = await prisma.recipe.create({
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
          aiPromptUsed: prompt,
        },
      });
      savedRecipes.push(saved);
    }

    await updateJob(jobId, {
      step: 9,
      stepMessage: 'Creating meal plan...',
    });

    const weekStart = getWeekStart(new Date());
    const recipeIds = savedRecipes.slice(0, 7).map((r) => r.id);

    const mealPlan = await prisma.mealPlan.create({
      data: {
        weekStart,
        recipes: {
          create: recipeIds.map((recipeId, index) => ({
            recipeId,
            dayOfWeek: index,
            mealType: 'dinner',
          })),
        },
      },
    });

    await updateJob(jobId, {
      status: 'completed',
      step: TOTAL_STEPS,
      stepMessage: 'Done!',
      mealPlanId: mealPlan.id,
      error: null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const errorMessage =
      msg.includes('exist') || msg.includes('migrate')
        ? 'Database tables missing. Run migrations once: set DATABASE_URL to your Railway Postgres public URL, then run: npx prisma migrate deploy'
        : `Could not generate recipes: ${msg}`;

    console.error('Generation job error:', err);
    await updateJob(jobId, {
      status: 'failed',
      error: errorMessage,
    });
  }
}
