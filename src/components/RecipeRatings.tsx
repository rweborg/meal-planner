'use client';

import { useState } from 'react';
import RatingStars from './RatingStars';
import MemberPreferencesModal from './MemberPreferencesModal';

interface Rating {
  id: string;
  score: number;
  comment: string | null;
  familyMember: {
    id: string;
    name: string;
  };
}

interface RecipeRatingsProps {
  ratings: Rating[];
}

export default function RecipeRatings({ ratings }: RecipeRatingsProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberClick = (memberId: string, memberName: string) => {
    setSelectedMemberId(memberId);
    setSelectedMemberName(memberName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemberId(null);
    setSelectedMemberName('');
  };

  if (ratings.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Family Ratings</h2>
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => handleMemberClick(r.familyMember.id, r.familyMember.name)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                  title="Click to view preferences"
                >
                  {r.familyMember.name}
                </button>
                <RatingStars value={r.score} readonly size="sm" />
              </div>
              {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>

      {selectedMemberId && (
        <MemberPreferencesModal
          memberId={selectedMemberId}
          memberName={selectedMemberName}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
