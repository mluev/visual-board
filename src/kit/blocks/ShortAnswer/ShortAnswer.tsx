import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, Item, Result, ScoreLine, TextField } from '@/kit/primitives/Practice';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { asArray, judge } from '@/kit/lib/grade';

const PREVIEW = ['merci', 'cafe', 'librairie'];

export function ShortAnswer({ title, questions: qs, initial }: BlockProps<'ShortAnswer'>) {
  const res = useBlockResult<{ vals: string[] }>();
  const [vals, setVals] = useState<string[]>(() => (initial === 'submitted' ? qs.map((q, i) => PREVIEW[i] ?? asArray(q.answer)[0]) : res.progress?.vals?.length === qs.length ? res.progress.vals : qs.map(() => '')));
  const [hints, setHints] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(initial === 'submitted');

  const verdicts = qs.map((q, i) => judge(vals[i], asArray(q.answer)));
  const correct = verdicts.filter((v) => v !== 'wrong').length;

  const set = (i: number, v: string) => {
    const next = Object.assign([...vals], { [i]: v });
    setVals(next);
    res.saveProgress({ vals: next });
  };
  const submit = () => {
    setSubmitted(true);
    void res.submit(
      {
        score: correct,
        total: qs.length,
        items: qs.map((q, i) => ({
          prompt: q.q,
          answer: vals[i],
          expected: asArray(q.answer).length > 1 ? asArray(q.answer) : asArray(q.answer)[0],
          correct: verdicts[i] !== 'wrong',
          note: verdicts[i] === 'close' ? 'almost (typo or accents)' : undefined,
          needsReview: verdicts[i] === 'wrong' && !!vals[i].trim() ? true : undefined,
        })),
      },
      { vals },
    );
  };
  const reset = () => {
    const empty = qs.map(() => '');
    setVals(empty);
    setHints([]);
    setSubmitted(false);
    res.saveProgress({ vals: empty });
  };

  return (
    <BlockCard tone="gold" pill="Type it" title={title} aside={<Counter>{qs.length} questions</Counter>}>
      {qs.map((q, i) => {
        const v = verdicts[i];
        const a = asArray(q.answer)[0];
        return (
          <Item key={i} n={i + 1} title={q.q} className="gap-2 pt-[14px]">
            <div className="flex flex-wrap items-center gap-2">
              <TextField
                aria-label={q.q}
                placeholder="Type your answer"
                className="min-w-[200px] flex-1"
                value={vals[i]}
                readOnly={submitted}
                state={submitted ? (v === 'wrong' ? 'wrong' : 'right') : 'idle'}
                onChange={(e) => set(i, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !submitted && submit()}
              />
              {q.hint && !submitted && (
                <Button variant="plain" size="sm" className="px-[14px] py-[9px] text-ink-2" onClick={() => setHints((h) => (h.includes(i) ? h.filter((x) => x !== i) : [...h, i]))}>
                  Hint
                </Button>
              )}
            </div>
            {q.hint && hints.includes(i) && !submitted && <div className="text-sm text-ink-3">Hint: <Inline text={q.hint} /></div>}
            {submitted && (
              <Result ok={v !== 'wrong'} label={v === 'right' ? 'Correct' : v === 'close' ? `Almost — the spelling is "${a}"` : `Answer: ${a}`}>
                {q.explain && <RichText text={q.explain} />}
              </Result>
            )}
          </Item>
        );
      })}
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${correct}/${qs.length}`} line={correct === qs.length ? 'All recalled.' : `${qs.length - correct} to review above.`} />
            <Button variant="soft" onClick={reset}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{vals.filter((x) => x.trim()).length} of {qs.length} answered</span>
            <Button onClick={submit}>Check answers</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}
