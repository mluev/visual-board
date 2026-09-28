import type { ReactNode } from 'react';
import { cn } from '@/kit/lib/utils';
import { useBoardReview } from '@/kit/results/store';
import { RichText } from './RichText';

/** Page column for a board. */
export function BoardShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <main className={cn('mx-auto flex flex-col gap-5 px-6 pt-10 pb-16', wide ? 'max-w-[1400px]' : 'max-w-[1160px]')}>{children}</main>;
}

/** Kicker ("Go · Lesson 3"), big title, meta pills. */
export function BoardHeader({ kicker, title, meta, children }: { kicker?: string; title: string; meta?: string[]; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 px-2 pb-2">
      <div className="flex flex-col gap-1.5">
        {kicker && <span className="text-sm font-bold text-ink-3">{kicker}</span>}
        <h1 className="m-0 font-display text-[44px] leading-[1.05] font-bold tracking-[-.025em] text-balance">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {meta?.map((m) => (
          <span key={m} className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium">{m}</span>
        ))}
        {children}
      </div>
    </header>
  );
}

/** Board-level AI feedback (reviews/<board>.json → board.feedback). */
export function BoardFeedback() {
  const r = useBoardReview();
  if (!r?.feedback) return null;
  return (
    <aside data-tone="ink" className="flex flex-col gap-2 rounded-card border-2 border-dashed border-ink-4 bg-surface p-5 animate-in fade-in">
      <span className="text-[13px] font-bold text-ink-3">Tutor feedback</span>
      <RichText text={r.feedback} className="text-base leading-normal text-ink-2" />
    </aside>
  );
}

/** Responsive block grid: as many 460px+ columns as fit. */
export function BlockGrid({ children, min = 460 }: { children: ReactNode; min?: number }) {
  return <div className="grid items-stretch gap-4" style={{ gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))` }}>{children}</div>;
}

export function GridItem({ span, children }: { span?: 'full'; children: ReactNode }) {
  return <div className="min-w-0" style={span === 'full' ? { gridColumn: '1 / -1' } : undefined}>{children}</div>;
}
