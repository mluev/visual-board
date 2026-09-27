import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Inline } from '@/kit/primitives/RichText';

const HUES = [195, 290, 45, 250, 340, 130];

export function Formula({ title, parts, calc }: BlockProps<'Formula'>) {
  const [a, setA] = useState<number | null>(null);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries((calc?.vars ?? []).map((v) => [v.sym, v.value])));

  let ti = -1;
  const termIdx = parts.map((p) => (p.name ? ++ti : -1));
  const hue = (i: number) => HUES[termIdx[i] % HUES.length];
  const col = (i: number) => `oklch(0.48 0.13 ${hue(i)})`;

  let result = '';
  if (calc) {
    try {
      const r = calc.f(vals);
      result = Number.isFinite(r) ? (Math.abs(r) >= 1e6 || (Math.abs(r) < 1e-3 && r !== 0) ? r.toExponential(3) : (+r.toFixed(3)).toLocaleString('en-GB')) : '—';
    } catch {
      result = '—';
    }
  }

  return (
    <BlockCard tone="teal" pill="Formula" title={title}>
      <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-[18px] bg-tone-soft px-4 py-7 font-serif text-[54px] leading-[1.1] italic">
        {parts.map((p, i) =>
          p.name ? (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setA(i)}
              onClick={() => setA(i)}
              className="rounded-[10px] border-0 bg-transparent px-1 py-0 [font:inherit] transition-colors"
              style={{ color: a == null || a === i ? col(i) : '#B5B9C1', boxShadow: `inset 0 -4px 0 ${a === i ? `oklch(0.85 0.08 ${hue(i)})` : 'transparent'}` }}
            >
              {p.t}
            </button>
          ) : (
            <span key={i} className="text-ink-3 not-italic">{p.t}</span>
          ),
        )}
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
        {parts.map((p, i) =>
          p.name ? (
            <button
              key={i}
              type="button"
              onClick={() => setA(a === i ? null : i)}
              className="flex items-start gap-3 rounded-[14px] border-2 px-3 py-2.5 text-left text-ink"
              style={{ background: a === i ? `oklch(0.97 0.02 ${hue(i)})` : 'var(--subtle)', borderColor: a === i ? col(i) : 'var(--subtle)' }}
            >
              <span className="min-w-7 font-serif text-[26px] leading-none italic" style={{ color: col(i) }}>{p.t}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold">{p.name}</span>
                {p.note && <span className="text-sm leading-[1.4] text-pretty text-ink-2"><Inline text={p.note} /></span>}
              </span>
            </button>
          ) : null,
        )}
      </div>
      {calc && (
        <div className="flex flex-wrap items-end gap-3 border-t border-page pt-4">
          <span className="w-full text-sm font-bold text-ink-3">Try it</span>
          {calc.vars.map((v) => (
            <label key={v.sym} className="flex flex-col gap-1 text-[13px] font-medium text-ink-3">
              <span>{v.label ?? v.sym}</span>
              <input
                type="number"
                value={vals[v.sym]}
                onChange={(e) => setVals((s) => ({ ...s, [v.sym]: e.target.value === '' ? 0 : +e.target.value }))}
                className="w-[110px] rounded-[10px] border-2 border-[#E2E4E9] px-2.5 py-2 text-base text-ink outline-none focus:border-tone"
              />
            </label>
          ))}
          <span className="pb-2 text-[22px] text-ink-4">→</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-ink-3">{calc.label}</span>
            <span className="font-display text-[28px] font-bold text-tone-ink tabular-nums">{result}</span>
          </div>
        </div>
      )}
    </BlockCard>
  );
}
