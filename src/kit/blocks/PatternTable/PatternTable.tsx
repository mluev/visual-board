import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard, Segmented } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { ScoreLine } from '@/kit/primitives/Practice';
import { Inline, RichText } from '@/kit/primitives/RichText';
import { useBlockResult } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';

const norm = (s: string) => s.trim().toLowerCase();

export function PatternTable({ title, subtitle, columns, rows, note, initial }: BlockProps<'PatternTable'>) {
  const res = useBlockResult();
  const [mode, setMode] = useState<'study' | 'practice'>(initial);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const pr = mode === 'practice';

  const cells = rows.flatMap((r, ri) =>
    r.cells.map((cell, ci) => {
      const [stem, end = ''] = cell.split('|');
      const key = `${ri}:${ci}`;
      return { ri, ci, key, stem, end, full: stem + end, ok: norm(vals[key] ?? '') === norm(stem + end) };
    }),
  );
  const right = cells.filter((c) => c.ok).length;

  const check = () => {
    setChecked(true);
    void res.submit({ score: right, total: cells.length, items: cells.map((c) => ({ prompt: `${rows[c.ri].label} · ${columns[c.ci]}`, answer: vals[c.key] ?? '', expected: c.full, correct: c.ok })) });
  };

  return (
    <BlockCard
      tone="teal"
      pill="Pattern"
      title={title}
      aside={<Segmented value={mode} onChange={(m) => { setMode(m); setVals({}); setChecked(false); }} options={[{ value: 'study', label: 'Study' }, { value: 'practice', label: 'Practice' }]} className="[&_button]:px-3" />}
    >
      {subtitle && <RichText text={subtitle} className="text-[15px] leading-normal text-ink-2" />}
      <div className="overflow-x-auto">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `minmax(90px,auto) repeat(${columns.length}, minmax(140px,1fr))`, minWidth: 90 + columns.length * 140 }}>
          <div />
          {columns.map((c) => (
            <div key={c} className="rounded-[10px] bg-tone-soft px-3 py-2 text-sm font-bold text-tone-ink">{c}</div>
          ))}
          {rows.map((r, ri) => (
            <div key={ri} className="contents">
              <div className="self-center py-2.5 pr-3 text-[15px] font-bold text-ink-3"><Inline text={r.label} /></div>
              {cells
                .filter((c) => c.ri === ri)
                .map((c) => {
                  const good = pr && checked && c.ok;
                  const bad = pr && checked && !c.ok;
                  return (
                    <div key={c.key} className={cn('flex min-h-9 items-center gap-1.5 rounded-[10px] border-2 px-2 py-1.5', good ? 'border-ok bg-ok-soft' : bad ? 'border-bad bg-bad-soft' : pr ? 'border-[#E2E4E9] bg-surface' : 'border-subtle bg-subtle')}>
                      {!pr ? (
                        <span className="px-1 text-[17px]">
                          <span>{c.stem}</span>
                          <span className="rounded bg-[oklch(0.93_0.04_195)] px-0.5 font-bold text-[oklch(0.48_0.13_195)]">{c.end}</span>
                        </span>
                      ) : (
                        <input
                          aria-label={`${r.label} ${columns[c.ci]}`}
                          value={vals[c.key] ?? ''}
                          readOnly={checked}
                          spellCheck={false}
                          autoComplete="off"
                          onChange={(e) => setVals((v) => ({ ...v, [c.key]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && !checked && check()}
                          className="w-full min-w-0 border-0 bg-transparent px-1.5 py-1 text-base text-ink outline-none"
                        />
                      )}
                      {bad && <span className="text-[13px] font-bold whitespace-nowrap text-ok">{c.full}</span>}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      {note && !pr && <RichText text={note} className="rounded-xl bg-subtle px-[14px] py-2.5 text-[15px] leading-normal text-ink-2" />}
      {pr && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-page pt-4">
          {checked ? (
            <>
              <ScoreLine score={`${right}/${cells.length}`} line={right === cells.length ? 'Every form correct, accents included.' : 'The correct forms are shown in green.'} />
              <Button variant="soft" onClick={() => { setVals({}); setChecked(false); }}>Try again</Button>
            </>
          ) : (
            <>
              <span className="text-[15px] text-ink-3">Fill in every form from memory</span>
              <Button onClick={check}>Check</Button>
            </>
          )}
        </div>
      )}
    </BlockCard>
  );
}
