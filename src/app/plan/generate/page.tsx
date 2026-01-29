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
      try {
        const res = await fetch('/api/family');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError(err instanceof Error ? err.message : 'Failed to load family members');
      } finally {
        setLoading(false);
      }
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
        setCurrentStatus({ status: 'Creating meal option...', step: 9, totalSteps: 9 });

        // Create meal plan
        const planRes = await fetch('/api/meal-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipes }),
        });

        if (!planRes.ok) {
          throw new Error('Failed to create meal option');
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
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-gray-500">Loading family members...</div>
        </div>
      </div>
    );
  }

  if (error && members.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Page</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const membersWithPreferences = members.filter(m => m._count.preferences > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 rounded-xl p-8 shadow-lg border-4 border-green-600 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">Generate Meal Option</h1>
        <p className="text-white/90 text-lg">
          Create a personalized weekly dinner option for your family
        </p>
      </div>

      {/* Family Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
        </div>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4 text-lg">No family members added yet.</p>
            <button
              onClick={() => router.push('/family')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add family members
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-100 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${member._count.preferences > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <svg className={`w-5 h-5 ${member._count.preferences > 0 ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{member.name}</span>
                </div>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${member._count.preferences > 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
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
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 text-lg mb-1">No Preferences Set</h3>
              <p className="text-sm text-yellow-700 mt-1">
                For best results, add food preferences for at least one family member
                before generating a meal option.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button / Progress */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
        {generating ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Meal Option</h2>
              <p className="text-gray-600 text-lg">Please wait while we create personalized recipes...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Generate?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Our AI will create 7 dinner recipes tailored to your family&apos;s preferences.
            </p>

            <button
              onClick={generatePlan}
              disabled={members.length === 0}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
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
