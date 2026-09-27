import { useEffect, useMemo, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Inline } from '@/kit/primitives/RichText';
import { Slider } from '@/kit/ui/slider';

const SPEEDS = [0.5, 1, 2];

export function Stepper({ title, steps, bars }: BlockProps<'Stepper'>) {
  const S = useMemo(() => (typeof steps === 'function' ? steps() : steps), [steps]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sp, setSp] = useState(1);
  const last = S.length - 1;
  const st = S[Math.min(i, last)];
  const max = Math.max(1, ...S.flatMap((s) => s.cells.map(Number).filter((x) => !Number.isNaN(x))));

  useEffect(() => {
    if (!playing) return;
    if (i >= last) return setPlaying(false);
    const t = setTimeout(() => setI((x) => Math.min(last, x + 1)), 900 / SPEEDS[sp]);
    return () => clearTimeout(t);
  }, [playing, sp, last, i]);

  const go = (d: number) => {
    setPlaying(false);
    setI((x) => Math.max(0, Math.min(last, x + d)));
  };
  const round = 'size-10 rounded-full border-0 bg-subtle text-base text-ink';

  return (
    <BlockCard
      tone="teal"
      pill="Step through"
      title={title}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === ' ') {
          e.preventDefault();
          setPlaying((p) => !p);
        }
      }}
      aside={<span className="text-sm font-medium text-ink-3 tabular-nums">Step {i + 1} / {S.length}</span>}
    >
      <div className="flex flex-col gap-2.5 rounded-2xl bg-tone-soft px-4 pt-[18px] pb-3">
        <div className="grid items-end gap-2" style={{ height: bars ? 180 : 64, gridTemplateColumns: `repeat(${st.cells.length},minmax(0,1fr))` }}>
          {st.cells.map((v, k) => {
            const hl = st.hl?.includes(k);
            const sw = st.swap?.includes(k);
            const dn = st.done?.includes(k);
            const bg = sw ? 'oklch(0.6 0.16 45)' : hl ? 'var(--tone)' : dn ? 'oklch(0.9 0.05 155)' : '#FFFFFF';
            const border = hl ? 'var(--tone)' : sw ? 'oklch(0.6 0.16 45)' : dn ? 'oklch(0.75 0.09 155)' : 'oklch(0.88 0.04 195)';
            return (
              <div key={k} className="flex h-full flex-col justify-end">
                <div
                  className="flex items-start justify-center rounded-[10px] border-2 pt-1.5 text-[17px] font-bold tabular-nums transition-[height,background] duration-300"
                  style={{ height: bars && !Number.isNaN(Number(v)) ? Math.max(40, (Number(v) / max) * 170) : 56, background: bg, borderColor: border, color: hl || sw ? '#FFFFFF' : 'var(--ink)' }}
                >
                  {v}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${st.cells.length},minmax(0,1fr))` }}>
          {st.cells.map((_, k) => (
            <div key={k} className="flex min-h-[34px] flex-col items-center gap-0.5">
              <span className="font-mono text-xs text-ink-4">{k}</span>
              <span className="font-mono text-xs font-medium text-tone-ink">{st.ptr?.[k] ?? ''}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-h-[60px] flex-col gap-1.5">
        <span className="text-[17px] leading-[1.45] font-medium text-pretty"><Inline text={st.caption} /></span>
        {st.vars && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(st.vars).map(([k, v]) => (
              <span key={k} className="rounded-lg bg-subtle px-2 py-1 font-mono text-[13px]">{k} = {String(v)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[14px]">
        <div className="flex gap-1.5">
          <button type="button" aria-label="Restart" onClick={() => { setPlaying(false); setI(0); }} className={round}>⟲</button>
          <button type="button" aria-label="Back" onClick={() => go(-1)} className={round}>←</button>
          <button
            type="button"
            onClick={() => {
              if (!playing && i >= last) setI(0);
              setPlaying(!playing);
            }}
            className="h-10 min-w-[88px] rounded-full border-0 bg-tone px-[18px] text-[15px] font-bold text-white"
          >
            {playing ? 'Pause' : i >= last ? 'Replay' : 'Play'}
          </button>
          <button type="button" aria-label="Forward" onClick={() => go(1)} className={round}>→</button>
        </div>
        <Slider
          aria-label="Step"
          min={0}
          max={last}
          step={1}
          value={[i]}
          onValueChange={(v) => {
            setPlaying(false);
            setI(Array.isArray(v) ? v[0] : (v as number));
          }}
          className="[&_[data-slot=slider-range]]:bg-tone [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-tone [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-tone-tint"
        />
        <button type="button" onClick={() => setSp((s) => (s + 1) % SPEEDS.length)} className="rounded-full border-0 bg-subtle px-3 py-[9px] text-sm font-bold text-ink tabular-nums">{SPEEDS[sp]}×</button>
      </div>
    </BlockCard>
  );
}
