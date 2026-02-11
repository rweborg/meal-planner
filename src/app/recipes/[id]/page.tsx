'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import RatingStars from '@/components/RatingStars';

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Hard': 'bg-red-100 text-red-800',
};

interface Rating {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
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

interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  nutrition: Nutrition | null;
  familyMatch: FamilyMatchScore[];
  imageUrl: string | null;
  ratings: Rating[];
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function getMatchBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-400';
}

function getOverallMatch(familyMatch: FamilyMatchScore[]): number {
  if (familyMatch.length === 0) return 0;
  return Math.round(familyMatch.reduce((sum, m) => sum + m.score, 0) / familyMatch.length);
}

interface FamilyMember {
  id: string;
  name: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRecipe = useCallback(async () => {
    const res = await fetch(`/api/recipes?id=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      data.ingredients = JSON.parse(data.ingredients);
      data.instructions = JSON.parse(data.instructions);
      data.tips = data.tips ? JSON.parse(data.tips) : [];
      data.nutrition = data.nutrition ? JSON.parse(data.nutrition) : null;
      data.familyMatch = data.familyMatch ? JSON.parse(data.familyMatch) : [];
      setRecipe(data);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchRecipe();
      const membersRes = await fetch('/api/family');
      const membersData = await membersRes.json();
      setMembers(membersData);
    };
    fetchData();
  }, [fetchRecipe]);

  const submitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || rating === 0) return;

    setSubmitting(true);
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeId: params.id,
        familyMemberId: selectedMember,
        score: rating,
        comment: comment || null,
      }),
    });

    setSelectedMember('');
    setRating(0);
    setComment('');
    await fetchRecipe();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Recipe not found</div>
      </div>
    );
  }

  const averageRating =
    recipe.ratings.length > 0
      ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
      : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={recipe.imageUrl || fallbackImage}
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
            <span className={`px-3 py-1 text-sm rounded-full ${DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS['Medium']}`}>
              {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">About This Dish</h2>
        <p className="text-gray-600 leading-relaxed mb-4">{recipe.description}</p>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(recipe.title + ' recipe')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Find similar recipes online
        </a>
      </div>

      {/* Family Match Scores */}
      {recipe.familyMatch && recipe.familyMatch.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Family Match
            </h2>
            <span className={`text-lg font-bold px-3 py-1 rounded-full border ${getMatchColor(getOverallMatch(recipe.familyMatch))}`}>
              {getOverallMatch(recipe.familyMatch)}% Overall
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            How likely each family member is to enjoy this dish based on their preferences
          </p>
          <div className="space-y-4">
            {recipe.familyMatch.map((member, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 font-medium text-gray-700 truncate" title={member.name}>
                  {member.name}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getMatchBarColor(member.score)}`}
                        style={{ width: `${member.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${
                      member.score >= 80 ? 'text-green-600' : member.score >= 60 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {member.score}%
                    </span>
                  </div>
                  {member.reason && (
                    <p className="text-xs text-gray-500 mt-1">{member.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Nutrition per Serving</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-orange-600">{recipe.nutrition.calories}</p>
              <p className="text-sm text-gray-500">Calories</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-red-600">{recipe.nutrition.protein}</p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{recipe.nutrition.carbs}</p>
              <p className="text-sm text-gray-500">Carbs</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-2xl font-bold text-yellow-600">{recipe.nutrition.fat}</p>
              <p className="text-sm text-gray-500">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
          <p className="text-sm text-gray-500 mb-4">For {recipe.servings} servings</p>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Tips & Tricks */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="bg-amber-50 rounded-lg shadow p-6 border border-amber-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Chef&apos;s Tips
          </h2>
          <ul className="space-y-3">
            {recipe.tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-amber-600 font-bold">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating Form */}
      {members.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Rate This Recipe</h2>
          <form onSubmit={submitRating} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a family member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <RatingStars value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your thoughts about this recipe..."
              />
            </div>
            <button
              type="submit"
              disabled={!selectedMember || rating === 0 || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}

      {/* Existing Ratings */}
      {recipe.ratings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Family Ratings</h2>
          <div className="space-y-4">
            {recipe.ratings.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{r.familyMember.name}</span>
                  <RatingStars value={r.score} readonly size="sm" />
                </div>
                {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
