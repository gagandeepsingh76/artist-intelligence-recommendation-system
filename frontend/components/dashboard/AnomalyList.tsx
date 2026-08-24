'use client';

import { AlertTriangle, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AnomalyListProps {
  anomalies: Array<{
    anomaly_id: string;
    entity_id: string;
    anomaly_type: string;
    description: string;
    evidence: string;
    canonical_resolution: string;
  }>;
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

      <div className="space-y-2.5">
        {anomalies.map((a) => (
          <div
            key={a.anomaly_id}
            className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="amber">{a.entity_id}</Badge>
                <span className="text-xs font-semibold text-slate-200">{a.anomaly_type.replace(/_/g, ' ')}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{a.anomaly_id}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{a.description}</p>
            <div className="text-[11px] text-slate-400 font-mono bg-surface-400/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">Resolution:</span> {a.canonical_resolution}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
