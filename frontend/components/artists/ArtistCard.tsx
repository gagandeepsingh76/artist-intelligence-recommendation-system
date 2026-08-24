'use client';

import Link from 'next/link';
import { Camera, Music, Video, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { ArtistSummary } from '@/lib/types';
import { formatCategoryName, getConfidenceBadgeClass } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ArtistCardProps {
  artist: ArtistSummary;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const getCategoryIcon = () => {
    switch (artist.category) {
      case 'photographer':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'musician':
        return <Music className="w-4 h-4 text-indigo-400" />;
      case 'video_editor':
        return <Video className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const hasAnomaly = artist.discrepancies_and_anomalies && artist.discrepancies_and_anomalies.length > 0;

  return (
    <Link
      href={`/artists/${artist.artist_id}`}
      className="group block p-5 rounded-2xl bg-surface-200/60 border border-slate-800 hover:border-brand-blue/50 hover:bg-surface-200 transition-all shadow-sm hover:shadow-lg hover:shadow-brand-blue/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-300 border border-slate-800 group-hover:border-slate-700 transition">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-brand-blue">{artist.artist_id}</span>
              <span className="text-xs text-slate-400 font-mono">({formatCategoryName(artist.category)})</span>
            </div>
            <h3 className="font-semibold text-sm text-white group-hover:text-brand-blue transition mt-0.5">
              {artist.declared_name || artist.source_folder_name}
            </h3>
          </div>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getConfidenceBadgeClass(artist.confidence)}`}>
          {artist.confidence} CONF
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
        <div className="p-2 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-indigo-300 font-mono">
            {artist.demonstrated_capabilities_count}
          </div>
          <div className="text-[10px] text-slate-400">Demonstrated</div>
        </div>
        <div className="p-2 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-sky-300 font-mono">
            {artist.profile_claims_count}
          </div>
          <div className="text-[10px] text-slate-400">Claims</div>
        </div>
        <div className="p-2 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-slate-400 font-mono">
            {artist.unknowns_count}
          </div>
          <div className="text-[10px] text-slate-400">Unknowns</div>
        </div>
      </div>

      {/* Anomalies alert if present */}
      {hasAnomaly && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-mono bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Identity / Dataset Anomaly Documented</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200 transition">
        <span>View Full Profile</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
      </div>
    </Link>
  );
}
