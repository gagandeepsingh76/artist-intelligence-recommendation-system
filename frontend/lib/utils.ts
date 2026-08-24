import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategoryName(category: string): string {
  switch (category?.toLowerCase()) {
    case 'photographer':
      return 'Photographer';
    case 'musician':
      return 'Musician';
    case 'video_editor':
      return 'Video Editor';
    default:
      return category || 'Unknown';
  }
}

export function getConfidenceBadgeClass(confidence: string): string {
  switch (confidence?.toUpperCase()) {
    case 'HIGH':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'LOW':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function getEpistemicStateBadgeClass(state: string): string {
  switch (state?.toUpperCase()) {
    case 'DEMONSTRATED_EVIDENCE':
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    case 'CLAIM':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    case 'ASSUMPTION':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'UNKNOWN':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
