import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-400 border-slate-700/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border font-mono tracking-tight',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
