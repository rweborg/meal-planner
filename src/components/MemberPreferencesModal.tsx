'use client';

import { useState, useEffect } from 'react';

interface Preference {
  category: string;
  value: string;
}

interface MemberPreferencesModalProps {
  memberId: string;
  memberName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  allergy: { label: 'Allergies', icon: '🚫', color: 'text-red-700 bg-red-50 border-red-200' },
  dislike: { label: 'Dislikes', icon: '⚠️', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  diet: { label: 'Dietary Restrictions', icon: '🥗', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  cuisine: { label: 'Favorite Cuisines', icon: '🌍', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  favorite_dish: { label: 'Favorite Dishes', icon: '⭐', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  favorite_meat: { label: 'Favorite Proteins', icon: '🥩', color: 'text-red-700 bg-red-50 border-red-200' },
  favorite_veggie: { label: 'Favorite Vegetables', icon: '🥦', color: 'text-green-700 bg-green-50 border-green-200' },
  like: { label: 'Likes', icon: '👍', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  willing_to_try: { label: 'Willing to Try', icon: '🧪', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  note: { label: 'Notes', icon: '📝', color: 'text-gray-700 bg-gray-50 border-gray-200' },
};

export default function MemberPreferencesModal({
  memberId,
  memberName,
  isOpen,
  onClose,
}: MemberPreferencesModalProps) {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/family?id=${memberId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch preferences');
      }
      const data = await res.json();
      setPreferences(data.preferences || []);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  // Group preferences by category
  const groupedPreferences: Record<string, string[]> = {};
  preferences.forEach((pref) => {
    if (!groupedPreferences[pref.category]) {
      groupedPreferences[pref.category] = [];
    }
    groupedPreferences[pref.category].push(pref.value);
  });

  // Priority order: allergies, dislikes, diets first, then positives
  const priorityOrder = [
    'allergy',
    'dislike',
    'diet',
    'cuisine',
    'favorite_dish',
    'favorite_meat',
    'favorite_veggie',
    'like',
    'willing_to_try',
    'note',
  ];

  const orderedCategories = priorityOrder.filter((cat) => groupedPreferences[cat]?.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {memberName}&apos;s Preferences
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPreferences}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No preferences set yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderedCategories.map((category) => {
                const categoryInfo = CATEGORY_LABELS[category] || {
                  label: category,
                  icon: '📋',
                  color: 'text-gray-700 bg-gray-50 border-gray-200',
                };
                const values = groupedPreferences[category];

                return (
                  <div
                    key={category}
                    className={`rounded-lg border p-4 ${categoryInfo.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <h3 className="font-semibold">{categoryInfo.label}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {values.map((value, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/70 rounded-full text-sm font-medium"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
