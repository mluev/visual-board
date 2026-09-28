import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { CodeBlock } from '@/kit/primitives/CodeBlock';
import { OptionButton } from '@/kit/primitives/Answer';
import { Counter, Footer, Item, ScoreLine } from '@/kit/primitives/Practice';
import { RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { asArray } from '@/kit/lib/grade';
import { cn } from '@/kit/lib/utils';

export function Test({ title, questions: qs, initial }: BlockProps<'Test'>) {
  const res = useBlockResult<{ picks: number[][] }>();
  const [picks, setPicks] = useState<number[][]>(() => {
    if (initial !== 'blank') return qs.map((q, i) => (i === qs.length - 1 && asArray(q.answer).length > 1 ? [asArray(q.answer)[0]] : [...asArray(q.answer)]));
    const saved = res.progress?.picks;
    return saved?.length === qs.length ? saved : qs.map(() => []);
  });
  const [submitted, setSubmitted] = useState(initial === 'submitted');

  const isRight = (i: number) => {
    const a = asArray(qs[i].answer);
    return picks[i].length === a.length && a.every((x) => picks[i].includes(x));
  };
  const answered = picks.filter((p) => p.length).length;
  const correct = qs.filter((_, i) => isRight(i)).length;

  const toggle = (qi: number, oi: number) => {
    if (submitted) return;
    const multi = asArray(qs[qi].answer).length > 1;
    const next = picks.map((p, i) => (i !== qi ? p : multi ? (p.includes(oi) ? p.filter((x) => x !== oi) : [...p, oi].sort()) : [oi]));
    setPicks(next);
    res.saveProgress({ picks: next });
  };
  const submit = () => {
    if (answered < qs.length) return;
    setSubmitted(true);
    const multiText = (q: (typeof qs)[number], idx: number[]) => (asArray(q.answer).length > 1 ? idx.map((i) => q.options[i]) : q.options[idx[0]]);
    void res.submit(
      {
        score: correct,
        total: qs.length,
        items: qs.map((q, i) => ({ prompt: q.code ? `${q.q}\n${q.code}` : q.q, answer: multiText(q, picks[i]), expected: multiText(q, asArray(q.answer)), correct: isRight(i) })),
      },
      { picks },
    );
  };
  const reset = () => {
    const empty = qs.map(() => []);
    setPicks(empty);
    setSubmitted(false);
    res.saveProgress({ picks: empty });
  };

  return (
    <BlockCard tone="blue" pill="Test" title={title} className="gap-5" aside={<Counter>{qs.length} questions</Counter>}>
      {qs.map((q, qi) => {
        const a = asArray(q.answer);
        const multi = a.length > 1;
        return (
          <Item key={qi} n={qi + 1} title={q.q} size="lg">
            {multi && <div className="text-[13px] font-medium text-ink-3">Select all that apply</div>}
            {q.code && <CodeBlock code={q.code} className="py-3" />}
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }} role={multi ? 'group' : 'radiogroup'}>
              {q.options.map((t, oi) => {
                const sel = picks[qi].includes(oi);
                const state = submitted ? (a.includes(oi) ? 'correct' : sel ? 'wrong' : undefined) : undefined;
                const mark = submitted ? (a.includes(oi) ? '✓' : sel ? '✕' : multi ? '' : undefined) : multi ? (sel ? '✓' : '') : undefined;
                return (
                  <OptionButton key={oi} index={oi} multi={multi} selected={sel} state={state} mark={mark} disabled={submitted} onClick={() => toggle(qi, oi)}>
                    {t}
                  </OptionButton>
                );
              })}
            </div>
            {submitted && q.explain && (
              <div className="flex gap-2.5 text-[15px] leading-[1.45] text-ink-2">
                <span className={cn('font-bold whitespace-nowrap', isRight(qi) ? 'text-ok' : 'text-bad')}>{isRight(qi) ? 'Correct' : 'Not quite'}</span>
                <RichText text={q.explain} />
              </div>
            )}
          </Item>
        );
      })}
      <Footer>
        {submitted ? (
          <>
            <ScoreLine score={`${correct}/${qs.length}`} line={correct === qs.length ? 'All correct.' : `${qs.length - correct} to review above.`} />
            <Button variant="soft" onClick={reset}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{answered} of {qs.length} answered</span>
            <Button disabled={answered < qs.length} onClick={submit}>Submit answers</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}
