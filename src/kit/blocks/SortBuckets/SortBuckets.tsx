import { useState } from 'react';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

export function SortBuckets({ title, categories, items, mono, initial }: BlockProps<'SortBuckets'>) {
  const res = useBlockResult();
  const [place, setPlace] = useState<(number | null)[]>(() => (initial === 'submitted' ? items.map((it, i) => (i === 1 ? (it.cat + 1) % categories.length : it.cat)) : items.map(() => null)));
  const [sel, setSel] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(initial === 'submitted');
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor));

  const left = place.filter((p) => p == null).length;
  const correct = items.filter((it, i) => place[i] === it.cat).length;
  const put = (i: number, c: number | null) => {
    if (submitted) return;
    setPlace((p) => Object.assign([...p], { [i]: c }));
    setSel(null);
  };
  const onDragEnd = (e: DragEndEvent) => {
    if (e.over) put(+e.active.id, +e.over.id);
  };
  const submit = () => {
    if (left) return;
    setSubmitted(true);
    void res.submit({ score: correct, total: items.length, items: items.map((it, i) => ({ prompt: it.text, answer: categories[place[i]!], expected: categories[it.cat], correct: place[i] === it.cat })) });
  };

  return (
    <BlockCard tone="gold" pill="Sort" title={title} aside={<Counter>{items.length - left} / {items.length} placed</Counter>}>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {left > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl bg-tone-soft p-[14px]">
            <span className="text-sm font-medium text-ink-3">{sel == null ? 'Pick an item, then click a group. You can also drag.' : `Now click a group for "${items[sel].text}"`}</span>
            <div className="flex flex-wrap gap-2">
              {items.map((it, i) =>
                place[i] == null ? (
                  <Chip key={i} id={i} mono={mono} selected={sel === i} onClick={() => setSel(sel === i ? null : i)}>
                    {it.text}
                  </Chip>
                ) : null,
              )}
            </div>
          </div>
        )}
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
          {categories.map((name, c) => (
            <Bucket key={c} id={c} name={name} armed={sel != null} onClick={() => sel != null && put(sel, c)}>
              {items.map((it, i) => {
                if (place[i] !== c) return null;
                const ok = it.cat === c;
                return (
                  <button
                    key={i}
                    type="button"
                    title={submitted && !ok ? it.why : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      put(i, null);
                    }}
                    className={cn('rounded-full border-2 px-3 py-1.5 text-sm font-medium text-ink', mono && 'font-mono', !submitted ? 'border-[#E2E4E9] bg-surface' : ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft')}
                  >
                    {it.text}
                  </button>
                );
              })}
            </Bucket>
          ))}
        </div>
      </DndContext>
      {submitted && correct < items.length && (
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) =>
            place[i] !== it.cat ? (
              <div key={i} className="text-[15px] leading-[1.45] text-pretty text-ink-2">
                <span className="font-bold text-bad">{it.text}</span> → {categories[it.cat]}. {it.why && <Inline text={it.why} />}
              </div>
            ) : null,
          )}
        </div>
      )}
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${correct}/${items.length}`} line={correct === items.length ? 'All sorted correctly.' : `${items.length - correct} in the wrong group.`} />
            <Button variant="soft" onClick={() => { setPlace(items.map(() => null)); setSubmitted(false); }}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{left ? `${left} left to place` : 'All placed'}</span>
            <Button disabled={left > 0} onClick={submit}>Check</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}

function Chip({ id, mono, selected, onClick, children }: { id: number; mono: boolean; selected: boolean; onClick: () => void; children: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(id) });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      style={transform ? { transform: `translate(${transform.x}px,${transform.y}px)`, zIndex: 5 } : undefined}
      className={cn('cursor-grab rounded-full border-2 select-none px-[14px] py-2 text-[15px] font-medium text-ink', mono && 'font-mono', selected || isDragging ? 'border-tone bg-tone-tint' : 'border-[#E2E4E9] bg-surface', isDragging && 'shadow-lg')}
      {...listeners}
      {...attributes}
    >
      {children}
    </button>
  );
}

function Bucket({ id, name, armed, onClick, children }: { id: number; name: string; armed: boolean; onClick: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: String(id) });
  return (
    <div ref={setNodeRef} onClick={onClick} className={cn('flex min-h-[150px] cursor-pointer flex-col gap-2 rounded-2xl border-2 border-dashed bg-subtle p-3 transition-colors', isOver || armed ? 'border-tone' : 'border-[#D5D8DE]', isOver && 'bg-tone-soft')}>
      <span className="text-[15px] font-bold">{name}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
