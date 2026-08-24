'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Sparkles, 
  RefreshCw,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Console Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Artist Intelligence', href: '/artists', icon: Users },
  { name: 'Hirer Briefs', href: '/hirers', icon: FileText },
  { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
  { name: 'Follow-Up Re-Ranking', href: '/reranking', icon: RefreshCw },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-300 border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
            AIRS <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-blue font-mono border border-brand-blue/30">v1.0</span>
          </h1>
          <p className="text-xs text-slate-400">Artist Intelligence System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence Explorer
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-blue/15 text-white border border-brand-blue/30 shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-200/70 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-brand-blue' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Epistemic System Footnote */}
      <div className="p-4 m-3 rounded-xl bg-surface-200/50 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Epistemic Isolation
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Claims <code className="text-sky-300">CLAIM</code> isolated from verified media evidence <code className="text-indigo-300">DEMONSTRATED</code>.
        </p>
      </div>
    </aside>
  );
}
