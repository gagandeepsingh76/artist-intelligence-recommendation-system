'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load intelligence data',
  message = 'An unexpected error occurred while communicating with the backend.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center bg-brand-rose/5 rounded-2xl border border-brand-rose/30">
      <div className="w-12 h-12 rounded-2xl bg-brand-rose/10 flex items-center justify-center mb-4 text-brand-rose">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-50 text-white text-sm font-medium border border-slate-700 transition"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
