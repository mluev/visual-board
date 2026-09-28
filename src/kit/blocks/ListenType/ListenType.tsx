import { useEffect, useRef, useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Meter, Panel, Segmented } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { ScoreBanner } from '@/kit/primitives/Answer';
import { useBlockResult } from '@/kit/results/store';
import { clean, levenshtein, stripAccents, type Verdict } from '@/kit/lib/grade';
import { cn } from '@/kit/lib/utils';

const LANGS: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ja: 'Japanese', zh: 'Chinese', ko: 'Korean', ru: 'Russian', ar: 'Arabic', tr: 'Turkish', uz: 'Uzbek' };

/** Whole-sentence judging: allow ~8% edit distance for spelling slips. */
function judgeSentence(v: string, a: string): Verdict {
  const x = clean(a);
  const y = clean(v);
  if (!y) return 'wrong';
  if (x === y) return 'right';
  return levenshtein(stripAccents(x), stripAccents(y)) <= Math.max(1, Math.round(x.length * 0.08)) ? 'close' : 'wrong';
}

type SR = { lang: string; interimResults: boolean; start(): void; stop(): void; abort(): void; onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const getSR = (): (new () => SR) | null => (typeof window === 'undefined' ? null : ((window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition ?? null));

export function ListenType({ title, items, lang }: BlockProps<'ListenType'>) {
  const res = useBlockResult();
  const [mode, setMode] = useState<'listen' | 'speak'>('listen');
  const [i, setI] = useState(0);
  const [val, setVal] = useState('');
  const [heard, setHeard] = useState('');
  const [judged, setJudged] = useState(false);
  const [results, setResults] = useState<{ r: Verdict; yours: string }[]>([]);
  const [rec, setRec] = useState(false);
  const recRef = useRef<SR | null>(null);
  const srOK = !!getSR();

  useEffect(
    () => () => {
      try {
        window.speechSynthesis?.cancel();
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const done = i >= items.length;
  const it = items[Math.min(i, items.length - 1)];
  const itLang = it.lang ?? lang;
  const cur = results[i];
  const ok = results.filter((x) => x.r !== 'wrong').length;

  const say = (rate: number) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = itLang;
    u.rate = rate;
    speechSynthesis.speak(u);
  };
  const check = (input = mode === 'speak' ? heard : val) => {
    const r = judgeSentence(input, it.text);
    setJudged(true);
    setResults((rs) => [...rs, { r, yours: input || '—' }]);
  };
  const next = () => {
    const ni = i + 1;
    setI(ni);
    setVal('');
    setHeard('');
    setJudged(false);
    if (ni >= items.length)
      void res.submit({
        score: results.filter((x) => x.r !== 'wrong').length,
        total: items.length,
        items: items.map((x, k) => ({ prompt: x.text, answer: results[k]?.yours ?? null, expected: x.text, correct: results[k] ? results[k].r !== 'wrong' : false, note: results[k]?.r === 'close' ? 'almost (spelling slip)' : undefined })),
        meta: { mode },
      });
  };
  const listen = () => {
    if (rec) return recRef.current?.stop();
    const Ctor = getSR();
    if (!Ctor) return;
    const r = new Ctor();
    recRef.current = r;
    r.lang = itLang;
    r.interimResults = false;
    r.onresult = (e) => {
      const h = e.results[0][0].transcript;
      setHeard(h);
      setRec(false);
      check(h);
    };
    r.onend = () => setRec(false);
    r.onerror = () => setRec(false);
    setRec(true);
    r.start();
  };
  const restart = (m = mode) => {
    setMode(m);
    setI(0);
    setVal('');
    setHeard('');
    setJudged(false);
    setResults([]);
  };

  return (
    <BlockCard
      tone="gold"
      pill="Listen"
      title={title}
      minHeight={420}
      aside={<Segmented value={mode} onChange={(m) => (m === 'listen' || srOK) && restart(m)} options={[{ value: 'listen', label: 'Listen & type' }, { value: 'speak', label: srOK ? 'Say it' : 'Say it (n/a)' }]} className="[&_button]:px-3" />}
    >
      <Meter value={Math.min(results.length, items.length) / items.length} />
      {!done ? (
        <>
          <div className="flex justify-between text-sm font-medium text-ink-3">
            <span>{i + 1} of {items.length}</span>
            <span>{LANGS[itLang.slice(0, 2)] ?? itLang}</span>
          </div>
          <div className="flex flex-col items-center gap-[14px] rounded-[18px] bg-tone-soft p-[18px]">
            {mode === 'listen' ? (
              <>
                <div className="flex gap-2.5">
                  <button type="button" aria-label="Play" onClick={() => say(0.95)} className="size-16 rounded-full border-0 bg-tone text-[22px] text-white hover:bg-tone-strong">▶</button>
                  <button type="button" onClick={() => say(0.6)} className="h-16 rounded-full border-0 bg-surface px-[18px] text-[15px] font-bold text-ink">Slow</button>
                </div>
                <span className="text-sm text-ink-3">Play as many times as you need.</span>
              </>
            ) : (
              <>
                <div className="text-center font-display text-[30px] leading-[1.2] font-bold text-balance">{it.text}</div>
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => say(0.95)} className="h-12 rounded-full border-0 bg-surface px-4 text-[15px] font-bold text-ink">▶ Hear it</button>
                  <button type="button" onClick={listen} className={cn('h-12 min-w-[140px] rounded-full border-0 px-[18px] text-[15px] font-bold text-white', rec ? 'bg-bad' : 'bg-tone')}>
                    {rec ? '● Listening… tap to stop' : '● Record'}
                  </button>
                </div>
              </>
            )}
          </div>
          {mode === 'listen' && (
            <input
              aria-label="What you hear"
              value={val}
              readOnly={judged}
              placeholder="Type what you hear"
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (judged ? next() : check())}
              className={cn('rounded-[14px] border-2 px-[14px] py-3 text-lg text-ink outline-none', !judged ? (val ? 'border-tone bg-subtle' : 'border-subtle bg-subtle') : cur?.r !== 'wrong' ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft')}
            />
          )}
          {judged && cur && (
            <div className="flex flex-col gap-1 text-[15px] leading-[1.45]">
              <span className={cn('font-bold', cur.r !== 'wrong' ? 'text-ok' : 'text-bad')}>
                {mode === 'speak' ? `Heard: "${heard}"${cur.r !== 'wrong' ? ' ✓' : ''}` : cur.r === 'right' ? 'Correct' : cur.r === 'close' ? 'Almost — small spelling slip' : 'Not quite. It was:'}
              </span>
              <span className="text-[17px] font-medium">{it.text}</span>
              {it.translation && <span className="text-ink-3">{it.translation}</span>}
            </div>
          )}
          <div className="mt-auto flex justify-end gap-2">
            {!judged && mode === 'listen' && <Button onClick={() => check()}>Check</Button>}
            {judged && <Button variant="ink" onClick={next}>{i === items.length - 1 ? 'See results' : 'Next'}</Button>}
          </div>
        </>
      ) : (
        <>
          <ScoreBanner score={`${ok}/${items.length}`} verdict={ok === items.length ? 'You caught every phrase.' : 'Replay the ones you missed and try again.'} />
          <div className="flex flex-col gap-1.5">
            {items.map((x, k) => {
              const r = results[k] ?? { r: 'wrong' as Verdict, yours: '—' };
              return (
                <Panel key={k} className="flex justify-between gap-3 px-3 py-2.5 text-[15px]">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-bold">{x.text}</span>
                    <span className="text-ink-3">You: {r.yours}</span>
                  </span>
                  <span className={cn('text-[13px] font-bold whitespace-nowrap', r.r === 'wrong' ? 'text-bad' : 'text-ok')}>{r.r === 'wrong' ? 'Missed' : 'Correct'}</span>
                </Panel>
              );
            })}
          </div>
          <Button variant="soft" className="self-start" onClick={() => restart()}>Go again</Button>
        </>
      )}
    </BlockCard>
  );
}
