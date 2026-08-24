'use client';

import { HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { RefinementQuestion } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface RefinementQuestionsCardProps {
  questions: RefinementQuestion[];
}

export function RefinementQuestionsCard({ questions }: RefinementQuestionsCardProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-surface-200/40 border border-slate-800 text-xs text-slate-400">
        No refinement questions necessary for this brief.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-200/90 via-surface-200/60 to-surface-200/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Targeted Refinement Questions (Max 2)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
          High Decision Impact
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q) => (
          <div
            key={q.question_id}
            className="p-4 rounded-xl bg-surface-300/90 border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <Badge variant="indigo">{q.question_id}</Badge>
              <span className="text-xs font-semibold text-white">Target Question</span>
            </div>
            <p className="text-xs text-slate-100 font-medium leading-relaxed bg-surface-400/80 p-3 rounded-lg border border-slate-800">
              {`"${q.question_text}"`}
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 font-mono">
              <div>
                <span className="text-slate-500">Why it matters:</span> {q.why_it_matters}
              </div>
              <div className="text-indigo-300">
                <span className="text-slate-500">Potential Ranking Impact:</span> {q.potential_ranking_impact}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
