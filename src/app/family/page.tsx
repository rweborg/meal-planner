'use client';

import { useEffect, useState } from 'react';
import FamilyMemberCard from '@/components/FamilyMemberCard';

interface FamilyMember {
  id: string;
  name: string;
  _count: {
    preferences: number;
  };
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchMembers = async () => {
    const res = await fetch('/api/family');
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName('');
    await fetchMembers();
    setAdding(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    await fetch(`/api/family?id=${id}`, {
      method: 'DELETE',
    });
    await fetchMembers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
        <p className="text-gray-600 mt-2">
          Manage your family and their food preferences
        </p>
      </div>

      {/* Add New Member Form */}
      <form onSubmit={addMember} className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Add Family Member</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>

      {/* Family Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              id={member.id}
              name={member.name}
              preferenceCount={member._count.preferences}
              onDelete={deleteMember}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No family members yet</h2>
          <p className="text-gray-600">
            Add your first family member above to get started with meal planning.
          </p>
        </div>
      )}
    </div>
  );
}
