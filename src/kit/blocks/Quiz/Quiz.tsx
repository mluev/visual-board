import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Meter, Panel } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { CodeBlock } from '@/kit/primitives/CodeBlock';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { OptionButton, ScoreBanner, verdictFor } from '@/kit/primitives/Answer';
import { useBlockResult } from '@/kit/results/store';
import { fmtClock } from '@/kit/lib/format';

type Phase = 'intro' | 'run' | 'done';
type Progress = { best?: { correct: number; total: number } };

export function Quiz({ title, description, questions: qs, timeLimit: L, initial }: BlockProps<'Quiz'>) {
  const res = useBlockResult<Progress>();
  const [phase, setPhase] = useState<Phase>(initial);
  const [qi, setQi] = useState(initial === 'done' ? qs.length - 1 : 0);
  const [picks, setPicks] = useState<(number | undefined)[]>(() =>
    initial === 'run' ? [1 % qs[0].options.length] : initial === 'done' ? qs.map((q, i) => (i === 0 ? (q.answer + 1) % q.options.length : q.answer)) : [],
  );
  const [time, setTime] = useState(initial === 'done' ? Math.round(L * 0.55) : L);
  const [best, setBest] = useState(res.progress?.best);

  const state = useRef({ picks, time });
  state.current = { picks, time };

  const finish = useCallback(
    (timeLeft: number) => {
      const p = state.current.picks;
      const correct = qs.filter((q, i) => p[i] === q.answer).length;
      const nb = !best || correct > best.correct ? { correct, total: qs.length } : best;
      setBest(nb);
      setPhase('done');
      void res.submit(
        {
          score: correct,
          total: qs.length,
          items: qs.map((q, i) => ({ prompt: q.code ? `${q.q}\n${q.code}` : q.q, answer: p[i] == null ? null : q.options[p[i]!], expected: q.options[q.answer], correct: p[i] === q.answer })),
          meta: L ? { secondsUsed: L - timeLeft, timeLimit: L, timedOut: timeLeft <= 0 } : undefined,
        },
        { best: nb },
      );
    },
    [qs, best, res, L],
  );

  useEffect(() => {
    if (phase !== 'run' || !L) return;
    const t = setInterval(() => {
      const next = state.current.time - 1;
      if (next <= 0) {
        setTime(0);
        finish(0);
      } else setTime(next);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, L, finish]);

  const start = () => {
    setPhase('run');
    setQi(0);
    setPicks([]);
    setTime(L);
  };
  const pick = (i: number) => setPicks((p) => Object.assign([...p], { [qi]: i }));
  const next = () => {
    if (picks[qi] == null) return;
    if (qi + 1 >= qs.length) finish(time);
    else setQi(qi + 1);
  };

  const Q = qs[Math.min(qi, qs.length - 1)];
  const sel = picks[qi];
  const correct = qs.filter((q, i) => picks[i] === q.answer).length;
  const bar = phase === 'run' ? (L ? time / L : (qi + 1) / qs.length) : phase === 'done' ? (L ? time / L : 1) : 1;

  const onKey = (e: React.KeyboardEvent) => {
    if (phase !== 'run' || (e.target as HTMLElement).tagName === 'INPUT') return;
    const k = e.key.toLowerCase();
    const n = /^[1-8]$/.test(k) ? +k - 1 : 'abcdefgh'.indexOf(k);
    if (n >= 0 && n < Q.options.length && k.length === 1) pick(n);
    else if (e.key === 'Enter') next();
  };

  return (
    <BlockCard
      tone="orange"
      pill="Quiz"
      minHeight={460}
      tabIndex={0}
      onKeyDown={onKey}
      aside={L ? <span className="rounded-full bg-tone-soft px-3 py-[5px] text-sm font-bold text-tone-ink tabular-nums">{fmtClock(time)}</span> : null}
    >
      <Meter value={bar} transition="width .4s linear" />

      {phase === 'intro' && (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <h2 className="m-0 font-display text-[32px] leading-[1.1] font-bold tracking-[-.01em] text-balance">{title}</h2>
          <p className="m-0 text-base leading-normal text-pretty text-ink-3">
            {description ?? `${qs.length} question${qs.length === 1 ? '' : 's'}${L ? ` · ${fmtClock(L)} time limit` : ''}. You'll see your score and a review of every answer at the end.`}
          </p>
          {best && <p className="m-0 text-sm font-medium text-ink-2">Best so far: {best.correct}/{best.total}</p>}
          <Button size="lg" className="mt-1 self-start" onClick={start}>Start quiz</Button>
        </div>
      )}

      {phase === 'run' && (
        <>
          <div className="text-sm font-medium text-ink-3">Question {qi + 1} of {qs.length}</div>
          <div className="font-display text-[23px] leading-[1.3] font-medium text-pretty"><Inline text={Q.q} /></div>
          {Q.code && <CodeBlock code={Q.code} className="py-3" />}
          <div className="flex flex-col gap-2" role="radiogroup">
            {Q.options.map((t, i) => (
              <OptionButton key={i} index={i} selected={sel === i} onClick={() => pick(i)}>{t}</OptionButton>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Button variant="ghost" size="md" className="px-1" style={{ opacity: qi === 0 ? 0 : 1 }} disabled={qi === 0} onClick={() => setQi(Math.max(0, qi - 1))}>← Back</Button>
            <Button variant="ink" size="md" disabled={sel == null} onClick={next}>{qi === qs.length - 1 ? 'Finish' : 'Next'}</Button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          <ScoreBanner score={`${correct}/${qs.length}`} verdict={verdictFor(correct / qs.length)} line={`${correct} of ${qs.length} correct${L ? ` · ${fmtClock(L - time)} used` : ''}`} />
          <div className="flex flex-col gap-2">
            {qs.map((q, i) => {
              const p = picks[i];
              const ok = p === q.answer;
              return (
                <Panel key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between gap-3 text-[15px]">
                    <span className="font-bold text-pretty">{i + 1}. <Inline text={q.q} /></span>
                    <span className={ok ? 'text-[13px] font-bold whitespace-nowrap text-ok' : 'text-[13px] font-bold whitespace-nowrap text-bad'}>{ok ? 'Correct' : 'Incorrect'}</span>
                  </div>
                  <div className="text-sm text-ink-3">
                    You: {p == null ? 'No answer' : q.options[p]}
                    {!ok && <> · Answer: {q.options[q.answer]}</>}
                  </div>
                  {q.explain && <RichText text={q.explain} className="text-sm leading-[1.45] text-ink-2" />}
                </Panel>
              );
            })}
          </div>
          <Button variant="soft" className="self-start" onClick={start}>Retake</Button>
        </>
      )}
    </BlockCard>
  );
}
