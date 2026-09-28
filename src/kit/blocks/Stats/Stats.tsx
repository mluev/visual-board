import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { cn } from '@/kit/lib/utils';

const TREND = { up: ['▲', 'text-ok'], down: ['▼', 'text-bad'], flat: ['▬', 'text-ink-4'] } as const;

export function Stats({ label, title, items, tone }: BlockProps<'Stats'>) {
  return (
    <BlockCard tone={tone} pill={label} title={title}>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
        {items.map((s, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-2xl bg-tone-soft p-4">
            <span className="text-[13px] font-bold text-tone-ink">{s.label}</span>
            <span className="flex items-baseline gap-2 font-display text-[34px] leading-none font-bold tracking-[-.02em] tabular-nums">
              {typeof s.value === 'number' && Math.abs(s.value) >= 10000 ? s.value.toLocaleString('en-GB') : s.value}
              {s.trend && <span className={cn('text-sm', TREND[s.trend][1])}>{TREND[s.trend][0]}</span>}
            </span>
            {s.note && <span className="text-[13px] text-ink-3">{s.note}</span>}
          </div>
        ))}
      </div>
    </BlockCard>
  );
}
