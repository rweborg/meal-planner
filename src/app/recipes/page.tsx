import Link from 'next/link';
import { prisma } from '@/lib/db';
import RecipeCard from '@/components/RecipeCard';
import { getFoodImageUrlAsync } from '@/lib/images';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      cuisine: true,
      prepTime: true,
      cookTime: true,
      difficulty: true,
      imageUrl: true,
      familyMatch: true,
      ratings: {
        select: {
          score: true,
          comment: true,
          familyMember: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });

  const recipesWithRatings = recipes.map((recipe) => {
    const avgRating =
      recipe.ratings.length > 0
        ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
        : undefined;

    let familyMatch: { name: string; score: number; reason: string }[] = [];
    try {
      if (recipe.familyMatch) {
        familyMatch = JSON.parse(recipe.familyMatch);
      }
    } catch {
      // Ignore parse errors
    }

    const memberRatings = recipe.ratings.map((r) => ({
      memberId: r.familyMember.id,
      memberName: r.familyMember.name,
      score: r.score,
      comment: r.comment,
    }));

    return {
      ...recipe,
      averageRating: avgRating,
      ratingCount: recipe.ratings.length,
      familyMatch,
      memberRatings,
    };
  });

  // Pre-fetch recipe images from Unsplash (when API key set) so cards show dish-matched photos
  const recipesWithImageUrls = await Promise.all(
    recipesWithRatings.map(async (r) => ({
      ...r,
      imageUrl: await getFoodImageUrlAsync(r.title, r.cuisine ?? undefined),
    }))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-xl p-8 shadow-lg border-4 border-blue-600">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-md">Recipes</h1>
            <p className="text-white/90 mt-1 text-lg">Browse all your generated recipes</p>
          </div>
        </div>
      </div>

      {recipesWithImageUrls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipesWithImageUrls.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              cuisine={recipe.cuisine}
              prepTime={recipe.prepTime}
              cookTime={recipe.cookTime}
              averageRating={recipe.averageRating}
              ratingCount={recipe.ratingCount}
              imageUrl={recipe.imageUrl}
              difficulty={recipe.difficulty}
              familyMatch={recipe.familyMatch}
              memberRatings={recipe.memberRatings}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-12 text-center border-2 border-blue-200">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No recipes yet</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Generate a meal option to create your first recipes.
          </p>
          <Link
            href="/plan/generate"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Meal Option
          </Link>
        </div>
      )}
    </div>
  );
}
