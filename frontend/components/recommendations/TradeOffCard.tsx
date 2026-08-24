'use client';

import { Scale, ArrowLeftRight } from 'lucide-react';
import { TradeOffItem } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface TradeOffCardProps {
  tradeOffs: TradeOffItem[];
}

export function TradeOffCard({ tradeOffs }: TradeOffCardProps) {
  if (!tradeOffs || tradeOffs.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-200/50 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Comparative Trade-Off Analysis (Rank 1 vs Rank 2)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Objective Decision Trade-Offs</span>
      </div>

      <div className="space-y-3">
        {tradeOffs.map((to, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant="indigo">{to.dimension.replace(/_/g, ' ')}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-400 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-mono font-semibold text-[11px]">Rank 1 Status:</span>
                <p className="text-slate-200 leading-relaxed">{to.rank_1_status}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-400 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono font-semibold text-[11px]">Rank 2 Status:</span>
                <p className="text-slate-200 leading-relaxed">{to.rank_2_status}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-brand-blue">Decision Implication:</span>{' '}
                {to.decision_implication}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
