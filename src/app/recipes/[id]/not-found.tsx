import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900">Recipe Not Found</h1>
      <p className="text-gray-600">The recipe you're looking for doesn't exist or has been deleted.</p>
      <Link
        href="/recipes"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Browse All Recipes
      </Link>
    </div>
  );
}
