import Link from 'next/link';
import { prisma } from '@/lib/db';
import WeeklyPlan from '@/components/WeeklyPlan';
import { getFoodImageUrlAsync } from '@/lib/images';

export const dynamic = 'force-dynamic';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Dashboard() {
  const weekStart = getWeekStart(new Date());

  const currentPlan = await prisma.mealPlan.findFirst({
    where: {
      weekStart: {
        gte: weekStart,
        lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      recipes: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              description: true,
              cuisine: true,
              prepTime: true,
              cookTime: true,
              imageUrl: true,
              familyMatch: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const familyCount = await prisma.familyMember.count();
  const recipeCount = await prisma.recipe.count();

  // Pre-fetch recipe images from Unsplash (when API key set) so cards show dish-matched photos
  let planWithImageUrls = currentPlan;
  if (currentPlan?.recipes?.length) {
    planWithImageUrls = {
      ...currentPlan,
      recipes: await Promise.all(
        currentPlan.recipes.map(async (mp) => ({
          ...mp,
          recipe: {
            ...mp.recipe,
            imageUrl: await getFoodImageUrlAsync(mp.recipe.title, mp.recipe.cuisine ?? undefined),
          },
        }))
      ),
    };
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 rounded-xl p-8 shadow-lg border-4 border-purple-600">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-md">Welcome to Meal Planner</h1>
            <p className="text-white/90 mt-1 text-lg">
              Plan your family&apos;s meals for the week with AI-powered recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/family" className="group">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-1">Family Members</div>
            <div className="text-4xl font-bold text-purple-900 mb-2">{familyCount}</div>
            <div className="text-sm font-medium text-purple-600 group-hover:text-purple-800">Manage family →</div>
          </div>
        </Link>
        <Link href="/recipes" className="group">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">Saved Recipes</div>
            <div className="text-4xl font-bold text-blue-900 mb-2">{recipeCount}</div>
            <div className="text-sm font-medium text-blue-600 group-hover:text-blue-800">Browse recipes →</div>
          </div>
        </Link>
        <Link href="/plan/generate" className="group">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">This Week</div>
            <div className="text-4xl font-bold text-green-900 mb-2">
              {currentPlan ? currentPlan.recipes.length : 0} meals
            </div>
            <div className="text-sm font-medium text-green-600 group-hover:text-green-800">Generate new plan →</div>
          </div>
        </Link>
      </div>

      {/* Current Week's Plan */}
      {planWithImageUrls && planWithImageUrls.recipes.length > 0 ? (
        <WeeklyPlan
          weekStart={planWithImageUrls.weekStart}
          meals={planWithImageUrls.recipes}
        />
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-12 text-center border-2 border-purple-200">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No meal option for this week</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            {familyCount === 0
              ? 'Start by adding family members and their food preferences.'
              : 'Generate a personalized meal option based on your family\'s preferences.'}
          </p>
          {familyCount === 0 ? (
            <Link
              href="/family"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Family Members
            </Link>
          ) : (
            <Link
              href="/plan/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Meal Option
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
