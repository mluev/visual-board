import { useCallback, useRef, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { CodeBlock } from '@/kit/primitives/CodeBlock';
import { CodeEditor } from '@/kit/primitives/CodeEditor';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { isRunnable, runJs, type TestRun } from '@/kit/lib/runJs';
import { cn } from '@/kit/lib/utils';

export function CodeExercise({ title, language, task, starter, tests, hints, solution }: BlockProps<'CodeExercise'>) {
  const res = useBlockResult<{ code: string }>();
  const [code, setCode] = useState(res.progress?.code ?? starter);
  const [hintN, setHintN] = useState(0);
  const [showSol, setShowSol] = useState(false);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<TestRun | null>(null);
  const [sent, setSent] = useState(false);
  const runnable = isRunnable(language) && tests.length > 0;
  const codeRef = useRef(code);
  codeRef.current = code;

  const edit = (v: string) => {
    setCode(v);
    setSent(false);
    res.saveProgress({ code: v });
  };
  const run = useCallback(async () => {
    if (!runnable || busy) return;
    setBusy(true);
    const c = codeRef.current;
    const r = await runJs(c, tests);
    setBusy(false);
    setOut(r);
    const passed = r.results?.filter((x) => x.ok).length ?? 0;
    void res.submit(
      {
        score: passed,
        total: tests.length,
        items: tests.map((t, i) => ({ prompt: t.call, answer: r.results?.[i]?.got ?? r.error, expected: t.expect, correct: r.results?.[i]?.ok ?? false })),
        meta: { code: c, language, error: r.error, hintsUsed: hintN, sawSolution: showSol },
      },
      { code: c },
    );
  }, [runnable, busy, tests, res, language, hintN, showSol]);
  const send = async () => {
    await res.submit({ items: [{ prompt: task, answer: code, expected: solution, needsReview: true }], meta: { language, hintsUsed: hintN, sawSolution: showSol } }, { code });
    setSent(true);
  };

  const passed = out?.results?.filter((r) => r.ok).length ?? 0;
  const allPass = !!out?.results && passed === tests.length;

  return (
    <BlockCard tone="gold" pill="Code" title={title} aside={<span className="rounded-lg bg-subtle px-2 py-1 font-mono text-[13px] text-ink-3">{language}</span>}>
      <RichText text={task} className="text-base leading-normal text-ink-2" />
      <CodeEditor value={code} onChange={edit} language={language} onRun={runnable ? run : undefined} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {hints.length > 0 && (
            <Button variant="plain" size="sm" className="px-[14px] py-[9px] text-ink-2" disabled={hintN >= hints.length} onClick={() => setHintN((n) => Math.min(n + 1, hints.length))}>
              {hintN >= hints.length ? 'No more hints' : `Hint ${hintN + 1} of ${hints.length}`}
            </Button>
          )}
          {solution && (
            <Button variant="plain" size="sm" className="px-[14px] py-[9px] text-ink-2" onClick={() => setShowSol((s) => !s)}>
              {showSol ? 'Hide solution' : 'Show solution'}
            </Button>
          )}
          <Button variant="plain" size="sm" className="px-[14px] py-[9px] text-ink-2" onClick={() => { edit(starter); setOut(null); }}>
            Reset code
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {runnable ? (
            <>
              <span className="text-[13px] text-ink-3">⌘/Ctrl + Enter</span>
              <Button className="px-5" disabled={busy} onClick={run}>{busy ? 'Running…' : 'Run tests'}</Button>
            </>
          ) : (
            <Button className="px-5" disabled={!code.trim() || code === starter} onClick={send}>{sent ? 'Sent ✓' : 'Send to tutor'}</Button>
          )}
        </div>
      </div>
      {hintN > 0 && (
        <div className="flex flex-col gap-1.5">
          {hints.slice(0, hintN).map((h, i) => (
            <div key={i} className="rounded-xl bg-tone-soft px-3 py-2.5 text-[15px] leading-[1.45] text-pretty text-ink-2">
              <b>Hint {i + 1}.</b> <Inline text={h} />
            </div>
          ))}
        </div>
      )}
      {showSol && solution && <CodeBlock code={solution} lang={language} className="rounded-[14px] leading-[1.6]" />}
      {out && (
        <div className="flex flex-col gap-1.5 border-t border-page pt-[14px]">
          <div className="flex items-baseline gap-3">
            <span className={cn('font-display text-[30px] leading-none font-bold', allPass ? 'text-ok' : 'text-bad')}>{out.error ? 'Error' : `${passed}/${tests.length}`}</span>
            <span className="text-[15px] text-ink-2">{out.error ?? (allPass ? 'All tests pass.' : 'tests passing')}</span>
          </div>
          {out.results?.map((r, i) => (
            <div key={i} className={cn('flex flex-col gap-0.5 rounded-xl px-3 py-2', r.ok ? 'bg-[oklch(0.96_0.03_155)]' : 'bg-[oklch(0.96_0.025_25)]')}>
              <div className="flex justify-between gap-3 font-mono text-sm">
                <span>{tests[i].call}</span>
                <span className={cn('font-sans text-[13px] font-bold', r.ok ? 'text-ok' : 'text-bad')}>{r.ok ? 'Pass' : 'Fail'}</span>
              </div>
              {!r.ok && <div className="font-mono text-[13px] text-ink-2">expected {JSON.stringify(tests[i].expect)} · got {r.got}</div>}
            </div>
          ))}
          {out.logs.length > 0 && <pre className="m-0 rounded-xl bg-subtle px-3 py-2.5 font-mono text-[13px] leading-normal whitespace-pre-wrap text-ink-2">{out.logs.join('\n')}</pre>}
        </div>
      )}
      {!runnable && (
        <div className="text-sm leading-[1.45] text-ink-3">
          {isRunnable(language) ? 'No tests for this one.' : `${language} can't run in the browser.`} Write your answer, send it to your tutor for a review, then compare it with the solution.
        </div>
      )}
    </BlockCard>
  );
}
