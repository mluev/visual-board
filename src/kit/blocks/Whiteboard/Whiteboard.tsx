import { useCallback, useEffect, useRef, useState } from 'react';
import { getStroke } from 'perfect-freehand';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

const COLORS = [
  ['Ink', '#1B1D22'],
  ['Blue', 'oklch(0.52 0.16 250)'],
  ['Coral', 'oklch(0.58 0.18 30)'],
  ['Green', 'oklch(0.55 0.14 155)'],
] as const;
const SIZES = [
  ['Thin', 3, 5],
  ['Medium', 5, 8],
  ['Thick', 10, 12],
] as const;
const TOOLS = [
  ['pen', 'Pen'],
  ['marker', 'Marker'],
  ['eraser', 'Eraser'],
] as const;
type Tool = (typeof TOOLS)[number][0];
type Stroke = { tool: Tool; color: string; w: number; pts: [number, number, number][] };

function strokePath(s: Stroke) {
  const size = s.tool === 'marker' ? s.w * 4 : s.tool === 'eraser' ? s.w * 5 : s.w;
  const outline = getStroke(s.pts, { size, thinning: s.tool === 'pen' ? 0.55 : 0, smoothing: 0.6, streamline: 0.45, simulatePressure: s.tool === 'pen', last: true });
  const p = new Path2D();
  if (!outline.length) return p;
  p.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i - 1];
    const [x1, y1] = outline[i];
    p.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  p.closePath();
  return p;
}

function paint(x: CanvasRenderingContext2D, s: Stroke) {
  x.save();
  x.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
  x.globalAlpha = s.tool === 'marker' ? 0.35 : 1;
  x.fillStyle = s.color;
  x.fill(strokePath(s));
  x.restore();
}

export function Whiteboard({ title, prompt, height, submit }: BlockProps<'Whiteboard'>) {
  const res = useBlockResult<{ strokes: Stroke[] }>();
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(1);
  const [strokes, setStrokes] = useState<Stroke[]>(() => res.progress?.strokes ?? []);
  const [sent, setSent] = useState<'idle' | 'sending' | 'sent'>('idle');
  const canvas = useRef<HTMLCanvasElement>(null);
  const cur = useRef<Stroke | null>(null);

  const redraw = useCallback(() => {
    const c = canvas.current;
    const x = c?.getContext('2d');
    if (!c || !x) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(c.clientWidth * dpr);
    const h = Math.round(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, c.clientWidth, c.clientHeight);
    strokes.forEach((s) => paint(x, s));
    if (cur.current) paint(x, cur.current);
  }, [strokes]);

  useEffect(() => {
    redraw();
    const c = canvas.current;
    if (!c || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(redraw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);

  const commit = (next: Stroke[]) => {
    setStrokes(next);
    setSent('idle');
    res.saveProgress({ strokes: next });
  };
  const pt = (e: React.PointerEvent): [number, number, number] => {
    const r = canvas.current!.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10, e.pressure || 0.5];
  };
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    cur.current = { tool, color: COLORS[color][1], w: SIZES[size][1], pts: [pt(e)] };
    redraw();
  };
  const move = (e: React.PointerEvent) => {
    if (!cur.current) return;
    cur.current.pts.push(pt(e));
    redraw();
  };
  const up = () => {
    if (!cur.current) return;
    const s = cur.current;
    cur.current = null;
    commit([...strokes, s]);
  };

  const send = async () => {
    const c = canvas.current;
    if (!c) return;
    setSent('sending');
    const out = document.createElement('canvas');
    out.width = c.width;
    out.height = c.height;
    const x = out.getContext('2d')!;
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, 0, out.width, out.height);
    x.drawImage(c, 0, 0);
    await res.submit({ items: [{ prompt: prompt ?? title, answer: `results/${res.board}/${res.id}-drawing.png`, needsReview: true }], files: { 'drawing.png': out.toDataURL('image/png') } }, { strokes });
    setSent('sent');
  };

  const seg = 'flex gap-0.5 rounded-full bg-subtle p-1';
  return (
    <BlockCard
      tone="pink"
      pill="Whiteboard"
      title={title}
      className="gap-[14px]"
      aside={
        <div className="flex flex-wrap items-center gap-1.5">
          <div className={seg}>
            {TOOLS.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setTool(k)} aria-pressed={tool === k} className={cn('rounded-full border-0 px-3 py-1.5 text-sm font-bold', tool === k ? 'bg-surface text-ink' : 'bg-transparent text-ink-3')}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 rounded-full bg-subtle px-2 py-1.5">
            {COLORS.map(([name, value], i) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={color === i}
                onClick={() => {
                  setColor(i);
                  if (tool === 'eraser') setTool('pen');
                }}
                className="size-[22px] rounded-full p-0"
                style={{ background: value, border: `3px solid ${color === i ? '#FFFFFF' : value}`, boxShadow: `0 0 0 1px ${color === i ? value : 'transparent'}` }}
              />
            ))}
          </div>
          <div className={seg}>
            {SIZES.map(([name, , dot], i) => (
              <button key={name} type="button" aria-label={name} aria-pressed={size === i} onClick={() => setSize(i)} className={cn('flex size-[30px] items-center justify-center rounded-full border-0', size === i ? 'bg-surface' : 'bg-transparent')}>
                <span className="rounded-full bg-ink" style={{ width: dot, height: dot }} />
              </button>
            ))}
          </div>
          <Button variant="plain" size="sm" disabled={!strokes.length} onClick={() => commit(strokes.slice(0, -1))}>Undo</Button>
          <Button variant="plain" size="sm" onClick={() => commit([])}>Clear</Button>
        </div>
      }
    >
      {prompt && <RichText text={prompt} className="text-base leading-normal text-ink-2" />}
      <div
        className="relative overflow-hidden rounded-2xl border border-page bg-[#FCFCFD]"
        style={{ height, backgroundImage: 'radial-gradient(circle,#D5D8DE 1.2px,transparent 1.3px)', backgroundSize: '24px 24px' }}
      >
        <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} className="absolute inset-0 size-full cursor-crosshair touch-none" />
        {!strokes.length && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[15px] text-ink-4">Draw, sketch or work it out here</div>}
      </div>
      {submit && prompt && (
        <div className="flex items-center gap-3">
          <Button onClick={send} disabled={!strokes.length || sent === 'sending'}>{sent === 'sent' ? 'Submitted ✓' : 'Submit for review'}</Button>
          {sent === 'sent' && <span className="text-sm text-ink-3">Saved. Ask your tutor to check it.</span>}
        </div>
      )}
    </BlockCard>
  );
}
