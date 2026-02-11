import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { buildRecipeGenerationPrompt, parseRecipeResponse, FamilyPreferences, RatingInfo } from '@/lib/prompts';
import { getFoodImageUrl } from '@/lib/images';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (status: string, step: number, totalSteps: number) => {
        const data = JSON.stringify({ status, step, totalSteps, type: 'status' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const sendError = (error: string) => {
        const data = JSON.stringify({ error, type: 'error' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const sendComplete = (recipes: unknown[]) => {
        const data = JSON.stringify({ recipes, type: 'complete' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        const body = await request.json();
        const { mealCount = 7 } = body;
        const totalSteps = 8;

        // Step 1: Get family members
        sendStatus('Loading family members...', 1, totalSteps);
        const members = await prisma.familyMember.findMany({
          include: {
            preferences: true,
          },
        });

        // Step 2: Build preferences
        sendStatus(`Analyzing preferences for ${members.length} family member${members.length !== 1 ? 's' : ''}...`, 2, totalSteps);
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UI

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

        // Step 3: Get ratings
        sendStatus('Reviewing past recipe ratings...', 3, totalSteps);
        const recipesWithRatings = await prisma.recipe.findMany({
          include: {
            ratings: {
              include: {
                familyMember: true,
              },
            },
          },
        });

        const ratingInfos: { recipe: string; avgScore: number; count: number }[] = [];
        for (const recipe of recipesWithRatings) {
          if (recipe.ratings.length > 0) {
            const avgScore = recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length;
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

        // Step 4: Get recent recipes
        sendStatus('Checking recent meal plans to avoid repetition...', 4, totalSteps);
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

        // Step 5: Build prompt
        sendStatus('Building personalized recipe request...', 5, totalSteps);
        const prompt = buildRecipeGenerationPrompt({
          familyPreferences,
          highRatedRecipes,
          lowRatedRecipes,
          recentRecipes,
          mealCount,
        });

        // Step 6: Call AI
        sendStatus('Asking AI to create personalized recipes... (this may take a moment)', 6, totalSteps);
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

        // Step 7: Parse recipes
        sendStatus('Processing recipe suggestions...', 7, totalSteps);
        const recipes = parseRecipeResponse(responseText);

        // Step 8: Save recipes sequentially with progress (avoids DB connection pool exhaustion)
        const savedRecipes: Awaited<ReturnType<typeof prisma.recipe.create>>[] = [];
        const SAVE_TIMEOUT_MS = 120_000; // 120s total
        const startTime = Date.now();

        try {
          for (let i = 0; i < recipes.length; i++) {
            if (Date.now() - startTime > SAVE_TIMEOUT_MS) {
              throw new Error('Saving recipes timed out. Try again.');
            }
            sendStatus(`Saving recipe ${i + 1} of ${recipes.length}...`, 8, totalSteps);

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
        } catch (dbError) {
          const msg = dbError instanceof Error ? dbError.message : String(dbError);
          sendError(
            msg.includes('exist') || msg.includes('migrate')
              ? 'Database tables missing. Run migrations once: set DATABASE_URL to your Railway Postgres public URL, then run: npx prisma migrate deploy'
              : `Could not save recipes: ${msg}`
          );
          controller.close();
          return;
        }

        sendComplete(savedRecipes);
        controller.close();
      } catch (error) {
        console.error('Recipe generation error:', error);
        sendError(error instanceof Error ? error.message : 'Failed to generate recipes');
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
