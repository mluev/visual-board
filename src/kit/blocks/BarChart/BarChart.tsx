import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Segmented } from '@/kit/primitives/BlockCard';
import { ParamSlider } from '@/kit/primitives/ParamSlider';
import { RichText } from '@/kit/primitives/RichText';
import { fmtNum } from '@/kit/lib/format';

export function BarChart({ title, data, param, note, highlight, unit, allowLog }: BlockProps<'BarChart'>) {
  const [p, setP] = useState(param?.value ?? 0);
  const [scale, setScale] = useState<'lin' | 'log'>('lin');
  const [hover, setHover] = useState(-1);

  const bars = typeof data === 'function' ? data(p) : data;
  const max = Math.max(...bars.map((d) => d.value), 1e-9);
  const hl = highlight === -1 ? bars.length - 1 : highlight;
  const text = typeof note === 'function' ? note(p, bars) : note;

  return (
    <BlockCard
      tone="teal"
      pill="Chart"
      title={<span className="text-[21px]">{title}</span>}
      className="gap-[18px]"
      aside={allowLog ? <Segmented value={scale} onChange={setScale} options={[{ value: 'lin', label: 'Linear' }, { value: 'log', label: 'Log' }]} /> : null}
    >
      <div className="flex flex-col rounded-2xl bg-tone-soft px-4 pt-4 pb-3">
        <div className="grid gap-3 border-b-2 border-tone-line" style={{ gridTemplateColumns: `repeat(${bars.length || 1},minmax(0,1fr))` }}>
          {bars.map((d, i) => {
            const f = scale === 'log' ? Math.log(Math.max(d.value, 0) + 1) / Math.log(max + 1) : Math.max(d.value, 0) / max;
            const isHl = i === hl || d.label === hl;
            return (
              <div key={d.label + i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)} className="flex h-[220px] flex-col items-center justify-end gap-1.5">
                <span className="text-[15px] font-bold whitespace-nowrap tabular-nums">{fmtNum(d.value, unit)}</span>
                <div
                  className="w-[62%] max-w-[72px] rounded-t-[10px] transition-[height,background] duration-[250ms,150ms]"
                  style={{ height: Math.max(3, f * 180), background: i === hover ? 'var(--tone-strong)' : isHl ? 'var(--tone)' : 'var(--tone-mid)' }}
                />
              </div>
            );
          })}
        </div>
        <div className="grid gap-3 pt-2" style={{ gridTemplateColumns: `repeat(${bars.length || 1},minmax(0,1fr))` }}>
          {bars.map((d, i) => (
            <div key={d.label + i} className="text-center text-sm font-medium text-balance text-ink-3">{d.label}</div>
          ))}
        </div>
      </div>
      {param && <ParamSlider param={param} value={p} onChange={setP} />}
      {text && <RichText text={text} className="text-base leading-normal text-ink-2" />}
    </BlockCard>
  );
}
