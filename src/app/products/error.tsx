"use client";

import { useEffect } from "react";

export default function ProductsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Products page error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16 text-gray-900">
      <div className="mx-auto w-full max-w-md rounded-xl border border-gray-100 bg-white p-6">
        <div className="text-sm font-semibold text-gray-900">
          Something went wrong
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Please try again. If the problem persists, the catalog database may be
          unavailable.
        </div>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:border-amber-700 hover:text-amber-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

