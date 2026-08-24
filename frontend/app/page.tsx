'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { DatasetSummaryCard } from '@/components/dashboard/DatasetSummaryCard';
import { AnomalyList } from '@/components/dashboard/AnomalyList';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { DatasetSummary, SystemStatus } from '@/lib/types';
import { ArrowRight, Sparkles, Users, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setIsColdStart(false);

    try {
      const [sumData, statusData] = await Promise.all([
        api.getDatasetSummary(),
        api.getSystemStatus(),
      ]);
      setSummary(sumData);
      setSystemStatus(statusData);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load dataset summary');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title="Intelligence Console Dashboard"
        subtitle="Overview of dataset foundation, scanned artist portfolios, hirer briefs, and artifacts."
        badge="Phase 1–6 Verified"
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {loading && <LoadingState message="Connecting to Artist Intelligence API..." isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Backend Service Connection"
            message={error}
            onRetry={loadData}
          />
        )}

        {!loading && !error && summary && (
          <>
            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/artists"
                className="p-5 rounded-2xl bg-surface-200/40 border border-slate-800 hover:border-brand-blue/50 hover:bg-surface-200/80 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-blue transition">
                      Artist Intelligence
                    </h4>
                    <p className="text-xs text-slate-400">15 artists & portfolios</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/hirers"
                className="p-5 rounded-2xl bg-surface-200/40 border border-slate-800 hover:border-brand-indigo/50 hover:bg-surface-200/80 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-indigo/10 text-brand-indigo">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-indigo transition">
                      Hirer Briefs
                    </h4>
                    <p className="text-xs text-slate-400">4 briefs + 1 update</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/recommendations"
                className="p-5 rounded-2xl bg-surface-200/40 border border-slate-800 hover:border-brand-emerald/50 hover:bg-surface-200/80 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-emerald/10 text-brand-emerald">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-emerald transition">
                      Decision Intelligence
                    </h4>
                    <p className="text-xs text-slate-400">Top 2 & Trade-offs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Dataset Statistics Grid */}
            <DatasetSummaryCard summary={summary} />

            {/* Documented Anomalies */}
            <AnomalyList anomalies={summary.detected_anomalies} />
          </>
        )}
      </div>
    </div>
  );
}
