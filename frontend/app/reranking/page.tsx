'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { RerankingView } from '@/components/recommendations/RerankingView';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { ReRankingResult } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RerankingPage() {
  const [reranking, setReranking] = useState<ReRankingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadReranking = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUpdatedRecommendation('01_cafe_music_whatsapp');
      setReranking(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load follow-up re-ranking result');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReranking();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title="Follow-Up Update & Re-Ranking View"
        subtitle="Transparent evaluation of requirements changes, rank movement, and parameter deltas."
        badge="Update: 01_cafe_music_update"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <Link
          href="/recommendations"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recommendations
        </Link>

        {loading && <LoadingState message="Fetching follow-up update re-ranking intelligence..." isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Re-Ranking Data Unavailable"
            message={error}
            onRetry={loadReranking}
          />
        )}

        {!loading && !error && reranking && (
          <RerankingView reranking={reranking} />
        )}
      </div>
    </div>
  );
}
