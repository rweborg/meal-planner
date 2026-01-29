'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RatingStars from './RatingStars';
import MemberPreferencesModal from './MemberPreferencesModal';

interface FamilyMember {
  id: string;
  name: string;
}

interface RatingFormProps {
  recipeId: string;
  members: FamilyMember[];
}

export default function RatingForm({ recipeId, members }: RatingFormProps) {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewMemberId, setPreviewMemberId] = useState<string | null>(null);
  const [previewMemberName, setPreviewMemberName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const submitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          familyMemberId: selectedMember,
          score: rating,
          comment: comment || null,
        }),
      });

      if (response.ok) {
        setSelectedMember('');
        setRating(0);
        setComment('');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Rate This Recipe</h2>
      <form onSubmit={submitRating} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Family Member
          </label>
          <div className="flex gap-2">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a family member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {selectedMember && (
              <button
                type="button"
                onClick={() => {
                  const member = members.find((m) => m.id === selectedMember);
                  if (member) {
                    setPreviewMemberId(member.id);
                    setPreviewMemberName(member.name);
                    setIsModalOpen(true);
                  }
                }}
                className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                title="View preferences"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
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

      {previewMemberId && (
        <MemberPreferencesModal
          memberId={previewMemberId}
          memberName={previewMemberName}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPreviewMemberId(null);
            setPreviewMemberName('');
          }}
        />
      )}
    </div>
  );
}
