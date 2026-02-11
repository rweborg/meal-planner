'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearHistoryButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'plans' | 'recipes' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (type: 'plans' | 'recipes') => {
    setIsDeleting(true);
    try {
      const endpoint = type === 'plans' ? '/api/clear-history' : '/api/clear-recipes';
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || `Failed to clear ${type}`);
      }
    } catch (error) {
      console.error(`Error clearing ${type}:`, error);
      alert(`Failed to clear ${type}`);
    } finally {
      setIsDeleting(false);
      setConfirmAction(null);
      setShowMenu(false);
    }
  };

  if (confirmAction) {
    const label = confirmAction === 'plans' ? 'meal plans' : 'all recipes';
    return (
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border">
        <span className="text-sm text-red-600 font-medium">Delete {label}?</span>
        <button
          onClick={() => handleDelete(confirmAction)}
          disabled={isDeleting}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirmAction(null)}
          disabled={isDeleting}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear Data
        <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <button
              onClick={() => {
                setConfirmAction('plans');
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Clear Meal Plans</div>
              <div className="text-sm text-gray-500">Remove meal plan history only</div>
            </button>
            <button
              onClick={() => {
                setConfirmAction('recipes');
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="font-medium text-red-600">Clear All Recipes</div>
              <div className="text-sm text-gray-500">Remove recipes, ratings & plans</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
