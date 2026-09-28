import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { ImageSlot } from '@/kit/primitives/ImageSlot';
import { RichText } from '@/kit/primitives/RichText';
import { Counter } from '@/kit/primitives/Practice';

export function Hotspots({ title, image, slotId, placeholder, spots, aspect }: BlockProps<'Hotspots'>) {
  const [a, setA] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const pick = (i: number) => {
    setA(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
  };
  const cur = a != null ? spots[a] : null;
  const arrow = 'size-9 rounded-full border-0 bg-surface text-[15px] text-ink';

  return (
    <BlockCard tone="teal" pill="Explore" title={title} aside={<Counter>{seen.length} / {spots.length} explored</Counter>}>
      <div className="relative overflow-hidden rounded-2xl bg-subtle" style={{ aspectRatio: aspect }}>
        <ImageSlot src={image} slotId={slotId} alt={title || 'Image'} placeholder={placeholder} className="object-cover" />
        {spots.map((s, i) => {
          const on = a === i;
          const visited = seen.includes(i);
          return (
            <button
              key={i}
              type="button"
              aria-label={s.title}
              onClick={() => pick(i)}
              className="absolute flex size-[34px] -translate-1/2 items-center justify-center rounded-full border-[3px] border-white text-sm font-bold transition-[box-shadow,background] duration-200"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                background: on || !visited ? 'var(--tone)' : '#FFFFFF',
                color: on || !visited ? '#FFFFFF' : 'var(--tone-ink)',
                boxShadow: `0 0 0 6px ${on ? 'oklch(0.52 0.12 195 / .35)' : visited ? 'transparent' : 'oklch(0.52 0.12 195 / .2)'}, 0 2px 8px rgba(0,0,0,.3)`,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex min-h-[84px] items-start justify-between gap-4 rounded-2xl bg-tone-soft px-[18px] py-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-[21px] font-bold">{cur ? cur.title : 'Tap a numbered point'}</span>
          <RichText text={cur ? cur.body : `There are ${spots.length} points to explore. Use the arrows for a guided tour.`} className="text-[15px] leading-normal text-ink-2" />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" aria-label="Previous" onClick={() => pick(a == null ? spots.length - 1 : (a - 1 + spots.length) % spots.length)} className={arrow}>←</button>
          <button type="button" aria-label="Next" onClick={() => pick(a == null ? 0 : (a + 1) % spots.length)} className={arrow}>→</button>
        </div>
      </div>
    </BlockCard>
  );
}
