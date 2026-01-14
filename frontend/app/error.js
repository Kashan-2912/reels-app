'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="w-24 h-24 mx-auto text-red-500 mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Server Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
