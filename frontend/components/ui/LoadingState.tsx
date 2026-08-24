'use client';

import { Loader2, Server } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  isColdStart?: boolean;
}

export function LoadingState({
  message = 'Loading intelligence artifacts...',
  isColdStart = false,
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center bg-surface-200/30 rounded-2xl border border-slate-800/80">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-blue/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{message}</h3>
      {isColdStart && (
        <div className="mt-3 max-w-md p-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-xs text-slate-300 flex items-start gap-2.5">
          <Server className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <p className="text-left leading-relaxed">
            The intelligence service is warming up. This takes a few seconds on cold starts.
          </p>
        </div>
      )}
    </div>
  );
}
