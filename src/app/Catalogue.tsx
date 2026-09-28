import { CATEGORY_LABEL, type Category, type Example } from '@kit/contract';
import { blockTypes, contracts, type BlockType } from '@kit/contracts';
import { Block } from '@kit/Block';
import { Pill } from '@kit/primitives/BlockCard';
import { BoardShell } from '@kit/primitives/Board';
import type { z } from 'zod';
import { Link } from './router';

const ORDER: Category[] = ['core', 'assessment', 'chart', 'practice', 'visual', 'layout'];

/** /kit: every block, every named variant (mirrors design/Learning Kit.dc.html). */
export function Catalogue({ only }: { only?: string }) {
  const types = only && only in contracts ? [only as BlockType] : blockTypes;
  return (
    <BoardShell wide>
      <header className="flex max-w-[820px] flex-col gap-[18px] pt-4 pb-4">
        <span className="text-sm font-bold text-ink-3">UI kit · v0.1</span>
        <h1 className="m-0 font-display text-[64px] leading-none font-bold tracking-[-.03em]">Learning Kit</h1>
        <p className="m-0 text-[19px] leading-normal text-pretty text-ink-2">
          Interactive blocks an AI puts together into a board for any subject. Every block works on its own, takes plain data as props, and saves results to <code>results/&lt;board&gt;.json</code> when it sits on a board.
        </p>
        <div className="flex flex-wrap gap-2">
          {ORDER.flatMap((c) => blockTypes.filter((t) => contracts[t].category === c)).map((t) => (
            <Link key={t} href={`/kit/${t}`} className="no-underline">
              <Pill tone={contracts[t].tone}>{t}</Pill>
            </Link>
          ))}
        </div>
      </header>
      {ORDER.map((cat) => {
        const list = types.filter((t) => contracts[t].category === cat);
        if (!list.length) return null;
        return (
          <div key={cat} className="flex flex-col gap-14">
            <h2 className="m-0 border-t border-line pt-8 font-display text-sm font-bold tracking-wide text-ink-3 uppercase">{CATEGORY_LABEL[cat]}</h2>
            {list.map((t) => (
              <BlockSection key={t} type={t} />
            ))}
          </div>
        );
      })}
    </BoardShell>
  );
}

function BlockSection({ type }: { type: BlockType }) {
  const c = contracts[type];
  const examples = Object.entries(c.examples) as [string, Example<z.ZodObject>][];
  return (
    <section id={type} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-1.5">
          <h3 className="m-0 font-display text-[34px] font-bold tracking-[-.02em]">
            <Link href={`/kit/${type}`} className="text-ink no-underline hover:text-ink">{type}</Link>
          </h3>
          <p className="m-0 text-base leading-normal text-pretty text-ink-2">{c.purpose}</p>
          <p className="m-0 text-sm leading-normal text-pretty text-ink-3"><b>Use when:</b> {c.whenToUse}</p>
        </div>
        <code className="rounded-[10px] bg-surface px-3 py-2 font-mono text-[13px] text-ink-2">{Object.keys(c.schema.shape).join(' · ')}</code>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))' }}>
        {examples.map(([name, ex]) => (
          <div key={name} className="flex min-w-0 flex-col gap-2" style={ex.wide ? { gridColumn: '1 / -1' } : undefined}>
            <span className="text-sm font-bold text-ink-3">
              {name} <span className="font-medium">— {ex.note}</span>
            </span>
            <div className="flex-1">
              <Block type={type} props={ex.props as Record<string, unknown>} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
