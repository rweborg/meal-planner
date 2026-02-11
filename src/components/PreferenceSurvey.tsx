'use client';

import { useState, useEffect } from 'react';

interface Preference {
  id?: string;
  category: string;
  value: string;
}

interface PreferenceSurveyProps {
  familyMemberId: string;
  memberName: string;
  initialPreferences?: Preference[];
  onSave: (preferences: Omit<Preference, 'id'>[]) => Promise<void>;
}

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian',
  'Thai', 'Mediterranean', 'American', 'French', 'Korean'
];

const DIET_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Low-Carb', 'Paleo', 'Halal', 'Kosher'
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat',
  'Soy', 'Fish', 'Shellfish', 'Sesame'
];

export default function PreferenceSurvey({
  memberName,
  initialPreferences = [],
  onSave,
}: PreferenceSurveyProps) {
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCuisines(initialPreferences.filter(p => p.category === 'cuisine').map(p => p.value));
    setLikes(initialPreferences.filter(p => p.category === 'like').map(p => p.value));
    setDislikes(initialPreferences.filter(p => p.category === 'dislike').map(p => p.value));
    setAllergies(initialPreferences.filter(p => p.category === 'allergy').map(p => p.value));
    setDiets(initialPreferences.filter(p => p.category === 'diet').map(p => p.value));
  }, [initialPreferences]);

  const toggleItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (
    value: string,
    list: string[],
    setList: (items: string[]) => void,
    setValue: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setValue('');
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    setList(list.filter(i => i !== item));
  };

  const handleSave = async () => {
    setSaving(true);
    const preferences: Omit<Preference, 'id'>[] = [
      ...cuisines.map(v => ({ category: 'cuisine', value: v })),
      ...likes.map(v => ({ category: 'like', value: v })),
      ...dislikes.map(v => ({ category: 'dislike', value: v })),
      ...allergies.map(v => ({ category: 'allergy', value: v })),
      ...diets.map(v => ({ category: 'diet', value: v })),
    ];
    await onSave(preferences);
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Food Preferences for {memberName}</h2>
        <p className="text-gray-600 mt-2">Tell us what you like and we&apos;ll create better meal plans</p>
      </div>

      {/* Favorite Cuisines */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Favorite Cuisines</h3>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(cuisine => (
            <button
              key={cuisine}
              type="button"
              onClick={() => toggleItem(cuisines, setCuisines, cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cuisines.includes(cuisine)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Liked Ingredients */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Liked Ingredients/Foods</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLike}
            onChange={(e) => setNewLike(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem(newLike, likes, setLikes, setNewLike)}
            placeholder="Add an ingredient you like..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addCustomItem(newLike, likes, setLikes, setNewLike)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {likes.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(likes, setLikes, item)}
                className="hover:text-green-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Disliked Ingredients */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Disliked Ingredients/Foods</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDislike}
            onChange={(e) => setNewDislike(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem(newDislike, dislikes, setDislikes, setNewDislike)}
            placeholder="Add an ingredient you dislike..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addCustomItem(newDislike, dislikes, setDislikes, setNewDislike)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {dislikes.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(dislikes, setDislikes, item)}
                className="hover:text-red-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Allergies */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Allergies</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_ALLERGIES.map(allergy => (
            <button
              key={allergy}
              type="button"
              onClick={() => toggleItem(allergies, setAllergies, allergy)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                allergies.includes(allergy)
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem(newAllergy, allergies, setAllergies, setNewAllergy)}
            placeholder="Add other allergy..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addCustomItem(newAllergy, allergies, setAllergies, setNewAllergy)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(allergies, setAllergies, item)}
                className="hover:text-orange-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Dietary Restrictions */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Dietary Restrictions</h3>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map(diet => (
            <button
              key={diet}
              type="button"
              onClick={() => toggleItem(diets, setDiets, diet)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                diets.includes(diet)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
