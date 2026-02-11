'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FamilyMember {
  id: string;
  name: string;
  _count: {
    preferences: number;
  };
}

interface StatusUpdate {
  status: string;
  step: number;
  totalSteps: number;
}

const STEP_ICONS: Record<number, string> = {
  1: '👨‍👩‍👧‍👦',
  2: '📋',
  3: '⭐',
  4: '📅',
  5: '✍️',
  6: '🤖',
  7: '📝',
  8: '💾',
};

export default function GeneratePlanPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch('/api/family');
      const data = await res.json();
      setMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    setCurrentStatus(null);
    setCompletedSteps([]);

    try {
      const response = await fetch('/api/generate-recipes-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealCount: 7 }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let recipes = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'status') {
                // Mark previous steps as completed
                setCompletedSteps(prev => {
                  const newCompleted = [...prev];
                  for (let i = 1; i < data.step; i++) {
                    if (!newCompleted.includes(i)) {
                      newCompleted.push(i);
                    }
                  }
                  return newCompleted;
                });
                setCurrentStatus(data);
              } else if (data.type === 'complete') {
                recipes = data.recipes;
                // Mark all steps as completed
                setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8]);
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      if (recipes) {
        setCurrentStatus({ status: 'Creating meal plan...', step: 9, totalSteps: 9 });

        // Create meal plan
        const planRes = await fetch('/api/meal-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipes }),
        });

        if (!planRes.ok) {
          const errBody = await planRes.json().catch(() => ({}));
          const message = (errBody as { error?: string })?.error || planRes.statusText || 'Failed to create meal plan';
          throw new Error(message);
        }

        setCurrentStatus({ status: 'Done! Redirecting...', step: 9, totalSteps: 9 });
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const membersWithPreferences = members.filter(m => m._count.preferences > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Generate Meal Plan</h1>
        <p className="text-gray-600 mt-2">
          Create a personalized weekly dinner plan for your family
        </p>
      </div>

      {/* Family Overview */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Family Members</h2>
        {members.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No family members added yet.</p>
            <button
              onClick={() => router.push('/family')}
              className="text-blue-600 hover:underline"
            >
              Add family members
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="font-medium">{member.name}</span>
                <span className={`text-sm ${member._count.preferences > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                  {member._count.preferences > 0
                    ? `${member._count.preferences} preferences`
                    : 'No preferences set'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning if no preferences */}
      {members.length > 0 && membersWithPreferences.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-800">No Preferences Set</h3>
              <p className="text-sm text-yellow-700 mt-1">
                For best results, add food preferences for at least one family member
                before generating a meal plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button / Progress */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {generating ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Generating Your Meal Plan</h2>
              <p className="text-gray-500 text-sm">Please wait while we create personalized recipes...</p>
            </div>

            {/* Current Step Display */}
            {currentStatus && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{STEP_ICONS[currentStatus.step] || '🔄'}</span>
                  <span className="text-lg text-gray-700">{currentStatus.status}</span>
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>

                {/* Progress bar */}
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Step {currentStatus.step} of {currentStatus.totalSteps}</span>
                    <span>{Math.round((completedSteps.length / 8) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(completedSteps.length / 8) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!currentStatus && (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-gray-500">Starting...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Ready to Generate?</h2>
            <p className="text-gray-600 mb-6">
              Our AI will create 7 dinner recipes tailored to your family&apos;s preferences.
            </p>

            <button
              onClick={generatePlan}
              disabled={members.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate Weekly Plan
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setGenerating(false);
              }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
