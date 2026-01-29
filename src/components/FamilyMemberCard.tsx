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
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 border-2 border-pink-200 hover:border-pink-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <p className="text-sm font-medium text-pink-700 mt-1">
              {preferenceCount} preference{preferenceCount !== 1 ? 's' : ''} set
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
          className="flex-1 text-center px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Edit Preferences
        </Link>
      </div>
    </div>
  );
}
