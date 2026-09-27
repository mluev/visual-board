import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { ImageSlot } from '@/kit/primitives/ImageSlot';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

export function LabelDiagram({ title, image, slotId, placeholder, pins, distractors, aspect, initial }: BlockProps<'LabelDiagram'>) {
  const res = useBlockResult();
  const [assign, setAssign] = useState<(string | null)[]>(() => (initial === 'submitted' ? pins.map((p, i) => (pins.length > 1 && i < 2 ? pins[1 - i].label : p.label)) : pins.map(() => null)));
  const [sel, setSel] = useState<number | null>(initial === 'submitted' ? null : 0);
  const [submitted, setSubmitted] = useState(initial === 'submitted');

  const labels = [...new Set([...pins.map((p) => p.label), ...distractors])].sort((a, b) => a.localeCompare(b));
  const correct = pins.filter((p, i) => assign[i] === p.label).length;
  const left = assign.filter((a) => a == null).length;

  const give = (label: string) => {
    if (submitted || sel == null) return;
    const a = assign.map((x) => (x === label ? null : x));
    a[sel] = label;
    setAssign(a);
    const next = a.findIndex((x) => x == null);
    setSel(next >= 0 ? next : null);
  };
  const pick = (i: number) => !submitted && setSel(i);
  const submit = () => {
    if (left) return;
    setSubmitted(true);
    setSel(null);
    void res.submit({ score: correct, total: pins.length, items: pins.map((p, i) => ({ prompt: `Pin ${i + 1}`, answer: assign[i], expected: p.label, correct: assign[i] === p.label })) });
  };

  return (
    <BlockCard tone="gold" pill="Label it" title={title} aside={<Counter>{pins.length - left} / {pins.length} labelled</Counter>}>
      <div className="grid items-start gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))' }}>
        <div className="relative overflow-hidden rounded-2xl bg-subtle" style={{ aspectRatio: aspect }}>
          <ImageSlot src={image} slotId={slotId} alt={title || 'Diagram'} placeholder={placeholder} />
          {pins.map((p, i) => {
            const ok = assign[i] === p.label;
            const active = sel === i && !submitted;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Pin ${i + 1}`}
                onClick={() => pick(i)}
                className={cn(
                  'absolute flex size-8 -translate-1/2 items-center justify-center rounded-full border-[3px] text-sm font-bold shadow-[0_2px_6px_rgba(0,0,0,.25)] transition-transform',
                  submitted ? (ok ? 'border-white bg-ok text-white' : 'border-white bg-bad text-white') : active ? 'scale-110 border-white bg-tone text-white' : assign[i] ? 'border-white bg-ink text-white' : 'border-ink bg-surface text-ink',
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm text-ink-3">{submitted ? 'Results' : sel != null ? `Choose the label for pin ${sel + 1}.` : 'Click a pin to change its label.'}</span>
          {!submitted && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((t) => {
                const used = assign.includes(t);
                return (
                  <button key={t} type="button" onClick={() => give(t)} className={cn('rounded-full border-2 px-3 py-[7px] text-sm font-medium text-ink', used ? 'border-subtle bg-subtle opacity-50' : 'border-[#E2E4E9] bg-surface')}>
                    {t}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            {pins.map((p, i) => {
              const ok = assign[i] === p.label;
              const s = sel === i && !submitted;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  className={cn('flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2 text-left text-[15px] text-ink', submitted ? (ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft') : s ? 'border-tone bg-tone-tint' : 'border-subtle bg-subtle')}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
                  <span className={cn('flex-1 font-medium', !assign[i] && 'text-ink-4')}>{assign[i] ?? '—'}</span>
                  {submitted && !ok && <span className="text-[13px] font-bold text-ok">{p.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${correct}/${pins.length}`} line={correct === pins.length ? 'Every label is right.' : 'The correct labels are shown in green.'} />
            <Button variant="soft" onClick={() => { setAssign(pins.map(() => null)); setSel(0); setSubmitted(false); }}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{left ? `${left} left` : 'All labelled'}</span>
            <Button disabled={left > 0} onClick={submit}>Check labels</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}
