import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import ClearHistoryButton from '@/components/ClearHistoryButton';
import DeleteWeekButton from '@/components/DeleteWeekButton';
import RatingStars from '@/components/RatingStars';
import { getFoodImageUrlAsync } from '@/lib/images';

export default async function HistoryPage() {
  const mealPlans = await prisma.mealPlan.findMany({
    select: {
      id: true,
      weekStart: true,
      recipes: {
        select: {
          id: true,
          dayOfWeek: true,
          recipe: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              cuisine: true,
              ratings: {
                select: {
                  score: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      weekStart: 'desc',
    },
  });

  // Pre-fetch recipe images from Unsplash (when API key set) so cards show dish-matched photos
  const plansWithImageUrls = await Promise.all(
    mealPlans.map(async (plan) => ({
      ...plan,
      recipes: await Promise.all(
        plan.recipes.map(async (r) => ({
          ...r,
          recipe: {
            ...r.recipe,
            imageUrl: await getFoodImageUrlAsync(r.recipe.title, r.recipe.cuisine ?? undefined),
          },
        }))
      ),
    }))
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Meal Options</h1>
          </div>
          <p className="text-gray-600 mt-2 ml-14">View your past meal options and ratings</p>
        </div>
        {plansWithImageUrls.length > 0 && <ClearHistoryButton />}
      </div>

      {plansWithImageUrls.length > 0 ? (
        <div className="space-y-6">
          {plansWithImageUrls.map((plan) => {
            const totalRatings = plan.recipes.reduce(
              (sum, r) => sum + r.recipe.ratings.length,
              0
            );
            const avgRating =
              totalRatings > 0
                ? plan.recipes.reduce(
                    (sum, r) =>
                      sum +
                      r.recipe.ratings.reduce((s, rating) => s + rating.score, 0),
                    0
                  ) / totalRatings
                : 0;

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 p-6 border-b-4 border-purple-600">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">
                          Week of {formatDate(plan.weekStart)}
                        </h2>
                        {totalRatings > 0 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                            <RatingStars value={Math.round(avgRating)} readonly size="sm" />
                            <span className={`text-base font-bold ${getRatingColor(avgRating)}`}>
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-white/90 font-medium">
                        <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          {plan.recipes.length} meals
                        </span>
                        {totalRatings > 0 && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <DeleteWeekButton
                      mealPlanId={plan.id}
                      weekLabel={`Week of ${formatDate(plan.weekStart)}`}
                    />
                  </div>
                </div>

                {/* Days Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {plan.recipes.map((mealRecipe) => {
                      const recipe = mealRecipe.recipe;
                      const recipeRating = recipe.ratings.length > 0
                        ? recipe.ratings.reduce((s, r) => s + r.score, 0) / recipe.ratings.length
                        : 0;
                      const imageUrl = recipe.imageUrl;

                      return (
                        <Link
                          key={mealRecipe.id}
                          href={`/recipes/${recipe.id}`}
                          className="group bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                          {/* Day Header */}
                          <div className="bg-gradient-to-br from-purple-100 to-blue-100 px-4 py-3 border-b-2 border-purple-200">
                            <p className="text-sm font-bold text-purple-700 uppercase tracking-wider">
                              {dayAbbr[mealRecipe.dayOfWeek]}
                            </p>
                            <p className="text-xs font-medium text-purple-600">{days[mealRecipe.dayOfWeek]}</p>
                          </div>

                          {/* Recipe Content */}
                          <div className="p-4">
                            {/* Recipe Image */}
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 mb-3 group-hover:scale-105 transition-transform duration-300 shadow-md">
                              <Image
                                src={imageUrl}
                                alt={recipe.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 14vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {recipe.cuisine && (
                                <div className="absolute top-3 right-3">
                                  <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-purple-700 text-xs rounded-full font-bold shadow-md border border-purple-200">
                                    {recipe.cuisine}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Recipe Title */}
                            <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">
                              {recipe.title}
                            </h3>

                            {/* Rating */}
                            {recipe.ratings.length > 0 && (
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                                <RatingStars value={Math.round(recipeRating)} readonly size="sm" />
                                <span className={`text-sm font-bold ${getRatingColor(recipeRating)}`}>
                                  {recipeRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-6">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No meal options yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate your first meal option to start tracking your weekly meal history and ratings.
          </p>
          <Link
            href="/plan/generate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate Meal Option
          </Link>
        </div>
      )}
    </div>
  );
}
