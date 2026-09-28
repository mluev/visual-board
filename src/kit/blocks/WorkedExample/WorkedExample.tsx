import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Segmented } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { canon } from '@/kit/lib/grade';
import { cn } from '@/kit/lib/utils';

type Mode = 'study' | 'faded' | 'solve';
const MODES = [
  { value: 'study', label: 'Study' },
  { value: 'faded', label: 'Faded' },
  { value: 'solve', label: 'Solve' },
] as const;

export function WorkedExample({ title, problem, steps, initial }: BlockProps<'WorkedExample'>) {
  const res = useBlockResult();
  const [mode, setMode] = useState<Mode>(initial);
  const [vals, setVals] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const n = steps.length;
  const hidden = mode === 'study' ? [] : mode === 'solve' ? [...Array(n).keys()] : [...Array(n).keys()].filter((i) => i >= Math.ceil(n / 2));
  const ok = (i: number) => [steps[i].work, ...(steps[i].accept ?? [])].some((x) => canon(x) === canon(vals[i]));
  const right = hidden.filter(ok).length;

  const switchMode = (m: Mode) => {
    setMode(m);
    setVals({});
    setHints([]);
    setChecked(false);
  };
  const check = () => {
    setChecked(true);
    void res.submit({
      score: right,
      total: hidden.length,
      items: hidden.map((i) => ({ prompt: `Step ${i + 1} of: ${problem}`, answer: vals[i] ?? '', expected: steps[i].work, correct: ok(i), needsReview: !ok(i) && !!vals[i]?.trim() ? true : undefined })),
      meta: { mode },
    });
  };

  return (
    <BlockCard tone="gold" pill="Worked example" title={title} aside={<Segmented value={mode} onChange={switchMode} options={MODES} className="[&_button]:px-3" />}>
      <div className="font-display text-[22px] leading-[1.3] font-medium text-pretty"><Inline text={problem} /></div>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {steps.map((s, i) => {
          const h = hidden.includes(i);
          const good = checked && h && ok(i);
          const bad = checked && h && !good;
          return (
            <li
              key={i}
              className={cn(
                'grid grid-cols-[32px_minmax(0,1fr)] items-start gap-3 rounded-[14px] border-2 px-3 py-2.5',
                good ? 'border-ok bg-ok-soft' : bad ? 'border-bad bg-bad-soft' : h ? 'border-tone-line bg-tone-soft' : 'border-subtle bg-subtle',
              )}
            >
              <span className={cn('flex size-7 items-center justify-center rounded-full text-[13px] font-bold', h ? 'bg-tone text-white' : 'bg-surface text-ink-2')}>{i + 1}</span>
              <div className="flex min-w-0 flex-col gap-1">
                {!h ? (
                  <span className="font-mono text-base leading-normal whitespace-pre-wrap">{s.work}</span>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        aria-label={`Step ${i + 1}`}
                        value={vals[i] ?? ''}
                        readOnly={checked}
                        placeholder="Your step"
                        spellCheck={false}
                        autoComplete="off"
                        onChange={(e) => setVals((v) => ({ ...v, [i]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && !checked && check()}
                        className="min-w-[160px] flex-1 rounded-[10px] border-2 border-[#E2E4E9] bg-surface px-2.5 py-[7px] font-mono text-base text-ink outline-none focus:border-tone"
                      />
                      {!checked && s.why && !hints.includes(i) && (
                        <button type="button" onClick={() => setHints((x) => [...x, i])} className="rounded-full border-0 bg-surface px-3 py-[7px] text-[13px] font-bold text-ink-2">
                          Hint
                        </button>
                      )}
                    </div>
                    {bad && <span className="font-mono text-[15px] font-medium text-ok">{s.work}</span>}
                  </>
                )}
                {s.why && (!h || hints.includes(i) || checked) && <span className="text-sm leading-[1.45] text-pretty text-ink-3"><Inline text={s.why} /></span>}
              </div>
            </li>
          );
        })}
      </ol>
      {mode !== 'study' && (
        <Footer>
          {checked ? (
            <>
              <ScoreLine score={`${right}/${hidden.length}`} line={right === hidden.length ? (mode === 'faded' ? 'Nice. Now try Solve.' : 'Solved on your own.') : 'Compare your steps with the ones shown in green.'} />
              <Button variant="soft" onClick={() => switchMode(mode)}>Try again</Button>
            </>
          ) : (
            <>
              <span className="text-[15px] text-ink-3">{mode === 'faded' ? `First steps shown. Write the last ${hidden.length}.` : 'Write every step yourself.'}</span>
              <Button onClick={check}>Check steps</Button>
            </>
          )}
        </Footer>
      )}
    </BlockCard>
  );
}
