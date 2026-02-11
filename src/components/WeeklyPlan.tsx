'use client';

import Link from 'next/link';

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
          return (
            <div key={day} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-center mb-3">
                <h3 className="font-semibold text-gray-900">{day}</h3>
                <p className="text-sm text-gray-500">{formatDate(index)}</p>
              </div>

              <div className="space-y-2">
                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Dinner</p>
                  {dinner ? (
                    <div className="space-y-2">
                      <Link
                        href={`/recipes/${dinner.recipe.id}`}
                        className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
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
                  ) : (
                    <p className="text-sm text-gray-400 italic">No meal planned</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
