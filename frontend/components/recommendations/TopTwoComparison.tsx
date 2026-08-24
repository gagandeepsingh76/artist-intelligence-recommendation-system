'use client';

import { Trophy, Medal, CheckCircle2, Film, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CandidateRecommendation } from '@/lib/types';
import { formatCategoryName, getConfidenceBadgeClass } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface TopTwoComparisonProps {
  topTwo: [CandidateRecommendation, CandidateRecommendation];
}

export function TopTwoComparison({ topTwo }: TopTwoComparisonProps) {
  const [rank1, rank2] = topTwo;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rank 1 Card (Highlighted Primary Candidate) */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-brand-emerald/10 via-surface-200/90 to-surface-200 border-2 border-brand-emerald/40 relative shadow-xl shadow-emerald-950/20 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-emerald text-slate-950 font-mono tracking-wider shadow-sm">
                <Trophy className="w-3.5 h-3.5" /> RANK #1 PRIMARY
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {rank1.artist_id}</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getConfidenceBadgeClass(rank1.confidence)}`}>
              {rank1.confidence} CONFIDENCE
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{rank1.artist_name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{formatCategoryName(rank1.category)}</p>
          </div>

          {/* Fit Reason Narrative */}
          <div className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            <span className="text-emerald-400 font-semibold uppercase text-[11px] block mb-1">Strongest Fit Reason:</span>
            {rank1.fit_reason}
          </div>

          {/* Matched Capabilities */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Requirement-by-Requirement Evidence Chain:
            </span>
            <div className="space-y-2">
              {rank1.matched_requirements.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-300/50 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300 font-medium">{m.dimension.replace(/_/g, ' ')}</span>
                    <Badge variant={m.match_status.includes('STRONG') ? 'emerald' : 'blue'}>
                      {m.match_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-[11px]">{m.fit_explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Media Citations */}
          {rank1.supporting_evidence && rank1.supporting_evidence.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Direct Portfolio Citations:
              </span>
              <div className="space-y-1.5">
                {rank1.supporting_evidence.map((cit) => (
                  <div
                    key={cit.evidence_id}
                    className="p-2.5 rounded-lg bg-surface-400/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5 text-indigo-300">
                      <Film className="w-3.5 h-3.5 text-slate-400" /> {cit.file_name}
                    </span>
                    <span className="text-slate-500">{cit.timestamp_or_frame}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade-offs & Limitations */}
          {rank1.trade_offs && rank1.trade_offs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
              <span className="text-amber-400 font-semibold text-[11px] block">Operational Considerations:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                {rank1.trade_offs.map((to, idx) => (
                  <li key={idx}>{to}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <Link
            href={`/artists/${rank1.artist_id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <span>Inspect Full Artist Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Rank 2 Card (Secondary Candidate) */}
      <div className="p-6 rounded-2xl bg-surface-200/80 border border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200 font-mono tracking-wider">
                <Medal className="w-3.5 h-3.5 text-slate-400" /> RANK #2 RUNNER-UP
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {rank2.artist_id}</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getConfidenceBadgeClass(rank2.confidence)}`}>
              {rank2.confidence} CONFIDENCE
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{rank2.artist_name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{formatCategoryName(rank2.category)}</p>
          </div>

          {/* Fit Reason Narrative */}
          <div className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            <span className="text-slate-400 font-semibold uppercase text-[11px] block mb-1">Comparative Fit Reason:</span>
            {rank2.fit_reason}
          </div>

          {/* Matched Capabilities */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Requirement-by-Requirement Evidence Chain:
            </span>
            <div className="space-y-2">
              {rank2.matched_requirements.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-300/50 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300 font-medium">{m.dimension.replace(/_/g, ' ')}</span>
                    <Badge variant={m.match_status.includes('STRONG') ? 'emerald' : (m.match_status.includes('UNKNOWN') ? 'slate' : 'blue')}>
                      {m.match_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-[11px]">{m.fit_explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Media Citations */}
          {rank2.supporting_evidence && rank2.supporting_evidence.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Direct Portfolio Citations:
              </span>
              <div className="space-y-1.5">
                {rank2.supporting_evidence.map((cit) => (
                  <div
                    key={cit.evidence_id}
                    className="p-2.5 rounded-lg bg-surface-400/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5 text-indigo-300">
                      <Film className="w-3.5 h-3.5 text-slate-400" /> {cit.file_name}
                    </span>
                    <span className="text-slate-500">{cit.timestamp_or_frame}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade-offs & Limitations */}
          {rank2.trade_offs && rank2.trade_offs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
              <span className="text-amber-400 font-semibold text-[11px] block">Operational Considerations:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                {rank2.trade_offs.map((to, idx) => (
                  <li key={idx}>{to}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <Link
            href={`/artists/${rank2.artist_id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <span>Inspect Full Artist Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
