import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { cn } from '@/kit/lib/utils';

export function CompareTable({ title, columns, rows, note, initial }: BlockProps<'CompareTable'>) {
  const [hover, setHover] = useState(-1);
  const [quiz, setQuiz] = useState(initial === 'quiz');
  const [shown, setShown] = useState<string[]>([]);
  const total = rows.length * columns.length;
  const hov = (i: number) => ({ onMouseEnter: () => setHover(i), onMouseLeave: () => setHover(-1) });

  return (
    <BlockCard
      tone="teal"
      pill="Compare"
      title={title}
      aside={
        <div className="flex items-center gap-2">
          {quiz && <span className="text-sm font-medium text-ink-3">{shown.length} / {total} revealed</span>}
          <Button variant={quiz ? 'plain' : 'tone'} size="sm" className="px-[14px]" onClick={() => { setQuiz(!quiz); setShown([]); }}>
            {quiz ? 'Show all' : 'Quiz me'}
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `minmax(110px,0.7fr) repeat(${columns.length}, minmax(160px,1fr))`, minWidth: 110 + columns.length * 160 }}>
          <div />
          {columns.map((c, i) => (
            <div key={c} {...hov(i)} className={cn('rounded-t-[14px] px-[14px] py-3 font-display text-[19px] font-bold transition-colors', hover === i && 'bg-tone-soft')}>{c}</div>
          ))}
          {rows.map((r, ri) => (
            <div key={ri} className="contents">
              <div className="border-t border-page py-3 pr-[14px] text-sm font-bold text-ink-3">{r.label}</div>
              {columns.map((_, ci) => {
                const key = `${ri}:${ci}`;
                const open = !quiz || shown.includes(key);
                return (
                  <div
                    key={ci}
                    {...hov(ci)}
                    onClick={() => !open && setShown((s) => [...s, key])}
                    className={cn('border-t border-page px-[14px] py-3 text-base leading-[1.45] text-pretty transition-colors', hover === ci && 'bg-tone-soft', !open && 'cursor-pointer')}
                  >
                    {open ? <Inline text={r.values[ci] ?? '—'} /> : <span className="inline-block rounded-lg bg-[oklch(0.9_0.04_195)] px-2.5 py-[3px] text-[13px] font-bold text-[oklch(0.35_0.08_195)]">Recall, then tap</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {note && <RichText text={note} className="text-[15px] leading-normal text-ink-2" />}
    </BlockCard>
  );
}
