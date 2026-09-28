import { useEffect, useRef, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { derange } from '@/kit/lib/format';
import { cn } from '@/kit/lib/utils';

const HUES = [85, 195, 290, 45, 250, 340, 130, 20, 160, 310];

export function Matching({ title, pairs, mono, initial }: BlockProps<'Matching'>) {
  const res = useBlockResult();
  const n = pairs.length;
  const [seed, setSeed] = useState(7);
  const [order, setOrder] = useState(() => derange(n, 7));
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>(initial === 'done' ? [...Array(n).keys()] : []);
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState<number[]>(() => (initial === 'done' ? pairs.map((_, i) => (i === 1 ? 2 : 0)) : pairs.map(() => 0)));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const done = matched.length === n;
  const total = misses.reduce((a, b) => a + b, 0);

  const pickRight = (i: number) => {
    if (matched.includes(i) || sel == null) return;
    if (sel === i) {
      const m = [...matched, i];
      setMatched(m);
      setSel(null);
      setWrong(null);
      if (m.length === n)
        void res.submit({
          score: misses.filter((x) => x === 0).length,
          total: n,
          items: pairs.map((p, k) => ({ prompt: p.left, answer: p.right, expected: p.right, correct: misses[k] === 0, note: misses[k] ? `${misses[k]} wrong ${misses[k] === 1 ? 'try' : 'tries'}` : undefined })),
          meta: { wrongTries: total },
        });
    } else {
      setMisses((ms) => Object.assign([...ms], { [sel]: ms[sel] + 1 }));
      setWrong(i);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setWrong(null), 600);
    }
  };
  const reset = () => {
    const s = seed + 13;
    setSeed(s);
    setOrder(derange(n, s));
    setSel(null);
    setMatched([]);
    setWrong(null);
    setMisses(pairs.map(() => 0));
  };

  const cell = (i: number, side: 'l' | 'r') => {
    const mi = matched.indexOf(i);
    if (mi >= 0) {
      const h = HUES[mi % HUES.length];
      return { background: `oklch(0.96 0.03 ${h})`, borderColor: `oklch(0.7 0.1 ${h})`, color: 'var(--ink-2)' };
    }
    if (side === 'l' && sel === i) return { background: 'var(--tone-tint)', borderColor: 'var(--tone)' };
    if (side === 'r' && wrong === i) return { background: 'var(--bad-soft)', borderColor: 'var(--bad)' };
    return { background: 'var(--subtle)', borderColor: 'var(--subtle)' };
  };
  const btn = 'min-h-[52px] rounded-[14px] border-2 px-[14px] py-3 text-left text-base font-medium text-ink transition-[background,border-color] duration-150';

  return (
    <BlockCard tone="gold" pill="Match" title={title} aside={<Counter>{matched.length} / {n} matched</Counter>}>
      <div className="text-[15px] text-ink-3">{done ? 'All pairs matched.' : sel == null ? 'Pick an item on the left, then its match on the right.' : 'Now pick its match on the right.'}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div className="flex flex-col gap-2">
          {pairs.map((p, i) => (
            <button key={i} type="button" aria-pressed={sel === i} className={cn(btn, mono && 'font-mono text-[15px]')} style={cell(i, 'l')} onClick={() => !matched.includes(i) && (setSel(sel === i ? null : i), setWrong(null))}>
              <Inline text={p.left} />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {order.map((i) => (
            <button key={i} type="button" className={btn} style={cell(i, 'r')} onClick={() => pickRight(i)}>
              <Inline text={pairs[i].right} />
            </button>
          ))}
        </div>
      </div>
      {done && (
        <Footer>
          <ScoreLine score={`${Math.round((n / (n + total)) * 100)}%`} line={total ? `${n} pairs, ${total} wrong ${total === 1 ? 'try' : 'tries'}.` : `${n} pairs, no mistakes.`} />
          <Button variant="soft" onClick={reset}>Shuffle and retry</Button>
        </Footer>
      )}
    </BlockCard>
  );
}
