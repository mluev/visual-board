import { useEffect, useState } from 'react';
import { contracts } from '@kit/contracts';
import type { BoardDef } from '@kit/board';
import type { BoardResults } from '@kit/results/types';
import { BoardHeader, BoardShell } from '@kit/primitives/Board';
import { cn } from '@kit/lib/utils';
import { boards } from './boards';
import { Link } from './router';

function progress(b: BoardDef, r: BoardResults | undefined) {
  const tracked = b.blocks.filter((x) => contracts[x.type].results);
  const done = tracked.filter((x) => r?.blocks[x.id]?.status === 'submitted');
  const scores = done
    .map((x) => r!.blocks[x.id].attempts.at(-1))
    .filter((a) => a?.total)
    .map((a) => a!.score! / a!.total!);
  const avg = scores.length ? scores.reduce((a, s) => a + s, 0) / scores.length : null;
  const pct = tracked.length ? Math.round(((done.length / tracked.length) * 0.5 + (avg ?? 0) * 0.5) * 100) : 0;
  const started = !!r && Object.keys(r.blocks).length > 0;
  const mastered = tracked.length > 0 && done.length === tracked.length && avg === 1;
  const bits = [];
  if (tracked.length) bits.push(`${done.length}/${tracked.length} done`);
  if (avg != null) bits.push(`avg score ${Math.round(avg * 100)}%`);
  return { pct, status: mastered ? 'Mastered' : started ? 'In progress' : 'New', line: started ? bits.join(' · ') : 'Not started' };
}

const STATUS: Record<string, string> = {
  Mastered: 'bg-ok-soft text-[oklch(0.4_0.12_155)]',
  'In progress': 'bg-warn-soft text-[oklch(0.4_0.1_85)]',
  New: 'bg-[#F0F1F4] text-ink-2',
};

export function CourseMap() {
  const [results, setResults] = useState<Record<string, BoardResults>>({});
  const [filter, setFilter] = useState('All');
  useEffect(() => {
    const load = () =>
      fetch('/api/results')
        .then((r) => (r.ok ? r.json() : {}))
        .then(setResults)
        .catch(() => {});
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  const subjects = [...new Set(boards.map((b) => b.subject))];
  const shown = filter === 'All' ? subjects : [filter];

  return (
    <BoardShell>
      <BoardHeader kicker="Course map" title="What you're learning">
        {['All', ...subjects].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn('rounded-full border-0 px-[14px] py-[7px] text-sm font-bold', filter === s ? 'bg-ink text-white' : 'bg-surface text-ink')}>
            {s}
          </button>
        ))}
      </BoardHeader>
      {!boards.length && <p className="px-2 text-ink-3">No boards yet. Create one with <code>npm run new-board my-topic</code>.</p>}
      {shown.map((subject) => {
        const list = boards.filter((b) => b.subject === subject);
        return (
          <section key={subject} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3 px-2">
              <h2 className="m-0 font-display text-[26px] font-bold tracking-[-.015em]">{subject}</h2>
              <span className="text-sm font-medium text-ink-3">{list.length} board{list.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))' }}>
              {list.map((b) => {
                const p = progress(b, results[b.slug]);
                return (
                  <Link key={b.slug} href={`/b/${b.slug}`} className="flex flex-col gap-[14px] rounded-card bg-surface p-[22px] text-ink no-underline shadow-[0_1px_2px_rgba(20,22,30,.06)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:text-ink hover:shadow-[0_8px_24px_rgba(20,22,30,.08)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-ink-3">{b.lesson}</span>
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', STATUS[p.status])}>{p.status}</span>
                    </div>
                    <div className="font-display text-[22px] leading-[1.15] font-bold tracking-[-.01em] text-balance">{b.title}</div>
                    {b.blurb && <div className="text-[15px] leading-[1.45] text-pretty text-ink-2">{b.blurb}</div>}
                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="h-2 rounded-[4px] bg-[#F0F1F4]">
                        <div className="h-2 rounded-[4px] bg-[oklch(0.52_0.12_195)]" style={{ width: `${p.pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[13px] font-medium text-ink-3">
                        <span>{p.line}</span>
                        <span>{b.meta?.[0]}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </BoardShell>
  );
}
