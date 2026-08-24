'use client';

import { Activity, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function Header({ title, subtitle, badge }: HeaderProps) {
  return (
    <header className="py-6 px-8 border-b border-slate-800/80 bg-surface-300/40 backdrop-blur flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          {badge && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          <span>Factual Grounding Active</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200 border border-slate-800 font-mono">
          <Activity className="w-4 h-4 text-brand-blue" />
          <span>Deterministic</span>
        </div>
      </div>
    </header>
  );
}
