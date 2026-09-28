import { useState } from 'react';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { derange } from '@/kit/lib/format';
import { cn } from '@/kit/lib/utils';

export function OrderSteps({ title, items, instruction, explain, mono, initial }: BlockProps<'OrderSteps'>) {
  const res = useBlockResult();
  const n = items.length;
  const [seed, setSeed] = useState(11);
  const [order, setOrder] = useState<number[]>(() => {
    if (initial !== 'submitted') return derange(n, 11);
    const o = [...Array(n).keys()];
    if (n > 3) [o[1], o[2]] = [o[2], o[1]];
    return o;
  });
  const [submitted, setSubmitted] = useState(initial === 'submitted');
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // press-and-hold on touch, so swiping over rows still scrolls the page
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const correct = order.filter((v, i) => v === i).length;
  const move = (from: number, to: number) => to >= 0 && to < n && setOrder((o) => arrayMove(o, from, to));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    move(order.indexOf(+e.active.id), order.indexOf(+e.over.id));
  };
  const submit = () => {
    setSubmitted(true);
    void res.submit({ score: correct, total: n, items: order.map((v, i) => ({ prompt: `Position ${i + 1}`, answer: items[v], expected: items[i], correct: v === i })) });
  };
  const reset = () => {
    const s = seed + 17;
    setSeed(s);
    setOrder(derange(n, s));
    setSubmitted(false);
  };

  return (
    <BlockCard tone="gold" pill="Order" title={title} aside={<Counter>{n} steps</Counter>}>
      <div className="text-[15px] text-ink-3"><Inline text={instruction} /></div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order.map(String)} strategy={verticalListSortingStrategy} disabled={submitted}>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {order.map((v, i) => (
              <Row key={v} id={v} pos={i} n={n} text={items[v]} mono={mono} submitted={submitted} ok={v === i} onMove={move} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {submitted && explain && <RichText text={explain} className="text-[15px] leading-normal text-ink-2" />}
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${correct}/${n}`} line={correct === n ? 'Perfect order.' : `${n - correct} in the wrong place.`} />
            <div className="flex gap-2">
              {correct < n && <Button variant="ghost" className="border-2 border-tone-line text-ink" onClick={() => setOrder([...Array(n).keys()])}>Show correct order</Button>}
              <Button variant="soft" onClick={reset}>Try again</Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">Drag rows or use the arrows</span>
            <Button onClick={submit}>Check order</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}

function Row({ id, pos, n, text, mono, submitted, ok, onMove }: { id: number; pos: number; n: number; text: string; mono: boolean; submitted: boolean; ok: boolean; onMove: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(id), disabled: submitted });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 2 : undefined }}
      className={cn(
        'flex items-center gap-3 rounded-[14px] border-2 py-2 pr-2 pl-[14px] transition-colors select-none',
        !submitted && (isDragging ? 'cursor-grabbing border-tone bg-tone-tint shadow-lg' : 'cursor-grab border-subtle bg-subtle'),
        submitted && (ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'),
      )}
      {...attributes}
      {...listeners}
    >
      <span className={cn('w-6 text-sm font-bold', !submitted ? 'text-tone-ink' : ok ? 'text-ok' : 'text-bad')}>{pos + 1}</span>
      <span className={cn('flex-1 text-base leading-[1.4] font-medium text-pretty', mono && 'font-mono text-[15px]')}><Inline text={text} /></span>
      {!submitted ? (
        <div className="flex gap-1">
          {(['↑', '↓'] as const).map((a) => {
            const to = a === '↑' ? pos - 1 : pos + 1;
            return (
              <button
                key={a}
                type="button"
                aria-label={a === '↑' ? 'Move up' : 'Move down'}
                disabled={to < 0 || to >= n}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => onMove(pos, to)}
                className="size-[34px] rounded-[10px] border-0 bg-surface text-base text-ink disabled:opacity-30"
              >
                {a}
              </button>
            );
          })}
        </div>
      ) : (
        !ok && <span className="pr-1.5 text-[13px] font-bold whitespace-nowrap text-bad">belongs at {id + 1}</span>
      )}
    </li>
  );
}
