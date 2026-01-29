'use client';

import { useState } from 'react';

interface RecipeSubstitutionsProps {
  ingredients: string[];
  title: string;
  description: string;
  instructions: string[];
  cuisine: string;
}

interface RecipeVariation {
  proteinSubstitution: string;
  modifiedTitle: string;
  modifiedIngredients: string[];
  modifiedInstructions: string[];
  notes: string;
}

export default function RecipeSubstitutions({
  ingredients,
  title,
  description,
  instructions,
  cuisine,
}: RecipeSubstitutionsProps) {
  const [variations, setVariations] = useState<RecipeVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVariation, setExpandedVariation] = useState<number | null>(null);

  const generateVariations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/recipe-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          ingredients,
          instructions,
          cuisine,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate variations');
      }

      const data = await response.json();
      setVariations(data.variations || []);
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">Recipe Variations</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Get AI-powered recipe variations with different protein substitutions. Click the button below to generate personalized alternatives.
      </p>

      {variations.length === 0 && !loading && !error && (
        <button
          onClick={generateVariations}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Protein Variations
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-gray-600">Generating recipe variations...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm mb-2">{error}</p>
          <button
            onClick={generateVariations}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {variations.length > 0 && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {variations.length} variation{variations.length !== 1 ? 's' : ''} generated
            </p>
            <button
              onClick={generateVariations}
              disabled={loading}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>

          {variations.map((variation, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedVariation(expandedVariation === idx ? null : idx)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{variation.modifiedTitle}</div>
                  <div className="text-sm text-purple-600 font-medium">{variation.proteinSubstitution}</div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                    expandedVariation === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedVariation === idx && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                  {variation.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{variation.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Modified Ingredients:</h4>
                    <ul className="space-y-1">
                      {variation.modifiedIngredients.map((ingredient, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-purple-600">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Modified Instructions:</h4>
                    <ol className="space-y-2">
                      {variation.modifiedInstructions.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
