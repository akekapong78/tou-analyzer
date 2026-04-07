import React from "react";

interface LoadingOverlayProps {
  open: boolean;
  label?: string;
}

export default function LoadingOverlay({ open, label = "Processing..." }: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="flex min-h-[150px] min-w-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-sm">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-purple-200 border-t-purple-700 text-purple-700"
          role="status"
          aria-label="Loading"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-transparent border-t-current" />
        </div>
        <p className="text-center text-sm font-semibold text-gray-700">
          {label}
        </p>
      </div>
    </div>
  );
}
