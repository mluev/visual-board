import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Meter } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { shuffle as shuffled } from '@/kit/lib/format';

const GRADES = [
  ['again', 'Again'],
  ['hard', 'Hard'],
  ['good', 'Good'],
  ['easy', 'Easy'],
] as const;
type Grade = (typeof GRADES)[number][0];
type Sched = Record<number, { ivl: number; ease: number; last?: Grade }>;
type Counts = Record<Grade, number>;
/** first = first grade of each card in the current session (used for the score). */
type Progress = { sched: Sched; queue: number[]; counts: Counts; first: Record<number, Grade> };

const ZERO: Counts = { again: 0, hard: 0, good: 0, easy: 0 };
const fmtIvl = (d: number) => (d <= 0 ? '<1m' : d < 1 ? Math.max(1, Math.round(d * 24)) + 'h' : d < 30 ? Math.round(d) + 'd' : Math.round(d / 30) + 'mo');
const nextIvl = (c: { ivl: number; ease: number }, g: Grade) => {
  const b = c.ivl;
  if (g === 'again') return 0;
  if (g === 'hard') return b ? b * 1.2 : 0.25;
  if (g === 'good') return b ? b * c.ease : 1;
  return b ? b * c.ease * 1.3 : 4;
};

export function Flashcards({ title, cards, shuffle, initial }: BlockProps<'Flashcards'>) {
  const res = useBlockResult<Progress>();
  const n = cards.length;
  const fresh = useMemo(() => () => (shuffle ? shuffled([...Array(n).keys()]) : [...Array(n).keys()]), [n, shuffle]);
  const saved = res.progress && res.progress.queue?.every((i) => i < n) ? res.progress : undefined;

  const [queue, setQueue] = useState<number[]>(() => saved?.queue ?? (initial === 'done' ? [] : fresh()));
  const [flip, setFlip] = useState(initial === 'back');
  const [sched, setSched] = useState<Sched>(saved?.sched ?? {});
  const [counts, setCounts] = useState<Counts>(saved?.counts ?? (initial === 'done' ? { again: 1, hard: 0, good: Math.max(0, n - 1), easy: 1 } : ZERO));
  const [first, setFirst] = useState<Record<number, Grade>>(saved?.first ?? {});

  const done = queue.length === 0;
  const card = cards[queue[0] ?? 0] ?? cards[0];
  const left = new Set(queue).size;
  const cur = sched[queue[0]] ?? { ivl: 0, ease: 2.5 };
  const total = counts.again + counts.hard + counts.good + counts.easy;

  const grade = (g: Grade) => {
    if (!queue.length) return;
    const i = queue[0];
    const c = sched[i] ?? { ivl: 0, ease: 2.5 };
    const ease = g === 'again' ? Math.max(1.3, c.ease - 0.2) : g === 'hard' ? Math.max(1.3, c.ease - 0.15) : g === 'easy' ? c.ease + 0.15 : c.ease;
    const ns: Sched = { ...sched, [i]: { ivl: nextIvl(c, g), ease, last: g } };
    const nq = queue.slice(1);
    if (g === 'again') nq.push(i);
    const nc = { ...counts, [g]: counts[g] + 1 };
    const nf = i in first ? first : { ...first, [i]: g };
    setQueue(nq);
    setFlip(false);
    setSched(ns);
    setCounts(nc);
    setFirst(nf);
    const progress: Progress = { sched: ns, queue: nq, counts: nc, first: nf };
    if (nq.length === 0) {
      void res.submit(
        {
          score: cards.filter((_, k) => nf[k] && nf[k] !== 'again').length,
          total: n,
          items: cards.map((c, k) => ({ prompt: c.front, expected: c.back, answer: nf[k] ?? null, note: nf[k] ? `first grade: ${nf[k]}` : undefined, correct: nf[k] ? nf[k] !== 'again' : null })),
          meta: { reviews: nc.again + nc.hard + nc.good + nc.easy, counts: nc },
        },
        progress,
      );
    } else res.saveProgress(progress);
  };
  const restart = () => {
    const q = fresh();
    setQueue(q);
    setFlip(false);
    setCounts(ZERO);
    setFirst({});
    res.saveProgress({ sched, queue: q, counts: ZERO, first: {} });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (queue.length) setFlip((f) => !f);
    } else if (flip && '1234'.includes(e.key) && e.key.length === 1) grade(GRADES[+e.key - 1][0]);
  };

  return (
    <BlockCard tone="violet" pill="Flashcards" title={title} minHeight={460} tabIndex={0} onKeyDown={onKey} aside={<span className="shrink-0 text-sm font-medium text-ink-3">{done ? `${n} cards` : `${left} left`}</span>}>
      <Meter value={(n - left) / n} />
      {!done ? (
        <>
          <div
            role="button"
            tabIndex={-1}
            onClick={() => setFlip((f) => !f)}
            className="flex min-h-[230px] flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[18px] bg-tone-soft p-7 text-center [perspective:900px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${queue[0]}-${flip}`}
                initial={{ rotateX: -70, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 70, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="flex flex-col items-center gap-2.5"
              >
                {!flip ? (
                  <>
                    {card.hint && <div className="text-[13px] font-bold text-tone-ink">{card.hint}</div>}
                    <div className="font-display text-[42px] leading-[1.1] font-bold tracking-[-.02em] text-balance">{card.front}</div>
                    <div className="text-sm text-ink-3">Tap or press Space to flip</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-ink-3">{card.front}</div>
                    <div className="font-display text-[26px] leading-[1.25] font-medium text-pretty"><Inline text={card.back} /></div>
                    {card.example && <div className="text-base leading-[1.45] text-pretty text-ink-3"><Inline text={card.example} /></div>}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {!flip ? (
            <Button size="block" onClick={() => setFlip(true)}>Show answer</Button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map(([k, label]) => (
                <button key={k} type="button" onClick={() => grade(k)} className="flex flex-col items-center gap-0.5 rounded-[14px] border-0 bg-tone-tint px-1 py-2.5 text-ink transition-colors hover:bg-tone-line/70">
                  <span className="text-[15px] font-bold">{label}</span>
                  <span className="text-[13px] text-ink-3">{fmtIvl(nextIvl(cur, k))}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-[18px]">
          <div className="flex flex-col gap-1">
            <div className="font-display text-[32px] font-bold tracking-[-.01em]">Deck complete</div>
            <div className="text-[15px] text-ink-3">{n} cards · {total} reviews · {counts.again} to relearn</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map(([k, label]) => (
              <div key={k} className="flex flex-col gap-0.5 rounded-[14px] bg-tone-soft p-3">
                <span className="font-display text-[28px] font-bold">{counts[k]}</span>
                <span className="text-[13px] text-ink-3">{label}</span>
              </div>
            ))}
          </div>
          <Button variant="soft" className="self-start" onClick={restart}>Review again</Button>
        </div>
      )}
    </BlockCard>
  );
}
