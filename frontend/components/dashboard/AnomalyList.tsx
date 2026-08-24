'use client';

import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DetectedAnomalyGroup } from '@/lib/types';

interface AnomalyListProps {
  anomalies?: DetectedAnomalyGroup[];
}

export function AnomalyList({ anomalies }: AnomalyListProps) {
  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-200/50 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-amber" />
          <span>Documented Dataset & Identifier Anomalies ({anomalies.length})</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Preserved Factual Inconsistencies</span>
      </div>

      <div className="space-y-3">
        {anomalies.map((a, idx) => (
          <div
            key={a.artist_folder || idx}
            className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 hover:border-slate-700 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="amber">{a.artist_folder}</Badge>
                <span className="text-xs font-mono text-slate-400 capitalize">{a.category}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {a.anomalies?.length || 0} {a.anomalies?.length === 1 ? 'Anomaly' : 'Anomalies'}
              </span>
            </div>
            {a.anomalies && a.anomalies.length > 0 && (
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono text-[11px] pt-1">
                {a.anomalies.map((msg, mIdx) => (
                  <li key={mIdx} className="leading-relaxed">
                    {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

