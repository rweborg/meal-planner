import { prisma } from '@/lib/db';
import Image from 'next/image';
import RatingStars from '@/components/RatingStars';
import { getFoodImageUrl } from '@/lib/images';
import RatingForm from '@/components/RatingForm';
import RecipeRatings from '@/components/RecipeRatings';
import FamilyMatchSection from '@/components/FamilyMatchSection';
import RecipeSubstitutions from '@/components/RecipeSubstitutions';
import { notFound } from 'next/navigation';

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Hard': 'bg-red-100 text-red-800',
};

interface Rating {
  id: string;
  score: number;
  comment: string | null;
  createdAt: Date;
  familyMember: {
    id: string;
    name: string;
  };
}

interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}


export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch recipe and family members in parallel
  const [recipe, members] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id },
      include: {
        ratings: {
          include: {
            familyMember: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }),
    prisma.familyMember.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!recipe) {
    notFound();
  }

  // Parse JSON fields with error handling
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let tips: string[] = [];
  let nutrition: Nutrition | null = null;
  let familyMatch: FamilyMatchScore[] = [];

  try {
    ingredients = JSON.parse(recipe.ingredients) as string[];
  } catch {
    console.error('Failed to parse ingredients');
    ingredients = [];
  }

  try {
    instructions = JSON.parse(recipe.instructions) as string[];
  } catch {
    console.error('Failed to parse instructions');
    instructions = [];
  }

  if (recipe.tips) {
    try {
      tips = JSON.parse(recipe.tips) as string[];
    } catch {
      console.error('Failed to parse tips');
      tips = [];
    }
  }

  if (recipe.nutrition) {
    try {
      nutrition = JSON.parse(recipe.nutrition) as Nutrition;
    } catch {
      console.error('Failed to parse nutrition');
      nutrition = null;
    }
  }

  if (recipe.familyMatch) {
    try {
      familyMatch = JSON.parse(recipe.familyMatch) as FamilyMatchScore[];
    } catch {
      console.error('Failed to parse familyMatch');
      familyMatch = [];
    }
  }

  const averageRating =
    recipe.ratings.length > 0
      ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
      : 0;

  // Always compute image from title+cuisine so we show the correct dish, not a wrong stored URL
  const heroImageUrl = getFoodImageUrl(recipe.title, recipe.cuisine ?? undefined);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={heroImageUrl}
          alt={recipe.title}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
              {recipe.cuisine}
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS['Medium']
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span className="text-gray-500">Total Time</span>
                <p className="font-semibold text-gray-900">{recipe.prepTime + recipe.cookTime} min</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500">Prep</span>
              <p className="font-semibold text-gray-900">{recipe.prepTime} min</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500">Cook</span>
              <p className="font-semibold text-gray-900">{recipe.cookTime} min</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500">Servings</span>
              <p className="font-semibold text-gray-900">{recipe.servings}</p>
            </div>
          </div>
          {recipe.ratings.length > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars value={Math.round(averageRating)} readonly />
              <span className="text-sm text-gray-500">
                {averageRating.toFixed(1)} ({recipe.ratings.length})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">About This Dish</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-6 text-lg">{recipe.description}</p>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(recipe.title + ' recipe')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Find similar recipes online
        </a>
      </div>

      {/* Family Match Scores */}
      {familyMatch.length > 0 && (
        <FamilyMatchSection familyMatch={familyMatch} members={members} />
      )}

      {/* Nutrition Info */}
      {nutrition && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Nutrition per Serving</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-orange-600">{nutrition.calories}</p>
              <p className="text-sm text-gray-500">Calories</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-red-600">{nutrition.protein}</p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{nutrition.carbs}</p>
              <p className="text-sm text-gray-500">Carbs</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-yellow-600">{nutrition.fat}</p>
              <p className="text-sm text-gray-500">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients & Instructions */}
      {(ingredients.length > 0 || instructions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ingredients.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
              </div>
              <ul className="space-y-3">
                {ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                    <span className="text-orange-600 font-bold text-lg">•</span>
                    <span className="text-gray-700 font-medium">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {instructions.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
              </div>
              <ol className="space-y-4">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 p-3 bg-white rounded-lg shadow-sm">
                    <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1.5 font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Recipe Substitutions */}
      <RecipeSubstitutions
        ingredients={ingredients}
        title={recipe.title}
        description={recipe.description}
        instructions={instructions}
        cuisine={recipe.cuisine}
      />

      {/* Tips & Tricks */}
      {tips.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-6 border-2 border-amber-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Chef&apos;s Tips</h2>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">
                <span className="text-amber-600 font-bold text-lg">💡</span>
                <span className="text-gray-700 font-medium">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating Form */}
      {members.length > 0 && <RatingForm recipeId={id} members={members} />}

      {/* Existing Ratings */}
      <RecipeRatings ratings={recipe.ratings} />
    </div>
  );
}
