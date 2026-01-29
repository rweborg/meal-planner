'use client';

import { useState, useEffect } from 'react';

interface Preference {
  id?: string;
  category: string;
  value: string;
}

interface ConversationalSurveyProps {
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

const MEAT_OPTIONS = [
  'Chicken', 'Beef', 'Pork', 'Turkey', 'Lamb',
  'Fish', 'Shrimp', 'Salmon', 'Bacon', 'Ground Beef'
];

const VEGGIE_OPTIONS = [
  'Broccoli', 'Spinach', 'Carrots', 'Bell Peppers', 'Tomatoes',
  'Onions', 'Garlic', 'Mushrooms', 'Zucchini', 'Corn', 'Potatoes'
];

// Color classes for preference sections
const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  cuisines: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🌍' },
  favoriteDishes: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '⭐' },
  favoriteMeats: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🥩' },
  favoriteVeggies: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🥦' },
  likes: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '👍' },
  dislikes: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '👎' },
  willingToTry: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🧪' },
  allergies: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '⚠️' },
  diets: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: '🥗' },
  notes: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📝' },
};

interface AllPreferences {
  cuisines: string[];
  favoriteDishes: string[];
  favoriteMeats: string[];
  favoriteVeggies: string[];
  likes: string[];
  dislikes: string[];
  willingToTry: string[];
  allergies: string[];
  diets: string[];
  notes: string[];
}

