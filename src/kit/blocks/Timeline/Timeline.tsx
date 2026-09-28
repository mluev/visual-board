import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { RichText } from '@/kit/primitives/RichText';
import { cn } from '@/kit/lib/utils';

const year = (s: string) => {
  const m = /-?\d{3,4}/.exec(s);
  if (!m) return null;
  return /\bBC\b|BCE/i.test(s) ? -Number(m[0]) : Number(m[0]);
};

export function Timeline({ title, events }: BlockProps<'Timeline'>) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => Math.max(0, Math.min(events.length - 1, x + d)));
  const cur = events[i];
  const prev = events[i - 1];
  const gap = prev && year(cur.date) != null && year(prev.date) != null ? year(cur.date)! - year(prev.date)! : null;
  const arrow = 'size-9 rounded-full border-0 bg-subtle text-base text-ink disabled:opacity-35';

  return (
    <BlockCard
      tone="teal"
      pill="Timeline"
      title={title}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : null)}
      aside={
        <div className="flex gap-1.5">
          <button type="button" aria-label="Previous" disabled={i === 0} onClick={() => go(-1)} className={arrow}>←</button>
          <button type="button" aria-label="Next" disabled={i === events.length - 1} onClick={() => go(1)} className={arrow}>→</button>
        </div>
      }
    >
      <div className="overflow-x-auto pb-1">
        <div className="relative grid grid-flow-col pt-2 pb-1" style={{ gridAutoColumns: 'minmax(120px,1fr)', minWidth: events.length * 120 }}>
          <div className="absolute inset-x-0 top-[57px] h-1 rounded-sm bg-[oklch(0.92_0.03_195)]" />
          <div className="absolute top-[57px] left-0 h-1 rounded-sm bg-tone transition-[width] duration-300" style={{ width: events.length > 1 ? `${((i + 0.5) / events.length) * 100}%` : '50%' }} />
          {events.map((e, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-current={k === i} className="relative flex flex-col items-center gap-2 border-0 bg-transparent px-1 text-ink">
              <span className={cn('h-5 text-sm font-bold whitespace-nowrap tabular-nums', k === i ? 'text-tone-ink' : 'text-ink-3')}>{e.date}</span>
              <span
                className="my-2 size-[22px] rounded-full border-4 transition-transform duration-200"
                style={{ background: k <= i ? 'var(--tone)' : '#FFFFFF', borderColor: k === i ? 'oklch(0.85 0.07 195)' : k < i ? 'var(--tone)' : 'oklch(0.85 0.05 195)', transform: k === i ? 'scale(1.25)' : undefined }}
              />
              <span className={cn('text-center text-sm leading-[1.3] font-medium text-balance', k === i ? 'text-ink' : 'text-ink-3')}>{e.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-tone-soft px-[18px] py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-display text-2xl font-bold tracking-[-.01em]">{cur.title}</span>
          <span className="text-[15px] font-bold text-tone-ink">{cur.date}</span>
        </div>
        {cur.body && <RichText text={cur.body} className="text-base leading-[1.55] text-ink-2" />}
        {gap != null && gap > 0 && <span className="text-sm text-ink-3">{gap} years after {prev!.title}</span>}
      </div>
    </BlockCard>
  );
}
