import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

export function SpotMistake({ title, lines: raw, instruction, mono, initial }: BlockProps<'SpotMistake'>) {
  const lines = raw.map((l) => (typeof l === 'string' ? { text: l } : l));
  const bad = lines.map((l, i) => (l.fix != null ? i : -1)).filter((i) => i >= 0);
  const res = useBlockResult();
  const [flags, setFlags] = useState<number[]>(() => (initial === 'submitted' ? [bad[0], bad[0] === 0 ? 2 : 0].filter((x) => x < lines.length) : []));
  const [submitted, setSubmitted] = useState(initial === 'submitted');

  const found = bad.filter((i) => flags.includes(i)).length;
  const falsePos = flags.filter((i) => !bad.includes(i));
  const toggle = (i: number) => !submitted && setFlags((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));
  const submit = () => {
    if (!flags.length) return;
    setSubmitted(true);
    void res.submit({
      score: found,
      total: bad.length,
      items: [
        ...bad.map((i) => ({ prompt: lines[i].text.trim(), answer: flags.includes(i) ? 'flagged' : 'missed', expected: lines[i].fix, correct: flags.includes(i) })),
        ...falsePos.map((i) => ({ prompt: lines[i].text.trim(), answer: 'flagged', expected: '(line is fine)', correct: false })),
      ],
    });
  };

  return (
    <BlockCard tone="gold" pill="Spot it" title={title} aside={<Counter>{bad.length} mistake{bad.length === 1 ? '' : 's'}</Counter>}>
      <div className="text-[15px] text-ink-3">{instruction ?? `Click every line that has a mistake. There ${bad.length === 1 ? 'is 1' : `are ${bad.length}`}.`}</div>
      <div className="flex flex-col gap-0.5 rounded-[14px] bg-subtle p-2">
        {lines.map((l, i) => {
          const f = flags.includes(i);
          const isBad = l.fix != null;
          const mark = !submitted ? (f ? 'Flagged' : '') : isBad ? (f ? 'Found' : 'Missed') : f ? 'This line is fine' : '';
          return (
            <div key={i} className="flex flex-col">
              <button
                type="button"
                aria-pressed={f}
                onClick={() => toggle(i)}
                className={cn(
                  'flex items-baseline gap-3 rounded-[10px] border-2 px-2.5 py-[7px] text-left leading-normal text-ink',
                  mono ? 'font-mono text-sm' : 'text-base',
                  !submitted && (f ? 'border-tone bg-tone-tint' : 'border-transparent bg-transparent hover:bg-surface/60'),
                  submitted && isBad && (f ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'),
                  submitted && !isBad && (f ? 'border-[#D5D8DE] bg-surface' : 'border-transparent bg-transparent'),
                )}
              >
                <span className="min-w-[18px] text-right font-mono text-xs font-medium text-ink-4">{i + 1}</span>
                <span className="flex-1 whitespace-pre-wrap">{l.text}</span>
                {mark && <span className={cn('font-sans text-xs font-bold whitespace-nowrap', !submitted ? 'text-tone-ink' : isBad ? (f ? 'text-ok' : 'text-bad') : 'text-ink-3')}>{mark}</span>}
              </button>
              {submitted && isBad && (
                <div className="mx-2.5 mt-1 mb-2 ml-10 text-sm leading-[1.45] text-pretty text-ink-2">
                  <span className="font-bold text-ok">Fix: </span>
                  <span className={mono ? 'font-mono' : undefined}>{l.fix!.trim()}</span>
                  {l.why && <> — <Inline text={l.why} /></>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${found}/${bad.length}`} line={found === bad.length && !falsePos.length ? 'Found them all.' : `${found} found${falsePos.length ? `, ${falsePos.length} flagged by mistake` : ''}.`} />
            <Button variant="soft" onClick={() => { setFlags([]); setSubmitted(false); }}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{flags.length} flagged</span>
            <Button disabled={!flags.length} onClick={submit}>Check</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}
