import { useRef, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Inline, RichText } from '@/kit/primitives/RichText';

export function ConceptMap({ title, nodes, links, height }: BlockProps<'ConceptMap'>) {
  const area = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const [sel, setSel] = useState<string | null>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  const P = (id: string) => pos[id] ?? nodes.find((n) => n.id === id) ?? { x: 0, y: 0 };
  const near = new Set(sel ? links.flatMap((l) => (l.from === sel ? [l.to] : l.to === sel ? [l.from] : [])) : []);
  const selNode = nodes.find((n) => n.id === sel);
  const label = (id: string) => nodes.find((n) => n.id === id)?.label;

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !area.current) return;
    const r = area.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - r.top) / r.height) * 100));
    d.moved = true;
    setPos((p) => ({ ...p, [d.id]: { x, y } }));
  };
  const onUp = () => {
    if (drag.current) setTimeout(() => (drag.current = null), 0);
  };

  return (
    <BlockCard tone="teal" pill="Concept map" title={title} className="gap-[14px]" aside={<span className="text-sm text-ink-3">Click a concept · drag to rearrange</span>}>
      <div
        ref={area}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClick={(e) => e.target === e.currentTarget && setSel(null)}
        className="relative touch-none overflow-hidden rounded-2xl bg-tone-soft"
        style={{ height }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
          {links.map((l, i) => {
            const a = P(l.from);
            const b = P(l.to);
            const on = sel && (l.from === sel || l.to === sel);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? 'var(--tone)' : sel ? 'oklch(0.9 0.02 195)' : 'oklch(0.78 0.06 195)'} strokeWidth={on ? 3 : 2} vectorEffect="non-scaling-stroke" strokeLinecap="round" />;
          })}
        </svg>
        {links.map((l, i) => {
          if (!l.label) return null;
          const a = P(l.from);
          const b = P(l.to);
          const on = sel && (l.from === sel || l.to === sel);
          return (
            <span key={i} className="pointer-events-none absolute -translate-1/2 rounded-full bg-surface px-2 py-0.5 text-xs font-bold whitespace-nowrap" style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%`, color: on ? 'var(--tone-ink)' : 'var(--ink-3)', opacity: sel && !on ? 0.35 : 1 }}>
              {l.label}
            </span>
          );
        })}
        {nodes.map((n) => {
          const p = P(n.id);
          const s = sel === n.id;
          const nb = near.has(n.id);
          return (
            <button
              key={n.id}
              type="button"
              onPointerDown={() => (drag.current = { id: n.id, moved: false })}
              onClick={(e) => {
                e.stopPropagation();
                if (!drag.current?.moved) setSel(s ? null : n.id);
              }}
              className="absolute -translate-1/2 cursor-grab touch-none rounded-[14px] border-2 px-[14px] py-[9px] text-[15px] font-bold whitespace-nowrap transition-[opacity,box-shadow] duration-150"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: s ? 'var(--tone)' : '#FFFFFF',
                color: s ? '#FFFFFF' : 'var(--ink)',
                borderColor: s || nb ? 'var(--tone)' : 'oklch(0.88 0.04 195)',
                opacity: sel && !s && !nb ? 0.4 : 1,
                boxShadow: s ? '0 4px 14px rgba(20,90,100,.25)' : '0 1px 3px rgba(20,22,30,.08)',
              }}
            >
              {n.label}
            </button>
          );
        })}
      </div>
      {selNode && (
        <div className="flex flex-col gap-1.5 rounded-[14px] bg-subtle p-[14px]">
          <span className="font-display text-xl font-bold">{selNode.label}</span>
          {selNode.note && <RichText text={selNode.note} className="text-[15px] leading-normal text-ink-2" />}
          <div className="flex flex-wrap gap-1.5">
            {links
              .filter((l) => l.from === sel || l.to === sel)
              .map((l, i) => (
                <span key={i} className="rounded-full bg-surface px-2.5 py-[5px] text-sm text-ink-2">
                  <Inline text={`${label(l.from)} ${l.label ?? '→'} ${label(l.to)}`} />
                </span>
              ))}
          </div>
        </div>
      )}
    </BlockCard>
  );
}
