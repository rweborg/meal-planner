'use client';

import { useState } from 'react';
import MemberPreferencesModal from './MemberPreferencesModal';

interface FamilyMatchScore {
  name: string;
  score: number;
  reason: string;
}

interface FamilyMember {
  id: string;
  name: string;
}

interface FamilyMatchSectionProps {
  familyMatch: FamilyMatchScore[];
  members: FamilyMember[];
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

export default function FamilyMatchSection({ familyMatch, members }: FamilyMatchSectionProps) {
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);

  // Find member ID by name (case-insensitive match)
  const findMemberId = (name: string): string | null => {
    const member = members.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    return member?.id || null;
  };

  const handleNameClick = (name: string) => {
    const memberId = findMemberId(name);
    if (memberId) {
      setSelectedMember({ id: memberId, name });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Family Match
        </h2>
        <span
          className={`text-lg font-bold px-3 py-1 rounded-full border ${getMatchColor(
            getOverallMatch(familyMatch)
          )}`}
        >
          {getOverallMatch(familyMatch)}% Overall
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        How likely each family member is to enjoy this dish based on their preferences
      </p>
      <div className="space-y-4">
        {familyMatch.map((member, idx) => {
          const memberId = findMemberId(member.name);
          const isClickable = !!memberId;

          return (
            <div key={idx} className="flex items-center gap-4">
              {isClickable ? (
                <button
                  onClick={() => handleNameClick(member.name)}
                  className="w-24 font-medium text-blue-600 hover:text-blue-800 hover:underline truncate text-left"
                  title={`View ${member.name}'s preferences`}
                >
                  {member.name}
                </button>
              ) : (
                <div className="w-24 font-medium text-gray-700 truncate" title={member.name}>
                  {member.name}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getMatchBarColor(member.score)}`}
                      style={{ width: `${member.score}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold w-12 text-right ${
                      member.score >= 80
                        ? 'text-green-600'
                        : member.score >= 60
                          ? 'text-yellow-600'
                          : 'text-red-500'
                    }`}
                  >
                    {member.score}%
                  </span>
                </div>
                {member.reason && <p className="text-xs text-gray-500 mt-1">{member.reason}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Preferences Modal */}
      {selectedMember && (
        <MemberPreferencesModal
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
