'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConversationalSurvey from '@/components/ConversationalSurvey';

interface Preference {
  id: string;
  category: string;
  value: string;
}

interface FamilyMember {
  id: string;
  name: string;
  preferences: Preference[];
}

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/family?id=${params.id}`);
        if (!res.ok) {
          throw new Error('Family member not found');
        }
        const data = await res.json();
        setMember(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const handleSave = async (preferences: Omit<Preference, 'id'>[]) => {
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyMemberId: params.id,
        preferences,
      }),
    });
    router.push('/family');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error || 'Family member not found'}</p>
          <button
            onClick={() => router.push('/family')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ConversationalSurvey
        familyMemberId={member.id}
        memberName={member.name}
        initialPreferences={member.preferences}
        onSave={handleSave}
      />
    </div>
  );
}
