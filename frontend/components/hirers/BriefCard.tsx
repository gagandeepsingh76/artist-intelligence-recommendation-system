'use client';

import Link from 'next/link';
import { FileText, ArrowRight, MessageSquare, Mail, Phone, Clock, MapPin, AlertCircle } from 'lucide-react';
import { HirerBriefSummary } from '@/lib/types';
import { formatCategoryName } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface BriefCardProps {
  brief: HirerBriefSummary;
}

export function BriefCard({ brief }: BriefCardProps) {
  const getChannelIcon = () => {
    switch (brief.channel) {
      case 'whatsapp':
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-sky-400" />;
      case 'phone_notes':
        return <Phone className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Link
      href={`/hirers/${brief.brief_id}`}
      className="group block p-5 rounded-2xl bg-surface-200/60 border border-slate-800 hover:border-brand-indigo/50 hover:bg-surface-200 transition-all shadow-sm hover:shadow-lg hover:shadow-brand-indigo/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-brand-indigo">{brief.brief_id}</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 capitalize px-2 py-0.5 rounded bg-surface-300 border border-slate-800">
              {getChannelIcon()} {brief.channel.replace(/_/g, ' ')}
            </span>
          </div>
          <h3 className="font-semibold text-base text-white group-hover:text-brand-indigo transition mt-1.5">
            {brief.hirer_name} &bull; <span className="text-slate-300">{formatCategoryName(brief.target_category)}</span>
          </h3>
        </div>

        <Badge variant="indigo">{formatCategoryName(brief.target_category)}</Badge>
      </div>

      <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
        {brief.situation}
      </p>

      {/* Context Details */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{brief.timeline}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{brief.location}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
        <div className="p-1.5 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-sky-400 font-mono">
            {brief.known_requirements_count}
          </div>
          <div className="text-[10px] text-slate-400">Known</div>
        </div>
        <div className="p-1.5 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-rose-400 font-mono">
            {brief.hard_constraints_count}
          </div>
          <div className="text-[10px] text-slate-400">Constraints</div>
        </div>
        <div className="p-1.5 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-slate-400 font-mono">
            {brief.unknowns_count}
          </div>
          <div className="text-[10px] text-slate-400">Unknowns</div>
        </div>
        <div className="p-1.5 rounded-lg bg-surface-300/50">
          <div className="text-xs font-semibold text-amber-400 font-mono">
            {brief.contradictions_count}
          </div>
          <div className="text-[10px] text-slate-400">Conflicts</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200 transition">
        <span>Inspect Requirements</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
      </div>
    </Link>
  );
}
