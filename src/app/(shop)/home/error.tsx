"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-linen px-5 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-bold text-charcoal mb-2">Something went wrong!</h2>
      <p className="text-sm text-charcoal-secondary mb-6 max-w-sm">
        We encountered an error loading the home page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-sm"
      >
        <RefreshCw size={18} />
        Try again
      </button>
    </div>
  );
}
