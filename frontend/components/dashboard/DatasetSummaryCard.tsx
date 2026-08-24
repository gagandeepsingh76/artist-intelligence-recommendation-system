'use client';

import { 
  Users, 
  FileText, 
  Film, 
  AlertOctagon, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { DatasetSummary } from '@/lib/types';

interface DatasetSummaryCardProps {
  summary: DatasetSummary;
}

export function DatasetSummaryCard({ summary }: DatasetSummaryCardProps) {
  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Artists */}
        <div className="p-5 rounded-2xl bg-surface-200/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Artists</span>
            <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">{summary.total_artists}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-mono">5 Photo</span> •{' '}
              <span className="text-indigo-400 font-mono">5 Music</span> •{' '}
              <span className="text-purple-400 font-mono">5 Video</span>
            </div>
          </div>
        </div>

        {/* Total Hirer Briefs */}
        <div className="p-5 rounded-2xl bg-surface-200/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hirer Briefs</span>
            <div className="p-2 rounded-xl bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">{summary.total_hirer_briefs}</div>
            <p className="text-xs text-slate-400 mt-2">
              4 initial briefs + 1 follow-up update
            </p>
          </div>
        </div>

        {/* Media Files Scanned */}
        <div className="p-5 rounded-2xl bg-surface-200/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Media Files</span>
            <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">{summary.total_media_files}</div>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Images, Audio & Video Portfolios
            </p>
          </div>
        </div>

        {/* Detected Anomalies */}
        <div className="p-5 rounded-2xl bg-surface-200/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dataset Anomalies</span>
            <div className="p-2 rounded-xl bg-brand-amber/10 text-brand-amber border border-brand-amber/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">{summary.detected_anomalies_count}</div>
            <p className="text-xs text-amber-400/90 mt-2">
              Preserved & traceable in inventory
            </p>
          </div>
        </div>
      </div>

      {/* Artifact Pipeline Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-200/90 via-surface-200/60 to-surface-200/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-blue" />
            <span>Processed Pipeline Artifacts Readiness</span>
          </h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Artifact Verification
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
            <div className="text-slate-400 font-mono text-[11px]">Phase 1 & 2</div>
            <div className="font-medium text-slate-200 mt-1">dataset_inventory.json</div>
            <div className="text-emerald-400 text-[10px] mt-1 font-mono">149 Files Extracted</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
            <div className="text-slate-400 font-mono text-[11px]">Phase 3</div>
            <div className="font-medium text-slate-200 mt-1">artist_intelligence.jsonl</div>
            <div className="text-emerald-400 text-[10px] mt-1 font-mono">15 Artists Evaluated</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
            <div className="text-slate-400 font-mono text-[11px]">Phase 4</div>
            <div className="font-medium text-slate-200 mt-1">hirer_intelligence.json</div>
            <div className="text-emerald-400 text-[10px] mt-1 font-mono">4 Briefs + 1 Follow-Up</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
            <div className="text-slate-400 font-mono text-[11px]">Phase 5</div>
            <div className="font-medium text-slate-200 mt-1">recommendations.json</div>
            <div className="text-emerald-400 text-[10px] mt-1 font-mono">Top 2 + Re-Ranking</div>
          </div>
        </div>
      </div>
    </div>
  );
}
