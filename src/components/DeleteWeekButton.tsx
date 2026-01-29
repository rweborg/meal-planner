'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface DeleteWeekButtonProps {
  mealPlanId: string;
  weekLabel: string;
}

export default function DeleteWeekButton({ mealPlanId, weekLabel }: DeleteWeekButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If on history page, refresh it. Otherwise redirect to dashboard
        // The dashboard will automatically show the correct state since it's a server component
        if (pathname === '/history') {
          router.refresh();
        } else {
          router.push('/');
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete meal option');
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting meal option:', error);
      alert('Failed to delete meal option');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <span className="text-red-600 font-medium">Remove from history?</span>
          <span className="text-gray-500 ml-1">(recipes kept)</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete this week"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
