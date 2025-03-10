"use client";

import { useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Head>
        <title>500 - Server Error | EPUB Reader Online</title>
        <meta
          name="description"
          content="Something went wrong on our end. Please try again or return to the homepage of EPUB Reader Online."
        />
        <link rel="canonical" href="https://epubreader.online/500" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Server Error
          </h2>
          <p className="text-gray-600 mb-8">
            Something went wrong on our end. Please try again later.
          </p>
          <div className="space-x-4">
            <button
              onClick={reset}
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
