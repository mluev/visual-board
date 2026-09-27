import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { RichText } from '@/kit/primitives/RichText';
import { Slider } from '@/kit/ui/slider';
import { SERIES_COLORS } from '@/kit/lib/chart';

const ticks = (lo: number, hi: number) => {
  const s0 = (hi - lo) / 6;
  const m = Math.pow(10, Math.floor(Math.log10(s0)));
  const f = s0 / m;
  const st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m;
  const t: number[] = [];
  for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) t.push(+v.toFixed(6));
  return t;
};
const fmt = (v: number) => (Math.abs(v) >= 100 ? Math.round(v) : +v.toFixed(2));
const safe = (f: () => number) => {
  try {
    return f();
  } catch {
    return NaN;
  }
};

export function FunctionPlot({ title, fns, params, x: [x0, x1], y: [y0, y1], formula, note }: BlockProps<'FunctionPlot'>) {
  const init = () => Object.fromEntries(params.map((d) => [d.name, d.value]));
  const [p, setP] = useState<Record<string, number>>(init);
  const [hx, setHx] = useState<number | null>(null);
  const sx = (x: number) => (x - x0) / (x1 - x0);
  const sy = (y: number) => 1 - (y - y0) / (y1 - y0);
  const zeroX = Math.min(1, Math.max(0, sx(0)));
  const zeroY = Math.min(1, Math.max(0, sy(0)));
  const color = (i: number) => fns[i].color ?? SERIES_COLORS[i % SERIES_COLORS.length];

  const curves = fns.map((fn) => {
    const segs: string[][] = [[]];
    for (let k = 0; k <= 400; k++) {
      const x = x0 + (k / 400) * (x1 - x0);
      const y = safe(() => fn.f(x, p));
      if (Number.isFinite(y)) segs[segs.length - 1].push(`${(sx(x) * 1000).toFixed(1)},${(Math.max(-2, Math.min(3, sy(y))) * 750).toFixed(1)}`);
      else if (segs[segs.length - 1].length) segs.push([]);
    }
    return segs.filter((s) => s.length > 1).map((s) => s.join(' '));
  });
  const shownFormula = typeof formula === 'function' ? formula(p) : (formula ?? fns.map((f) => f.name).join(',  '));
  const text = typeof note === 'function' ? note(p) : note;
  const grid = (v: number) => (v === 0 ? 'var(--ink-4)' : 'oklch(0.91 0.02 195)');

  return (
    <BlockCard
      tone="teal"
      pill="Plot"
      title={title}
      aside={
        fns.length > 1 ? (
          <div className="flex flex-wrap gap-3">
            {fns.map((f, i) => (
              <span key={f.name} className="flex items-center gap-1.5 font-mono text-sm font-medium">
                <span className="h-1 w-[14px] rounded-sm" style={{ background: color(i) }} />
                {f.name}
              </span>
            ))}
          </div>
        ) : null
      }
    >
      <div className="grid grid-cols-1 items-start gap-4 @[560px]:grid-cols-[minmax(0,1.5fr)_minmax(220px,1fr)]">
        <div
          className="relative aspect-[4/3] cursor-crosshair overflow-hidden rounded-2xl bg-tone-soft"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHx(x0 + ((e.clientX - r.left) / r.width) * (x1 - x0));
          }}
          onMouseLeave={() => setHx(null)}
        >
          {ticks(x0, x1).map((v) => (
            <div key={`x${v}`}>
              <div className="absolute inset-y-0 w-px" style={{ left: `${sx(v) * 100}%`, background: grid(v) }} />
              {v !== 0 && v > x0 && v < x1 && <span className="absolute translate-x-[-50%] translate-y-1 text-[11px] font-medium text-ink-3 tabular-nums" style={{ left: `${sx(v) * 100}%`, top: `min(${zeroY * 100}%, calc(100% - 20px))` }}>{v}</span>}
            </div>
          ))}
          {ticks(y0, y1).map((v) => (
            <div key={`y${v}`}>
              <div className="absolute inset-x-0 h-px" style={{ top: `${sy(v) * 100}%`, background: grid(v) }} />
              {v > y0 && v < y1 && <span className="absolute translate-x-[-100%] translate-y-[-50%] pr-1 text-[11px] font-medium text-ink-3 tabular-nums" style={{ top: `${sy(v) * 100}%`, left: `max(${zeroX * 100}%, 24px)` }}>{v}</span>}
            </div>
          ))}
          <svg viewBox="0 0 1000 750" preserveAspectRatio="none" className="absolute inset-0 size-full">
            {curves.map((segs, i) => segs.map((pts, k) => <polyline key={`${i}.${k}`} points={pts} fill="none" stroke={color(i)} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />))}
          </svg>
          {hx != null && (
            <>
              <div className="absolute inset-y-0 w-px bg-ink opacity-30" style={{ left: `${sx(hx) * 100}%` }} />
              {fns.map((fn, i) => {
                const y = safe(() => fn.f(hx, p));
                return Number.isFinite(y) && y >= y0 && y <= y1 ? <div key={i} className="absolute size-3 -translate-1/2 rounded-full border-[3px] border-white shadow-[0_1px_3px_rgba(0,0,0,.25)]" style={{ left: `${sx(hx) * 100}%`, top: `${sy(y) * 100}%`, background: color(i) }} /> : null;
              })}
            </>
          )}
        </div>
        <div className="flex flex-col gap-[14px]">
          <div className="rounded-xl bg-subtle px-[14px] py-3 font-mono text-lg leading-[1.4] font-medium">{shownFormula}</div>
          {params.map((d) => (
            <div key={d.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="font-mono font-medium">{d.name}</span>
                <span className="font-bold text-tone-ink tabular-nums">{p[d.name]}</span>
              </div>
              <Slider
                aria-label={d.name}
                min={d.min}
                max={d.max}
                step={d.step}
                value={[p[d.name]]}
                onValueChange={(v) => setP((s) => ({ ...s, [d.name]: +(Array.isArray(v) ? v[0] : (v as number)).toFixed(6) }))}
                className="[&_[data-slot=slider-range]]:bg-tone [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-tone [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-tone-tint"
              />
            </div>
          ))}
          <div className="min-h-5 font-mono text-[13px] text-ink-2">{hx != null ? fns.map((fn) => `x = ${fmt(hx)} → y = ${fmt(safe(() => fn.f(hx, p)))}`).join('   ') : 'Hover the plot to read values'}</div>
          {text && <RichText text={text} className="text-[15px] leading-normal text-ink-2" />}
          {params.length > 0 && <Button variant="plain" size="sm" className="self-start px-[14px]" onClick={() => setP(init())}>Reset</Button>}
        </div>
      </div>
    </BlockCard>
  );
}
