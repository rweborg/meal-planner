'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RatingStars from './RatingStars';

interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}

interface MemberRating {
  memberId: string;
  memberName: string;
  score: number;
  comment?: string | null;
}

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  averageRating?: number;
  ratingCount?: number;
  imageUrl?: string | null;
  difficulty?: string;
  compact?: boolean;
  showDelete?: boolean;
  familyMatch?: FamilyMatchScore[];
  memberRatings?: MemberRating[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Hard': 'bg-red-100 text-red-800',
};

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getOverallMatch(familyMatch: FamilyMatchScore[]): number {
  if (familyMatch.length === 0) return 0;
  return Math.round(familyMatch.reduce((sum, m) => sum + m.score, 0) / familyMatch.length);
}

export default function RecipeCard({
  id,
  title,
  description,
  cuisine,
  prepTime,
  cookTime,
  averageRating,
  ratingCount = 0,
  imageUrl,
  difficulty = 'Medium',
  compact = false,
  showDelete = true,
  familyMatch = [],
  memberRatings = [],
}: RecipeCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (compact) {
    return (
      <Link
        href={`/recipes/${id}`}
        className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
      >
        <div className="relative h-24 w-full">
          <Image
            src={imageUrl || fallbackImage}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          <p className="text-sm text-gray-500">{cuisine}</p>
          {averageRating !== undefined && (
            <div className="mt-1">
              <RatingStars value={Math.round(averageRating)} readonly size="sm" />
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Recipe Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || fallbackImage}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs rounded-full font-medium">
            {cuisine}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS['Medium']}`}>
            {difficulty}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {prepTime + cookTime} min total
          </span>
          <span className="text-gray-300">|</span>
          <span>Prep: {prepTime}min</span>
          <span>Cook: {cookTime}min</span>
        </div>

        {averageRating !== undefined && (
          <div className="flex items-center gap-2 mb-4">
            <RatingStars value={Math.round(averageRating)} readonly size="sm" />
            <span className="text-sm text-gray-500">
              {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        )}

        {/* Family Match Scores */}
        {familyMatch.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Family Match</span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${getMatchColor(getOverallMatch(familyMatch))}`}>
                {getOverallMatch(familyMatch)}%
              </span>
            </div>
            <div className="space-y-1.5">
              {familyMatch.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-20 truncate" title={member.name}>
                    {member.name}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        member.score >= 80 ? 'bg-green-500' : member.score >= 60 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${member.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{member.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member Ratings */}
        {memberRatings.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Member Ratings</span>
            </div>
            <div className="space-y-2">
              {memberRatings.map((rating) => (
                <div key={rating.memberId} className="flex items-start gap-2">
                  <span
                    className="text-xs text-blue-800 font-medium w-20 truncate"
                    title={rating.memberName}
                  >
                    {rating.memberName}
                  </span>
                  <div className="flex-1">
                    <RatingStars value={rating.score} readonly size="sm" />
                    {rating.comment && (
                      <p className="text-xs text-gray-600 mt-0.5 italic line-clamp-1" title={rating.comment}>
                        &ldquo;{rating.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/recipes/${id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            View Recipe
          </Link>
          {showDelete && !showConfirm && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              className="px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete recipe"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {showConfirm && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 mb-2">Delete this recipe and its {ratingCount} rating{ratingCount !== 1 ? 's' : ''}?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowConfirm(false);
                }}
                disabled={isDeleting}
                className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-sm rounded font-medium hover:bg-gray-100 border border-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
