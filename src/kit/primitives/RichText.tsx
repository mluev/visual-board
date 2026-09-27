import { Fragment, type ReactNode } from 'react';
import { cn } from '@/kit/lib/utils';

/**
 * Tiny, safe text formatter used by every block for prose props.
 *   blank line → new paragraph · "- " lines → bullets · `code` · **bold** · *italic* · [text](url)
 */
export function RichText({ text, className, pClassName }: { text?: string | null; className?: string; pClassName?: string }) {
  if (!text) return null;
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {blocks.flatMap((b, i) => runs(b.split('\n')).map((run, r) =>
        run.list ? (
          <ul key={`${i}.${r}`} className="m-0 flex list-disc flex-col gap-1 pl-5">
            {run.lines.map((l, j) => (
              <li key={j}>{inline(l.replace(BULLET, ''))}</li>
            ))}
          </ul>
        ) : (
          <p key={`${i}.${r}`} className={cn('m-0 text-pretty', pClassName)}>
            {run.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        ),
      ))}
    </div>
  );
}

const BULLET = /^\s*[-•]\s+/;

/** Splits a paragraph's lines into consecutive runs of text lines and bullet lines. */
function runs(lines: string[]) {
  const out: { list: boolean; lines: string[] }[] = [];
  for (const l of lines) {
    const list = BULLET.test(l);
    if (out.length && out[out.length - 1].list === list) out[out.length - 1].lines.push(l);
    else out.push({ list, lines: [l] });
  }
  return out;
}

const TOKEN =/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Inline formatting only (no paragraphs). */
export function inline(s: string): ReactNode {
  const parts = s.split(TOKEN);
  return parts.map((p, i) => {
    if (i % 2 === 0) return p;
    if (p.startsWith('`')) return <code key={i} className="rounded-md bg-subtle px-1.5 py-px font-mono text-[0.88em]">{p.slice(1, -1)}</code>;
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p)!;
      const safe = /^(https?:|\/|#)/.test(m[2]) ? m[2] : '#';
      return <a key={i} href={safe} target={safe.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{m[1]}</a>;
    }
    return <em key={i}>{p.slice(1, -1)}</em>;
  });
}

/** Inline-formatted single line, as a component. */
export function Inline({ text }: { text?: string | null }) {
  return <>{text ? inline(text) : null}</>;
}
