import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Inline } from '@/kit/primitives/RichText';
import { cn } from '@/kit/lib/utils';

export function Annotated({ title, text, notes, mono }: BlockProps<'Annotated'>) {
  const [a, setA] = useState(0);
  const hits: { at: number; end: number; i: number }[] = [];
  notes.forEach((n, i) => {
    const at = text.indexOf(n.mark);
    if (at >= 0 && !hits.some((h) => at < h.end && at + n.mark.length > h.at)) hits.push({ at, end: at + n.mark.length, i });
  });
  hits.sort((x, y) => x.at - y.at);
  const segs: { t: string; i?: number }[] = [];
  let last = 0;
  for (const h of hits) {
    if (h.at > last) segs.push({ t: text.slice(last, h.at) });
    segs.push({ t: text.slice(h.at, h.end), i: h.i });
    last = h.end;
  }
  if (last < text.length) segs.push({ t: text.slice(last) });
  const go = (d: number) => setA((x) => (x + d + notes.length) % notes.length);

  return (
    <BlockCard
      tone="teal"
      pill="Annotated"
      title={title}
      aside={
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-ink-3 tabular-nums">{a + 1} / {notes.length}</span>
          <button type="button" aria-label="Previous note" onClick={() => go(-1)} className="size-[34px] rounded-full border-0 bg-subtle text-[15px] text-ink">←</button>
          <button type="button" aria-label="Next note" onClick={() => go(1)} className="size-[34px] rounded-full border-0 bg-subtle text-[15px] text-ink">→</button>
        </div>
      }
    >
      <div className="grid items-start gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))' }}>
        <div className={cn('overflow-x-auto rounded-[14px] p-4 whitespace-pre-wrap', mono ? 'bg-ink font-mono text-sm leading-[1.7] text-[#C9CBCF]' : 'bg-subtle text-[17px] leading-[1.8] text-ink')}>
          {segs.map((s, k) => {
            if (s.i == null) return <span key={k}>{s.t}</span>;
            const on = s.i === a;
            return (
              <span
                key={k}
                onMouseEnter={() => setA(s.i!)}
                onClick={() => setA(s.i!)}
                className="cursor-pointer rounded-[5px] px-0.5 py-px transition-colors"
                style={{ background: on ? 'var(--tone)' : mono ? 'oklch(0.32 0.04 195)' : 'oklch(0.93 0.04 195)', color: on ? '#FFFFFF' : mono ? '#ECEDEE' : 'var(--ink)', boxShadow: `0 2px 0 ${on ? 'transparent' : 'oklch(0.7 0.1 195)'}` }}
              >
                {s.t}
                <sup className="ml-0.5 font-sans text-[10px] font-bold" style={{ color: on ? '#FFFFFF' : 'oklch(0.75 0.08 195)' }}>{s.i + 1}</sup>
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {notes.map((n, i) => {
            const on = i === a;
            return (
              <button key={i} type="button" onClick={() => setA(i)} className={cn('flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-[15px] leading-[1.45] text-ink transition-colors', on ? 'border-tone bg-tone-soft' : 'border-page bg-surface')}>
                <span className={cn('flex size-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold', on ? 'bg-tone text-white' : 'bg-subtle text-ink-2')}>{i + 1}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-[13px] font-medium [overflow-wrap:anywhere] text-tone-ink">{n.mark}</span>
                  <span className="text-pretty"><Inline text={n.note} /></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </BlockCard>
  );
}
