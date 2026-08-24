'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { BriefCard } from '@/components/hirers/BriefCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { HirerBriefSummary } from '@/lib/types';
import { FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HirersPage() {
  const [briefs, setBriefs] = useState<HirerBriefSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadBriefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHirerBriefs();
      setBriefs(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load hirer briefs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefs();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title="Hirer Intent & Brief Explorer"
        subtitle="Structured requirements, hard constraints, and context from real hirer conversations."
        badge="4 Briefs + 1 Follow-Up"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Quick link to follow up */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-indigo/20 via-surface-200 to-surface-200 border border-brand-indigo/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-indigo/10 text-brand-indigo">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Dynamic Follow-Up Re-Ranking Available</h4>
              <p className="text-[11px] text-slate-400">
                Brief 01 (Rhea Cafe Music) contains a follow-up requirement update.
              </p>
            </div>
          </div>
          <Link
            href="/reranking"
            className="px-3 py-1.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/80 text-white text-xs font-medium transition"
          >
            View Re-Ranking
          </Link>
        </div>

        {loading && <LoadingState message="Fetching structured hirer briefs..." isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Hirer Briefs Unavailable"
            message={error}
            onRetry={loadBriefs}
          />
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {briefs.map((brief) => (
              <BriefCard key={brief.brief_id} brief={brief} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
