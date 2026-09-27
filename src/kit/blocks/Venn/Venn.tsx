import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Segmented } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { ScoreLine } from '@/kit/primitives/Practice';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

const HUES = [195, 290, 45];
/** Geometry in a 100 × 62 box: circle centres, radius, label and region anchor positions. */
const GEO = {
  2: { c: [[38, 31], [62, 31]], r: 22, lab: [[24, 6], [76, 6]], reg: { '0': [27, 31], '1': [73, 31], '0,1': [50, 31], '': [8, 56] } as Record<string, number[]> },
  3: { c: [[40, 24], [60, 24], [50, 40]], r: 18, lab: [[22, 5], [78, 5], [50, 60]], reg: { '0': [32, 18], '1': [68, 18], '2': [50, 50], '0,1': [50, 13], '0,2': [38, 37], '1,2': [62, 37], '0,1,2': [50, 29], '': [8, 56] } as Record<string, number[]> },
};
const key = (a: number[]) => [...a].sort().join(',');
const pctY = (y: number) => `${(y / 62) * 100}%`;

export function Venn({ title, sets, items, initial }: BlockProps<'Venn'>) {
  const res = useBlockResult();
  const n = sets.length === 3 ? 3 : 2;
  const G = GEO[n];
  const [mode, setMode] = useState<'view' | 'practice'>(initial);
  const [place, setPlace] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<number | null>(initial === 'practice' ? 0 : null);
  const [checked, setChecked] = useState(false);
  const pr = mode === 'practice';

  const switchMode = (m: 'view' | 'practice') => {
    setMode(m);
    setPlace({});
    setSel(m === 'practice' ? 0 : null);
    setChecked(false);
  };
  const onArea = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pr || sel == null || checked) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.width) * 100;
    const inside = G.c.map((c, i) => (Math.hypot(x - c[0], y - c[1]) <= G.r ? i : -1)).filter((i) => i >= 0);
    const np = { ...place, [sel]: key(inside) };
    setPlace(np);
    const next = items.findIndex((_, i) => np[i] == null);
    setSel(next >= 0 ? next : null);
  };

  const regions: Record<string, { text: string; i: number }[]> = {};
  items.forEach((it, i) => {
    const k = pr ? place[i] : key(it.in);
    if (k == null) return;
    (regions[k] ??= []).push({ text: it.text, i });
  });
  const right = items.filter((it, i) => place[i] === key(it.in)).length;
  const left = items.filter((_, i) => place[i] == null).length;
  const names = (k: string) => (k ? k.split(',').map((s) => sets[+s]).join(' + ') : 'none');

  const check = () => {
    if (left) return;
    setChecked(true);
    void res.submit({ score: right, total: items.length, items: items.map((it, i) => ({ prompt: it.text, answer: names(place[i]), expected: names(key(it.in)), correct: place[i] === key(it.in) })) });
  };

  return (
    <BlockCard tone="teal" pill="Venn" title={title} className="gap-[14px]" aside={<Segmented value={mode} onChange={switchMode} options={[{ value: 'view', label: 'View' }, { value: 'practice', label: 'Sort it yourself' }]} className="[&_button]:px-3" />}>
      {pr && !checked && left > 0 && (
        <div className="flex flex-col gap-2 rounded-[14px] bg-subtle p-3">
          <span className="text-sm text-ink-3">{sel != null ? `Click where "${items[sel].text}" belongs in the diagram (outside every circle = none).` : 'Pick an item.'}</span>
          <div className="flex flex-wrap gap-1.5">
            {items.map((it, i) =>
              place[i] == null ? (
                <button key={i} type="button" onClick={() => setSel(i)} className={cn('rounded-full border-2 px-3 py-1.5 text-sm font-medium text-ink', sel === i ? 'border-tone bg-tone-tint' : 'border-[#E2E4E9] bg-surface')}>
                  {it.text}
                </button>
              ) : null,
            )}
          </div>
        </div>
      )}
      <div onClick={onArea} className={cn('relative w-full overflow-hidden rounded-2xl border border-page bg-[#FCFCFD]', pr && sel != null && !checked && 'cursor-crosshair')} style={{ aspectRatio: '100 / 62' }}>
        {G.c.map((c, i) => (
          <div
            key={i}
            className="pointer-events-none absolute -translate-1/2 rounded-full border-2 transition-colors"
            style={{ left: `${c[0]}%`, top: pctY(c[1]), width: `${G.r * 2}%`, height: pctY(G.r * 2), background: `oklch(0.7 0.1 ${HUES[i]} / .16)`, borderColor: `oklch(0.6 0.1 ${HUES[i]})` }}
          />
        ))}
        {sets.slice(0, n).map((name, i) => (
          <span key={i} className="pointer-events-none absolute -translate-1/2 text-sm font-bold whitespace-nowrap" style={{ left: `${G.lab[i][0]}%`, top: pctY(G.lab[i][1]), color: `oklch(0.42 0.1 ${HUES[i]})` }}>
            {name}
          </span>
        ))}
        {Object.entries(regions).map(([k, list]) => {
          const p = G.reg[k] ?? G.reg[''];
          return (
            <div key={k} className="pointer-events-none absolute flex -translate-1/2 flex-col items-center gap-[3px]" style={{ left: `${p[0]}%`, top: pctY(p[1]) }}>
              {list.map(({ text, i }) => {
                const ok = place[i] === key(items[i].in);
                return (
                  <span key={i} className={cn('rounded-full border-[1.5px] px-2 py-0.5 text-[13px] font-medium whitespace-nowrap text-ink', pr && checked ? (ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft') : 'border-[#D5D8DE] bg-surface')}>
                    {text}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      {pr && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {checked ? (
            <>
              <ScoreLine score={`${right}/${items.length}`} line={right === items.length ? 'All in the right region.' : 'Items in red are in the wrong region. Switch to View to see where they belong.'} />
              <Button variant="soft" onClick={() => switchMode('practice')}>Try again</Button>
            </>
          ) : (
            <>
              <span className="text-[15px] text-ink-3">{left ? `${left} left to place` : 'All placed'}</span>
              <Button disabled={left > 0} onClick={check}>Check</Button>
            </>
          )}
        </div>
      )}
    </BlockCard>
  );
}
