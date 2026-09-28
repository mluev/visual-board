import { useMemo, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { useBlockResult } from '@/kit/results/store';
import { clean, judge } from '@/kit/lib/grade';
import { cn } from '@/kit/lib/utils';

type Seg = { text: string } | { blank: number; answers: string[] };

function parse(src: string): Seg[] {
  const segs: Seg[] = [];
  const re = /\[([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  let last = 0;
  let n = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) segs.push({ text: src.slice(last, m.index) });
    segs.push({ blank: n++, answers: m[1].split('|').map((s) => s.trim()) });
    last = re.lastIndex;
  }
  if (last < src.length) segs.push({ text: src.slice(last) });
  return segs;
}

/** The sentence around blank i, with ___ in its place (for results). */
function context(segs: Seg[], i: number) {
  const flat = segs.map((s) => ('text' in s ? s.text : s.blank === i ? '___' : s.answers[0])).join('');
  const at = flat.indexOf('___');
  const start = Math.max(flat.lastIndexOf('.', at - 1), flat.lastIndexOf('\n', at - 1)) + 1;
  const endDot = flat.slice(at).search(/[.\n]/);
  return flat.slice(start, endDot < 0 ? undefined : at + endDot + 1).trim();
}

export function Cloze({ title, text, bank, mono, initial }: BlockProps<'Cloze'>) {
  const segs = useMemo(() => parse(text), [text]);
  const blanks = segs.filter((s): s is Extract<Seg, { blank: number }> => 'blank' in s);
  const res = useBlockResult<{ vals: string[] }>();
  const [vals, setVals] = useState<string[]>(() =>
    initial === 'submitted' ? blanks.map((b, i) => (i === 1 ? b.answers[0].replace(/é/g, 'e') : i === 2 ? 'avez' : b.answers[0])) : res.progress?.vals?.length === blanks.length ? res.progress.vals : blanks.map(() => ''),
  );
  const [submitted, setSubmitted] = useState(initial === 'submitted');

  const verdicts = blanks.map((b, i) => judge(vals[i], b.answers));
  const correct = verdicts.filter((v) => v !== 'wrong').length;
  const close = verdicts.filter((v) => v === 'close').length;
  const words = blanks.map((b) => b.answers[0]).sort((a, b) => a.localeCompare(b));

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
        total: blanks.length,
        items: blanks.map((b, i) => ({
          prompt: context(segs, i),
          answer: vals[i],
          expected: b.answers.length > 1 ? b.answers : b.answers[0],
          correct: verdicts[i] !== 'wrong',
          note: verdicts[i] === 'close' ? 'almost (typo or accents)' : undefined,
          needsReview: verdicts[i] === 'wrong' && !!vals[i].trim() ? true : undefined,
        })),
      },
      { vals },
    );
  };
  const reset = () => {
    const empty = blanks.map(() => '');
    setVals(empty);
    setSubmitted(false);
    res.saveProgress({ vals: empty });
  };

  return (
    <BlockCard tone="gold" pill="Fill in" title={title} className="gap-[18px]" aside={<Counter>{blanks.length} blanks</Counter>}>
      {bank && !submitted && (
        <div className="flex flex-wrap gap-2">
          {words.map((w, k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                const i = vals.findIndex((v) => !v);
                if (i >= 0) set(i, w);
              }}
              className="rounded-full border-0 bg-tone-tint px-[14px] py-[7px] text-[15px] font-medium text-ink transition-opacity"
              style={{ opacity: vals.some((v) => clean(v) === clean(w)) ? 0.35 : 1 }}
            >
              {w}
            </button>
          ))}
        </div>
      )}
      <div className={cn('text-[18px] leading-[2.2] text-pretty text-ink', mono && 'font-mono text-base')} onKeyDown={(e) => e.key === 'Enter' && !submitted && submit()}>
        {segs.map((s, k) => {
          if ('text' in s) return <span key={k} className="whitespace-pre-wrap">{s.text}</span>;
          const i = s.blank;
          const v = verdicts[i];
          return (
            <span key={k} className="inline-flex items-baseline gap-1.5">
              <input
                aria-label={`Blank ${i + 1}`}
                value={vals[i]}
                readOnly={submitted}
                spellCheck={false}
                autoComplete="off"
                onChange={(e) => set(i, e.target.value)}
                style={{ width: `${Math.max(...s.answers.map((a) => a.length), 4) + 3}ch` }}
                className={cn(
                  'rounded-lg border-2 px-2 py-[3px] text-center text-[17px] text-ink outline-none [font-family:inherit]',
                  !submitted && (vals[i] ? 'border-tone bg-tone-soft' : 'border-tone-line bg-tone-soft'),
                  submitted && (v === 'wrong' ? 'border-bad bg-bad-soft' : 'border-ok bg-ok-soft'),
                )}
              />
              {submitted && v !== 'right' && <span className="text-[15px] font-bold text-ok">{v === 'close' ? `✓ ${s.answers[0]}` : s.answers[0]}</span>}
            </span>
          );
        })}
      </div>
      <Footer>
        {submitted ? (
          <>
            <ScoreLine
              score={`${correct}/${blanks.length}`}
              line={correct === blanks.length ? (close ? `All correct. Check the spelling on ${close}.` : 'All correct.') : `The correct answers are shown in green.${close ? ' Small typos count as correct.' : ''}`}
            />
            <Button variant="soft" onClick={reset}>Try again</Button>
          </>
        ) : (
          <>
            <span className="text-[15px] text-ink-3">{vals.filter(Boolean).length} of {blanks.length} filled · Enter to check</span>
            <Button onClick={submit}>Check</Button>
          </>
        )}
      </Footer>
    </BlockCard>
  );
}
