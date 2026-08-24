'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { TopTwoComparison } from '@/components/recommendations/TopTwoComparison';
import { TradeOffCard } from '@/components/recommendations/TradeOffCard';
import { RefinementQuestionsCard } from '@/components/recommendations/RefinementQuestionsCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { RecommendationDetail, RecommendationSummary } from '@/lib/types';
import { Sparkles, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RecommendationsPage() {
  const [summaries, setSummaries] = useState<RecommendationSummary[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState<string>('01_cafe_music_whatsapp');
  const [selectedDetail, setSelectedDetail] = useState<RecommendationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  // Load summaries once
  const loadSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecommendations();
      setSummaries(data);
      if (data.length > 0 && !selectedBriefId) {
        setSelectedBriefId(data[0].brief_id);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load selected brief detail
  const loadDetail = async (briefId: string) => {
    if (!briefId) return;
    setDetailLoading(true);
    try {
      const data = await api.getRecommendationDetail(briefId);
      setSelectedDetail(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  useEffect(() => {
    if (selectedBriefId) {
      loadDetail(selectedBriefId);
    }
  }, [selectedBriefId]);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title="Decision Intelligence & Recommendations"
        subtitle="Transparent Top 2 recommendations, evidence citations, comparative trade-offs, and refinement questions."
        badge="Top 2 Selection Active"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {loading && <LoadingState message="Fetching recommendation intelligence..." isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Recommendations Unavailable"
            message={error}
            onRetry={loadSummaries}
          />
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Brief Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {summaries.map((s) => {
                const isSelected = selectedBriefId === s.brief_id;
                return (
                  <button
                    key={s.brief_id}
                    onClick={() => setSelectedBriefId(s.brief_id)}
                    className={cn(
                      'p-4 rounded-2xl text-left transition border flex flex-col justify-between space-y-2',
                      isSelected
                        ? 'bg-brand-emerald/10 border-brand-emerald/50 shadow-md shadow-emerald-950/20'
                        : 'bg-surface-200/60 border-slate-800 hover:border-slate-700 hover:bg-surface-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-brand-emerald">
                        {s.brief_id.split('_')[0]} Brief
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {s.top_two[0]?.artist_id} &amp; {s.top_two[1]?.artist_id}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white">{s.hirer_name}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{s.summary_of_need}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Brief Decision Dossier */}
            {detailLoading && <LoadingState message="Loading decision dossier..." />}

            {!detailLoading && selectedDetail && (
              <div className="space-y-6">
                {/* Brief Header Card */}
                <div className="p-6 rounded-2xl bg-surface-200/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                        DECISION BRIEF: {selectedDetail.brief_id}
                      </span>
                      <span className="text-xs text-slate-400">Hirer: {selectedDetail.hirer_name}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {selectedDetail.summary_of_need}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/hirers/${selectedDetail.brief_id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 text-white text-xs font-medium border border-slate-700 transition"
                    >
                      View Source Brief
                    </Link>

                    {selectedDetail.brief_id.includes('cafe') && (
                      <Link
                        href="/reranking"
                        className="px-3 py-1.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/80 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-500/20"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-Ranking</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Top 2 Recommendations Comparison */}
                <TopTwoComparison topTwo={selectedDetail.top_two} />

                {/* Comparative Trade-Offs */}
                <TradeOffCard tradeOffs={selectedDetail.trade_off_analysis} />

                {/* Targeted Refinement Questions (Max 2) */}
                <RefinementQuestionsCard questions={selectedDetail.refinement_questions} />

                {/* Explicit Assumptions & Uncertainties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-surface-200/40 border border-amber-500/30 space-y-2">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                      Explicit Assumptions Made:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {selectedDetail.assumptions_made.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-200/40 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Key Uncertainties:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {selectedDetail.key_uncertainties.map((u, idx) => (
                        <li key={idx}>{u}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
