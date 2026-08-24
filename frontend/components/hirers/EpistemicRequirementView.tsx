'use client';

import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Lock, 
  Heart, 
  Package, 
  Compass, 
  Quote 
} from 'lucide-react';
import { 
  RequirementItem, 
  ConstraintItem, 
  PreferenceItem, 
  DeliverableItem, 
  AssumptionItem, 
  UnknownItem, 
  AmbiguityItem, 
  ContradictionItem 
} from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface EpistemicRequirementViewProps {
  knownRequirements: RequirementItem[];
  hardConstraints: ConstraintItem[];
  preferences: PreferenceItem[];
  deliverables: DeliverableItem[];
  assumptions: AssumptionItem[];
  unknowns: UnknownItem[];
  ambiguities: AmbiguityItem[];
  contradictions: ContradictionItem[];
}

export function EpistemicRequirementView({
  knownRequirements,
  hardConstraints,
  preferences,
  deliverables,
  assumptions,
  unknowns,
  ambiguities,
  contradictions,
}: EpistemicRequirementViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. Hard Constraints */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Hard Operational Constraints ({hardConstraints.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hardConstraints.map((c) => (
            <div
              key={c.constraint_id}
              className="p-4 rounded-xl bg-surface-200/60 border border-rose-500/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="rose">{c.constraint_type.toUpperCase()}</Badge>
                <span className="text-[10px] font-mono text-rose-400">HARD CONSTRAINT</span>
              </div>
              <p className="text-sm font-medium text-white">{c.value}</p>
              {c.source_quote && (
                <p className="text-xs text-slate-400 italic bg-surface-300/60 p-2 rounded-lg border border-slate-800">
                  {`"${c.source_quote}"`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Explicit Known Requirements */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Explicit Capability Requirements ({knownRequirements.length})
          </h3>
        </div>
        <div className="space-y-3">
          {knownRequirements.map((r) => (
            <div
              key={r.requirement_id}
              className="p-4 rounded-xl bg-surface-200/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{r.dimension.replace(/_/g, ' ')}</Badge>
                  <span className="text-xs font-mono text-slate-400">Importance: {r.importance}</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  CLAIM / REQUIREMENT
                </span>
              </div>
              <p className="text-sm text-slate-200">{r.description}</p>
              {r.source_quote && (
                <div className="flex items-start gap-2 text-xs text-slate-400 bg-surface-300/80 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{`"${r.source_quote}"`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Preferences & Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soft Preferences */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Preferences ({preferences.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {preferences.map((p) => (
              <div
                key={p.preference_id}
                className="p-3.5 rounded-xl bg-surface-200/40 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="indigo">PREFERENCE</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.is_flexible ? 'Flexible' : 'Strict'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{p.description}</p>
                {p.source_quote && (
                  <p className="text-[11px] text-slate-400 italic">{`"${p.source_quote}"`}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Deliverables ({deliverables.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {deliverables.map((d) => (
              <div
                key={d.deliverable_id}
                className="p-3.5 rounded-xl bg-surface-200/40 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="emerald">DELIVERABLE</Badge>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {d.turnaround_expectation}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Assumptions & Unknowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Operational Assumptions ({assumptions.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {assumptions.map((a) => (
              <div
                key={a.assumption_id}
                className="p-4 rounded-xl bg-surface-200/40 border border-amber-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber">ASSUMPTION</Badge>
                  <span className="text-[10px] font-mono text-amber-400">{a.assumption_id}</span>
                </div>
                <p className="text-xs font-medium text-slate-200">{a.description}</p>
                <div className="text-[11px] text-slate-400 font-mono space-y-1 bg-surface-300/60 p-2.5 rounded-lg border border-slate-800">
                  <div><span className="text-slate-500">Rationale:</span> {a.rationale}</div>
                  <div><span className="text-rose-400/80">Risk Impact:</span> {a.risk_impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unknowns */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Unresolved Unknowns ({unknowns.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {unknowns.map((u) => (
              <div
                key={u.unknown_id}
                className="p-4 rounded-xl bg-surface-200/40 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="slate">UNKNOWN</Badge>
                  {u.is_decision_critical && (
                    <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                      DECISION CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-300">{u.description}</p>
                <div className="text-[11px] text-slate-400 font-mono bg-surface-300/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Why it matters:</span> {u.why_it_matters}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Contradictions & Ambiguities */}
      {(contradictions.length > 0 || ambiguities.length > 0) && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-rose" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Detected Ambiguities & Structural Tensions
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {contradictions.map((c) => (
              <div
                key={c.contradiction_id}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="rose">CONTRADICTION</Badge>
                  <span className="text-[10px] font-mono text-rose-400">{c.contradiction_id}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2 rounded bg-surface-400 border border-slate-800">
                    <span className="text-rose-400 font-mono">Statement A:</span> {c.statement_a}
                  </div>
                  <div className="p-2 rounded bg-surface-400 border border-slate-800">
                    <span className="text-rose-400 font-mono">Statement B:</span> {c.statement_b}
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono pt-1">
                  <span className="text-slate-500">Impact on Decision:</span> {c.impact_on_decision}
                </p>
              </div>
            ))}

            {ambiguities.map((a) => (
              <div
                key={a.ambiguity_id}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber">AMBIGUITY</Badge>
                  <span className="text-[10px] font-mono text-amber-400">{a.ambiguity_id}</span>
                </div>
                <p className="text-xs text-slate-200 italic">{`"${a.statement}"`}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-500">Possible Interpretations:</span>{' '}
                  {a.possible_interpretations.join(' OR ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
