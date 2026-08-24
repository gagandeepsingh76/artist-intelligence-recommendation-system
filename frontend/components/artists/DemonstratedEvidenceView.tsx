'use client';

import { CheckCircle2, FileText, Film, Image as ImageIcon, Music, HelpCircle } from 'lucide-react';
import { DemonstratedCapability, ProfileClaim, UnknownCapability } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface DemonstratedEvidenceViewProps {
  demonstratedCapabilities: DemonstratedCapability[];
  profileClaims: ProfileClaim[];
  unknowns: UnknownCapability[];
}

export function DemonstratedEvidenceView({
  demonstratedCapabilities,
  profileClaims,
  unknowns,
}: DemonstratedEvidenceViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. Demonstrated Capabilities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <h3 className="text-base font-semibold text-white">
              Demonstrated Capabilities ({demonstratedCapabilities.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            Backed by Media Evidence
          </span>
        </div>

        <div className="space-y-3">
          {demonstratedCapabilities.map((cap) => (
            <div
              key={cap.capability_id}
              className="p-5 rounded-2xl bg-surface-200/60 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{cap.dimension.replace(/_/g, ' ')}</Badge>
                  <span className="text-xs font-mono text-slate-400">Strength: {cap.evidence_strength}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">{cap.description}</p>

              {/* Citations block */}
              {cap.evidence_citations && cap.evidence_citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Evidence Citations:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {cap.evidence_citations.map((cit) => (
                      <div
                        key={cit.evidence_id}
                        className="p-3 rounded-xl bg-surface-300/80 border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-mono text-indigo-300 font-medium flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5 text-slate-400" /> {cit.file_name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{cit.timestamp_or_frame}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{cit.citation_text}</p>
                        {cit.observed_features && cit.observed_features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {cit.observed_features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-400 text-slate-300 border border-slate-800"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Self-Reported Profile Claims Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <h3 className="text-base font-semibold text-white">
              Self-Reported Profile Claims ({profileClaims.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
            Unverified Profile Statements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profileClaims.map((claim) => (
            <div
              key={claim.claim_id}
              className="p-4 rounded-xl bg-surface-200/40 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="blue">{claim.dimension.replace(/_/g, ' ')}</Badge>
                <span className="text-[10px] font-mono text-slate-400">CLAIM</span>
              </div>
              <p className="text-xs text-slate-300 italic">{`"${claim.statement}"`}</p>
              <div className="text-[10px] font-mono text-slate-400">
                Source: {claim.source_context}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Unknown Capabilities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <h3 className="text-base font-semibold text-white">
              Unknown Dimensions ({unknowns.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
            Neutral / No Evidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {unknowns.map((ukn) => (
            <div
              key={ukn.unknown_id}
              className="p-4 rounded-xl bg-surface-200/20 border border-slate-800/60 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <Badge variant="slate">{ukn.dimension.replace(/_/g, ' ')}</Badge>
                <span className="text-[10px] font-mono text-slate-400">UNKNOWN</span>
              </div>
              <p className="text-xs text-slate-400">{ukn.description}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                Reason: {ukn.reason}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
