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
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 rounded-xl p-8 shadow-lg border-4 border-pink-600">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-md">Family Members</h1>
            <p className="text-white/90 mt-1 text-lg">
              Manage your family and their food preferences
            </p>
          </div>
        </div>
      </div>

      {/* Add New Member Form */}
      <form onSubmit={addMember} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 border-2 border-pink-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Add Family Member</h2>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name..."
            className="flex-1 px-5 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg font-medium"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
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
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-12 text-center border-2 border-pink-200">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No family members yet</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Add your first family member above to get started with meal options.
          </p>
        </div>
      )}
    </div>
  );
}
