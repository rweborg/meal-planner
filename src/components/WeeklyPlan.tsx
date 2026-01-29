'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getFoodImageUrl } from '@/lib/images';

interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}

interface MealPlanRecipe {
  id: string;
  dayOfWeek: number;
  mealType: string;
  recipe: {
    id: string;
    title: string;
    description: string;
    cuisine: string;
    prepTime: number;
    cookTime: number;
    imageUrl?: string | null;
    familyMatch?: string | null;
  };
}

function parseFamilyMatch(familyMatchStr?: string | null): FamilyMatchScore[] {
  if (!familyMatchStr) return [];
  try {
    return JSON.parse(familyMatchStr);
  } catch {
    return [];
  }
}

function getOverallMatch(familyMatch: FamilyMatchScore[]): number {
  if (familyMatch.length === 0) return 0;
  return Math.round(familyMatch.reduce((sum, m) => sum + m.score, 0) / familyMatch.length);
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

interface WeeklyPlanProps {
  weekStart: Date;
  meals: MealPlanRecipe[];
  onRegenerateMeal?: (dayOfWeek: number, mealType: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyPlan({ weekStart, meals, onRegenerateMeal }: WeeklyPlanProps) {
  const formatDate = (dayOffset: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMealForDay = (dayOfWeek: number, mealType: string) => {
    return meals.find(m => m.dayOfWeek === dayOfWeek && m.mealType === mealType);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS.map((day, index) => {
          const dinner = getMealForDay(index, 'dinner');
          // Use pre-fetched image (from Unsplash search when API key set) or fallback to keyword match
          const imageUrl = dinner?.recipe.imageUrl ?? (dinner ? getFoodImageUrl(dinner.recipe.title, dinner.recipe.cuisine) : null);
          
          return (
            <div key={day} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{day}</h3>
                <p className="text-xs text-gray-500">{formatDate(index)}</p>
              </div>

              <div className="p-3">
                {dinner ? (
                  <div className="space-y-2">
                    {/* Recipe Image */}
                    {imageUrl && (
                      <Link href={`/recipes/${dinner.recipe.id}`} className="block mb-2">
                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={dinner.recipe.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 14vw"
                          />
                        </div>
                      </Link>
                    )}
                    
                    {/* Recipe Info */}
                    <div className="space-y-1.5">
                      <Link
                        href={`/recipes/${dinner.recipe.id}`}
                        className="block text-sm font-bold text-gray-900 hover:text-blue-600 hover:underline line-clamp-2"
                      >
                        {dinner.recipe.title}
                      </Link>
                      <p className="text-xs text-gray-500">{dinner.recipe.cuisine}</p>
                      {(() => {
                        const familyMatch = parseFamilyMatch(dinner.recipe.familyMatch);
                        const overall = getOverallMatch(familyMatch);
                        return familyMatch.length > 0 ? (
                          <div className={`text-xs font-medium ${getMatchColor(overall)}`}>
                            {overall}% match
                          </div>
                        ) : null;
                      })()}
                      {onRegenerateMeal && (
                        <button
                          onClick={() => onRegenerateMeal(index, 'dinner')}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-4 bg-gray-100 rounded-full mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">No meal planned</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
