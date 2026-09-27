import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Counter, Footer, ScoreLine } from '@/kit/primitives/Practice';
import { Inline } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

const PREVIEW_ANSWER = 'The Earth is tilted on its axis, so as it goes around the Sun one half leans toward the Sun and gets sunlight more directly, and the days are longer. That half has summer.';

type Progress = { text: string; ticks?: number[]; phase?: 'write' | 'review' };

export function ExplainBack({ title, prompt, keyPoints, initial }: BlockProps<'ExplainBack'>) {
  const points = keyPoints.map((p) => (typeof p === 'string' ? { point: p, keywords: [] as string[] } : { point: p.point, keywords: p.keywords ?? [] }));
  const autoTicks = (t: string) => {
    const s = t.toLowerCase();
    return points.map((p, i) => (p.keywords.some((k) => s.includes(k.toLowerCase())) ? i : -1)).filter((i) => i >= 0);
  };
  const res = useBlockResult<Progress>();
  const saved = res.progress;
  const [text, setText] = useState(initial === 'review' ? PREVIEW_ANSWER : (saved?.text ?? ''));
  const [phase, setPhase] = useState<'write' | 'review'>(initial === 'review' ? 'review' : (saved?.phase ?? 'write'));
  const [ticks, setTicks] = useState<number[]>(() => (initial === 'review' ? autoTicks(PREVIEW_ANSWER) : (saved?.ticks ?? [])));
  const [sent, setSent] = useState<'idle' | 'busy' | 'sent'>('idle');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const save = (p: Partial<Progress>) => res.saveProgress({ text, ticks, phase, ...p });

  const compare = () => {
    if (!text.trim()) return;
    const t = autoTicks(text);
    setTicks(t);
    setPhase('review');
    setSent('idle');
    save({ ticks: t, phase: 'review' });
  };
  const toggle = (i: number) => {
    const t = ticks.includes(i) ? ticks.filter((x) => x !== i) : [...ticks, i].sort();
    setTicks(t);
    setSent('idle');
    save({ ticks: t });
  };
  const send = async () => {
    setSent('busy');
    await res.submit(
      {
        score: ticks.length,
        total: points.length,
        items: [{ prompt, answer: text, needsReview: true }, ...points.map((p, i) => ({ prompt: `Key point: ${p.point}`, answer: ticks.includes(i) ? 'ticked' : 'not ticked', needsReview: true }))],
        meta: { selfGraded: true, words },
      },
      { text, ticks, phase },
    );
    setSent('sent');
  };
  const reset = () => {
    setText('');
    setTicks([]);
    setPhase('write');
    setSent('idle');
    res.saveProgress({ text: '', ticks: [], phase: 'write' });
  };

  return (
    <BlockCard tone="gold" pill="Explain it" title={title} aside={<Counter>{words} words</Counter>}>
      <div className="font-display text-[22px] leading-[1.3] font-medium text-pretty"><Inline text={prompt} /></div>
      {phase === 'write' ? (
        <>
          <textarea
            aria-label="Your explanation"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              res.saveProgress({ text: e.target.value, ticks, phase });
            }}
            placeholder="Write from memory, in your own words, as if teaching a friend. Don't look anything up."
            className="min-h-[180px] resize-y rounded-[14px] border-2 border-tone-line bg-[oklch(0.99_0.008_85)] p-[14px] text-base leading-[1.55] text-ink outline-none focus:border-tone"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-ink-3">You'll compare it with {points.length} key points.</span>
            <Button disabled={!text.trim()} onClick={compare}>Compare with key points</Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-[14px] bg-subtle p-[14px] text-base leading-[1.55] whitespace-pre-wrap text-pretty text-ink-2">{text}</div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-bold">Did you cover these? Tick what you explained.</span>
            <Button variant="ink" size="sm" className="px-4 py-[9px]" disabled={sent === 'busy'} onClick={send}>
              {sent === 'busy' ? 'Sending…' : sent === 'sent' ? 'Sent ✓' : 'Send to tutor'}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {points.map((p, i) => {
              const on = ticks.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(i)}
                  className={cn('flex items-start gap-3 rounded-[14px] border-2 px-3 py-2.5 text-left text-base leading-[1.4] text-ink', on ? 'border-ok bg-ok-soft' : 'border-subtle bg-subtle')}
                >
                  <span className={cn('mt-px flex size-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 text-[13px] font-bold text-white', on ? 'border-ok bg-ok' : 'border-[#C9CCD3] bg-surface')}>{on ? '✓' : ''}</span>
                  <span><Inline text={p.point} /></span>
                </button>
              );
            })}
          </div>
          <Footer>
            <ScoreLine score={`${ticks.length}/${points.length}`} line={ticks.length === points.length ? 'You covered everything.' : `Add the unticked ${points.length - ticks.length === 1 ? 'point' : 'points'} and explain it again tomorrow.`} />
            <div className="flex gap-2">
              <Button variant="ghost" className="border-2 border-tone-line text-ink" onClick={() => { setPhase('write'); save({ phase: 'write' }); }}>Edit my answer</Button>
              <Button variant="soft" onClick={reset}>Start over</Button>
            </div>
          </Footer>
        </>
      )}
    </BlockCard>
  );
}
