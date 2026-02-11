'use client';

import Link from 'next/link';

interface FamilyMemberCardProps {
  id: string;
  name: string;
  preferenceCount: number;
  onDelete: (id: string) => void;
}

export default function FamilyMemberCard({
  id,
  name,
  preferenceCount,
  onDelete,
}: FamilyMemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">
            {preferenceCount} preference{preferenceCount !== 1 ? 's' : ''} set
          </p>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove family member"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/family/${id}/survey`}
          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Edit Preferences
        </Link>
      </div>
    </div>
  );
}
