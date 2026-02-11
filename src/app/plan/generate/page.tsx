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

export default function GeneratePlanPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await fetch('/api/generation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealCount: 7 }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = (errBody as { error?: string })?.error || response.statusText || 'Failed to start generation';
        throw new Error(message);
      }

      const { jobId } = await response.json();
      router.push(`/?jobId=${encodeURIComponent(jobId)}`);
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

      {/* Generate Button */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ready to Generate?</h2>
          <p className="text-gray-600 mb-6">
            Our AI will create 7 dinner recipes tailored to your family&apos;s preferences.
            You can leave this page—generation continues in the background.
          </p>

          <button
            onClick={generatePlan}
            disabled={members.length === 0 || generating}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Starting...' : 'Generate Weekly Plan'}
          </button>
        </div>

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
