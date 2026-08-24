'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { EpistemicRequirementView } from '@/components/hirers/EpistemicRequirementView';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { HirerBriefDetail } from '@/lib/types';
import { formatCategoryName } from '@/lib/utils';
import { ArrowLeft, Clock, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HirerDetailPage() {
  const params = useParams();
  const briefId = params?.id as string;

  const [brief, setBrief] = useState<HirerBriefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadBrief = async () => {
    if (!briefId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHirerBriefDetail(briefId);
      setBrief(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load hirer brief details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
  }, [briefId]);

  const hasFollowUp = briefId.includes('cafe') || briefId.includes('01');

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title={`Hirer Brief: ${brief?.hirer_name || briefId}`}
        subtitle={`Structured requirements and epistemic analysis for ${brief?.target_category ? formatCategoryName(brief.target_category) : 'artist search'}.`}
        badge={brief?.channel}
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/hirers"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hirer Briefs
          </Link>

          <Link
            href={`/recommendations`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-emerald/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-brand-emerald/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> View Matching Recommendations
          </Link>
        </div>

        {loading && <LoadingState message={`Fetching structured brief for ${briefId}...`} isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Hirer Brief Not Found"
            message={error}
            onRetry={loadBrief}
          />
        )}

        {!loading && !error && brief && (
          <div className="space-y-6">
            {/* Context & Metadata Banner */}
            <div className="p-6 rounded-2xl bg-surface-200/80 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded border border-brand-indigo/20">
                      {brief.brief_id}
                    </span>
                    <span className="text-xs font-mono text-slate-400 capitalize">
                      Channel: {brief.channel.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mt-1">
                    {brief.hirer_name} &bull; {formatCategoryName(brief.target_category)} Brief
                  </h1>
                </div>

                {hasFollowUp && (
                  <Link
                    href="/reranking"
                    className="px-3.5 py-2 rounded-xl bg-brand-indigo text-white text-xs font-semibold flex items-center gap-2 hover:bg-brand-indigo/80 transition self-start md:self-auto shadow-md shadow-indigo-500/20"
                  >
                    <span>Inspect Follow-Up Re-Ranking</span>
                  </Link>
                )}
              </div>

              {/* Context Summary */}
              <div className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Hirer Context & Situation:
                </span>
                <p className="text-slate-200 leading-relaxed">{brief.context.situation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Timeline: {brief.context.target_date_or_timeline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Location: {brief.context.location_or_venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Epistemic Requirements Breakdown */}
            <EpistemicRequirementView
              knownRequirements={brief.known_requirements}
              hardConstraints={brief.hard_constraints}
              preferences={brief.preferences}
              deliverables={brief.deliverables}
              assumptions={brief.assumptions}
              unknowns={brief.unknowns}
              ambiguities={brief.ambiguities}
              contradictions={brief.contradictions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