export default function ConversationalSurvey({
  memberName,
  initialPreferences = [],
  onSave,
}: ConversationalSurveyProps) {
  const [prefs, setPrefs] = useState<AllPreferences>({
    cuisines: [],
    favoriteDishes: [],
    favoriteMeats: [],
    favoriteVeggies: [],
    likes: [],
    dislikes: [],
    willingToTry: [],
    allergies: [],
    diets: [],
    notes: [],
  });
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Initialize from existing preferences
  useEffect(() => {
    if (!initialized) {
      const newPrefs: AllPreferences = {
        cuisines: initialPreferences.filter(p => p.category === 'cuisine').map(p => p.value),
        favoriteDishes: initialPreferences.filter(p => p.category === 'favorite_dish').map(p => p.value),
        favoriteMeats: initialPreferences.filter(p => p.category === 'favorite_meat').map(p => p.value),
        favoriteVeggies: initialPreferences.filter(p => p.category === 'favorite_veggie').map(p => p.value),
        likes: initialPreferences.filter(p => p.category === 'like').map(p => p.value),
        dislikes: initialPreferences.filter(p => p.category === 'dislike').map(p => p.value),
        willingToTry: initialPreferences.filter(p => p.category === 'willing_to_try').map(p => p.value),
        allergies: initialPreferences.filter(p => p.category === 'allergy').map(p => p.value),
        diets: initialPreferences.filter(p => p.category === 'diet').map(p => p.value),
        notes: initialPreferences.filter(p => p.category === 'note').map(p => p.value),
      };
      setPrefs(newPrefs);
      setInitialized(true);
    }
  }, [initialPreferences, initialized]);

  const buildPreferencesArray = (): Omit<Preference, 'id'>[] => {
    return [
      ...prefs.cuisines.map(v => ({ category: 'cuisine', value: v })),
      ...prefs.favoriteDishes.map(v => ({ category: 'favorite_dish', value: v })),
      ...prefs.favoriteMeats.map(v => ({ category: 'favorite_meat', value: v })),
      ...prefs.favoriteVeggies.map(v => ({ category: 'favorite_veggie', value: v })),
      ...prefs.likes.map(v => ({ category: 'like', value: v })),
      ...prefs.dislikes.map(v => ({ category: 'dislike', value: v })),
      ...prefs.willingToTry.map(v => ({ category: 'willing_to_try', value: v })),
      ...prefs.allergies.map(v => ({ category: 'allergy', value: v })),
      ...prefs.diets.map(v => ({ category: 'diet', value: v })),
      ...prefs.notes.map(v => ({ category: 'note', value: v })),
    ];
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    await onSave(buildPreferencesArray());
    setSaving(false);
  };

  const handleClearAll = () => {
    setPrefs({
      cuisines: [],
      favoriteDishes: [],
      favoriteMeats: [],
      favoriteVeggies: [],
      likes: [],
      dislikes: [],
      willingToTry: [],
      allergies: [],
      diets: [],
      notes: [],
    });
  };

  // Helper to toggle items in a preference array
  const togglePrefItem = (key: keyof AllPreferences, value: string) => {
    setPrefs(p => {
      const current = p[key];
      if (current.includes(value)) {
        return { ...p, [key]: current.filter(v => v !== value) };
      } else {
        return { ...p, [key]: [...current, value] };
      }
    });
  };

  // Helper to add custom item
  const addCustomItem = (key: keyof AllPreferences, value: string) => {
    const trimmed = value.trim();
    if (trimmed && !prefs[key].includes(trimmed)) {
      setPrefs(p => ({ ...p, [key]: [...p[key], trimmed] }));
    }
  };

  // Preference sections configuration
  const sections: { key: keyof AllPreferences; label: string; options?: string[]; placeholder?: string }[] = [
    { key: 'cuisines', label: 'Favorite Cuisines', options: CUISINE_OPTIONS },
    { key: 'favoriteDishes', label: 'Favorite Dishes' },
    { key: 'favoriteMeats', label: 'Favorite Meats', options: MEAT_OPTIONS },
    { key: 'favoriteVeggies', label: 'Favorite Veggies', options: VEGGIE_OPTIONS },
    { key: 'likes', label: 'Other Likes' },
    { key: 'dislikes', label: 'Foods to Avoid' },
    { key: 'willingToTry', label: 'Willing to Try' },
    { key: 'allergies', label: 'Allergies', options: COMMON_ALLERGIES },
    { key: 'diets', label: 'Dietary Restrictions', options: DIET_OPTIONS },
    { key: 'notes', label: 'Additional Notes', placeholder: 'e.g., "I\'m trying to eat more vegetables" or "Want to reduce red meat"' },
  ];

  const isNewUser = initialPreferences.length === 0;
  const totalItems = Object.values(prefs).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">
            {isNewUser ? 'Set Up Your Food Preferences' : 'Edit Preferences'}
          </h2>
          <p className="text-blue-100 text-sm">
            {isNewUser
              ? `Welcome ${memberName}! Tell us what you like to eat.`
              : `Manage preferences for ${memberName}`
            }
          </p>
        </div>

        {isNewUser && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-700">
              Click on each category below to add your preferences. This helps us suggest meals your whole family will love!
            </p>
          </div>
        )}

        <div className="p-4 space-y-3">
          {sections.map(({ key, label, options, placeholder }) => {
            const colors = COLOR_CLASSES[key];
            const items = prefs[key];
            const isExpanded = expandedSection === key;

            return (
              <div key={key} className={`border rounded-lg ${colors.border} overflow-hidden`}>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${colors.bg} hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{colors.icon}</span>
                    <span className={`font-medium ${colors.text}`}>{label}</span>
                    <span className="text-sm text-gray-500">
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 ${colors.text} transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t">
                    {/* Current items */}
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {items.map(item => (
                          <span
                            key={item}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text}`}
                          >
                            {item}
                            <button
                              onClick={() => togglePrefItem(key, item)}
                              className="hover:opacity-70 font-bold ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Options to add */}
                    {options ? (
                      <div className="flex flex-wrap gap-2">
                        {options.filter(opt => !items.includes(opt)).map(option => (
                          <button
                            key={option}
                            onClick={() => togglePrefItem(key, option)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                          >
                            + {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addCustomItem(key, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addCustomItem(key, input.value);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-50 border-t flex gap-3 justify-between">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : isNewUser ? `Save Preferences (${totalItems})` : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
