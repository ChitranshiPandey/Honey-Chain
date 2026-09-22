"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-2xl mb-3">Something went wrong</div>
        <p className="text-sm text-muted mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
