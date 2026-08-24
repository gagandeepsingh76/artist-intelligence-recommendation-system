'use client';

import { RefreshCw, ArrowRight, CheckCircle2, AlertCircle, Minus } from 'lucide-react';
import { ReRankingResult } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { getConfidenceBadgeClass } from '@/lib/utils';

interface RerankingViewProps {
  reranking: ReRankingResult;
}

export function RerankingView({ reranking }: RerankingViewProps) {
  return (
    <div className="space-y-8">
      {/* Follow-Up Context Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-indigo/15 via-surface-200/90 to-surface-200 border border-brand-indigo/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-indigo" />
            <h3 className="text-base font-bold text-white">
              Follow-Up Update Analysis: {reranking.follow_up_update_id}
            </h3>
          </div>
          <Badge variant="indigo">FOR BRIEF: {reranking.brief_id}</Badge>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed bg-surface-300/80 p-3.5 rounded-xl border border-slate-800">
          {reranking.follow_up_summary}
        </p>

        <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-brand-indigo uppercase tracking-wider text-[11px] block">
            Parameter Shifts Detected:
          </span>
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-surface-400/80 p-3 rounded-lg border border-slate-800">
            {reranking.what_changed}
          </pre>
        </div>
      </div>

      {/* Side-by-Side Comparison: Initial vs Updated Ranking */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Before vs After Top 2 Recommendation Snapshot
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INITIAL RANKING */}
          <div className="p-6 rounded-2xl bg-surface-200/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Stage 1</span>
                <h4 className="text-sm font-bold text-slate-200">Initial Ambient Brief</h4>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-surface-300 px-2.5 py-1 rounded border border-slate-700">
                ₹7k–₹9k / 3 hrs
              </span>
            </div>

            <div className="space-y-3">
              {reranking.initial_top_two.map((c) => (
                <div
                  key={c.artist_id}
                  className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono">
                        RANK #{c.rank}
                      </span>
                      <span className="font-semibold text-sm text-white">{c.artist_name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getConfidenceBadgeClass(c.confidence)}`}>
                      {c.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.fit_reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UPDATED RE-RANKING */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-brand-emerald/10 via-surface-200/90 to-surface-200 border-2 border-brand-emerald/40 space-y-4 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Stage 2</span>
                <h4 className="text-sm font-bold text-white">Updated Launch Night Brief</h4>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 font-bold">
                ₹15k / 45m Headline
              </span>
            </div>

            <div className="space-y-3">
              {reranking.updated_top_two.map((c) => (
                <div
                  key={c.artist_id}
                  className="p-4 rounded-xl bg-surface-300/90 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-emerald text-slate-950 font-mono">
                        RANK #{c.rank}
                      </span>
                      <span className="font-semibold text-sm text-white">{c.artist_name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getConfidenceBadgeClass(c.confidence)}`}>
                      {c.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{c.fit_reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rank Movement & Explanations */}
      <div className="p-6 rounded-2xl bg-surface-200/50 border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
          Rank Movements & Decision Rationale
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reranking.rank_movements.map((m) => (
            <div
              key={m.artist_id}
              className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{m.artist_name}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-400 text-indigo-300 border border-slate-700">
                  Rank {m.previous_rank} &rarr; Rank {m.updated_rank} ({m.movement})
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{m.reason}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-surface-300/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <span className="text-brand-blue font-semibold block mb-1">Comprehensive Delta Explanation:</span>
          {reranking.why_ranking_changed}
        </div>
      </div>
    </div>
  );
}
