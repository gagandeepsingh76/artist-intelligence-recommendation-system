'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { DemonstratedEvidenceView } from '@/components/artists/DemonstratedEvidenceView';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { ArtistDetail } from '@/lib/types';
import { formatCategoryName, getConfidenceBadgeClass } from '@/lib/utils';
import { ArrowLeft, Camera, Music, Video, ShieldAlert, Folder } from 'lucide-react';
import Link from 'next/link';

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params?.id as string;

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadArtist = async () => {
    if (!artistId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getArtistDetail(artistId);
      setArtist(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load artist details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtist();
  }, [artistId]);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title={`Artist Dossier: ${artistId}`}
        subtitle="Complete evidence breakdown, profile claims, and demonstrated portfolio media."
        badge={artist ? `${artist.confidence} Confidence` : undefined}
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <Link
          href="/artists"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Artists Explorer
        </Link>

        {loading && <LoadingState message={`Fetching intelligence dossier for ${artistId}...`} isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Artist Profile Not Found"
            message={error}
            onRetry={loadArtist}
          />
        )}

        {!loading && !error && artist && (
          <div className="space-y-6">
            {/* Identity & Metadata Banner */}
            <div className="p-6 rounded-2xl bg-surface-200/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded border border-brand-blue/20">
                    {artist.artist_id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Category: {formatCategoryName(artist.category)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mt-1">
                  {artist.declared_name || artist.source_folder_name}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                  <Folder className="w-3.5 h-3.5 text-slate-500" />
                  <span>Raw Folder: {artist.source_folder_name}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-mono px-3 py-1 rounded-full border ${getConfidenceBadgeClass(artist.confidence)}`}>
                  {artist.confidence} OVERALL CONFIDENCE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Identifier: {artist.identifier_status}
                </span>
              </div>
            </div>

            {/* Documented Anomaly Banner if present */}
            {artist.discrepancies_and_anomalies && artist.discrepancies_and_anomalies.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Documented Anomaly / Discrepancy Note:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 font-mono space-y-0.5 text-[11px]">
                  {artist.discrepancies_and_anomalies.map((disc, idx) => (
                    <li key={idx}>{disc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Epistemic Breakdown View */}
            <DemonstratedEvidenceView
              demonstratedCapabilities={artist.demonstrated_capabilities}
              profileClaims={artist.profile_claims}
              unknowns={artist.unknowns}
            />
          </div>
        )}
      </div>
    </div>
  );
}
