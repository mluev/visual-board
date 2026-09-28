import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { ParamSlider } from '@/kit/primitives/ParamSlider';
import { RichText } from '@/kit/primitives/RichText';
import { SERIES_COLORS, fmtAxis, niceTicks } from '@/kit/lib/chart';

export function LineChart({ title, series: raw, param, note, xLabel, yMin, unit }: BlockProps<'LineChart'>) {
  const [p, setP] = useState(param?.value ?? 0);
  const [hi, setHi] = useState(-1);
  const series = typeof raw === 'function' ? raw(p) : raw;
  const all = series.flatMap((s) => s.points);
  const xs = all.map((q) => q[0]);
  const ys = all.map((q) => q[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const Y = niceTicks(yMin ?? Math.min(0, ...ys), Math.max(...ys));
  const X = niceTicks(xMin, xMax, 5);
  const px = (x: number) => (x - xMin) / (xMax - xMin || 1);
  const py = (y: number) => 1 - (y - Y.lo) / (Y.hi - Y.lo || 1);
  const color = (i: number) => series[i].color ?? SERIES_COLORS[i % SERIES_COLORS.length];
  const base = series[0]?.points ?? [];
  const hp = base[hi];
  const hx = hp ? px(hp[0]) : 0;
  const text = typeof note === 'function' ? note(p, series) : note;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin);
    let best = 0;
    base.forEach((q, i) => {
      if (Math.abs(q[0] - x) < Math.abs(base[best][0] - x)) best = i;
    });
    if (best !== hi) setHi(best);
  };

  return (
    <BlockCard
      tone="teal"
      pill="Chart"
      title={<span className="text-[21px]">{title}</span>}
      className="gap-[18px]"
      aside={
        <div className="flex flex-wrap gap-[14px]">
          {series.map((s, i) => (
            <span key={s.name} className="flex items-center gap-1.5 text-sm font-medium text-ink-2">
              <span className="h-1 w-[14px] rounded-sm" style={{ background: color(i) }} />
              {s.name}
            </span>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-[52px_minmax(0,1fr)] grid-rows-[240px_24px] gap-x-2 rounded-2xl bg-tone-soft pt-4 pr-5 pb-2 pl-2">
        <div className="relative">
          {Y.ticks.map((v) => (
            <span key={v} className="absolute right-0 -translate-y-1/2 text-xs font-medium text-ink-3 tabular-nums" style={{ top: `${py(v) * 100}%` }}>
              {fmtAxis(v)}
            </span>
          ))}
        </div>
        <div className="relative cursor-crosshair" onMouseMove={onMove} onMouseLeave={() => setHi(-1)}>
          {Y.ticks.map((v) => (
            <div key={v} className="absolute inset-x-0 h-px bg-[oklch(0.9_0.03_195)]" style={{ top: `${py(v) * 100}%` }} />
          ))}
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            {series.map((s, i) => (
              <polyline key={s.name} points={s.points.map((q) => `${(px(q[0]) * 1000).toFixed(1)},${(py(q[1]) * 1000).toFixed(1)}`).join(' ')} fill="none" stroke={color(i)} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {hp && (
            <>
              <div className="absolute inset-y-0 w-px bg-ink opacity-35" style={{ left: `${hx * 100}%` }} />
              {series.map((s, i) => {
                const q = s.points[hi];
                return q ? <div key={s.name} className="absolute size-3 -translate-1/2 rounded-full border-[3px] border-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" style={{ left: `${px(q[0]) * 100}%`, top: `${py(q[1]) * 100}%`, background: color(i) }} /> : null;
              })}
              <div className="pointer-events-none absolute top-2 flex flex-col gap-0.5 rounded-[10px] bg-ink px-2.5 py-2 text-[13px] whitespace-nowrap text-white" style={{ left: `${hx * 100}%`, transform: hx > 0.6 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }}>
                <span className="font-bold">{xLabel || 'x'} {fmtAxis(hp[0])}</span>
                {series.map((s) => (s.points[hi] ? <span key={s.name}>{s.name}: {fmtAxis(s.points[hi][1])}{unit}</span> : null))}
              </div>
            </>
          )}
        </div>
        <div className="self-end text-right text-xs font-medium text-ink-3">{xLabel}</div>
        <div className="relative">
          {X.ticks
            .filter((v) => v >= xMin && v <= xMax)
            .map((v) => (
              <span key={v} className="absolute top-1.5 -translate-x-1/2 text-xs font-medium text-ink-3 tabular-nums" style={{ left: `${px(v) * 100}%` }}>
                {fmtAxis(v)}
              </span>
            ))}
        </div>
      </div>
      {param && <ParamSlider param={param} value={p} onChange={setP} />}
      {text && <RichText text={text} className="text-base leading-normal text-ink-2" />}
    </BlockCard>
  );
}
