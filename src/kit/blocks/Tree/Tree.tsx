import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import type { TreeNodeT } from './contract';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { RichText } from '@/kit/primitives/RichText';
import { cn } from '@/kit/lib/utils';

const count = (n: TreeNodeT): number => (n.children ?? []).reduce((a, c) => a + 1 + count(c), 0);
const allPaths = (n: TreeNodeT, p = '0'): string[] => [p, ...(n.children ?? []).flatMap((c, i) => allPaths(c, `${p}.${i}`))];

export function Tree({ title, root, open: initialOpen }: BlockProps<'Tree'>) {
  const [open, setOpen] = useState<string[]>(initialOpen);
  const [sel, setSel] = useState('0');
  const rows: { n: TreeNodeT; path: string; depth: number; isOpen: boolean }[] = [];
  const byPath: Record<string, { n: TreeNodeT; trail: string[] }> = {};
  const walk = (n: TreeNodeT, path: string, depth: number, trail: string[]) => {
    byPath[path] = { n, trail };
    const isOpen = open.includes(path);
    rows.push({ n, path, depth, isOpen });
    if (isOpen) (n.children ?? []).forEach((c, i) => walk(c, `${path}.${i}`, depth + 1, [...trail, n.label]));
  };
  walk(root, '0', 0, []);
  const S = byPath[sel] ?? byPath['0'];

  const click = (path: string, kids: number) => {
    setSel(path);
    if (kids) setOpen((o) => (o.includes(path) && sel === path ? o.filter((x) => x !== path) : [...new Set([...o, path])]));
  };

  return (
    <BlockCard
      tone="teal"
      pill="Tree"
      title={title}
      className="gap-[14px]"
      aside={
        <div className="flex gap-1.5">
          <Button variant="plain" size="sm" onClick={() => setOpen(allPaths(root))}>Expand all</Button>
          <Button variant="plain" size="sm" onClick={() => { setOpen([]); setSel('0'); }}>Collapse</Button>
        </div>
      }
    >
      <div className="grid items-start gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))' }}>
        <div role="tree" className="flex flex-col rounded-2xl bg-tone-soft p-2.5">
          {rows.map((r) => {
            const kids = r.n.children?.length ?? 0;
            return (
              <div key={r.path} className="flex items-stretch">
                {[...Array(r.depth).keys()].map((g) => (
                  <span key={g} className="flex w-5 shrink-0 justify-center"><span className="w-0.5 bg-[oklch(0.87_0.04_195)]" /></span>
                ))}
                <button
                  type="button"
                  role="treeitem"
                  aria-expanded={kids ? r.isOpen : undefined}
                  aria-selected={sel === r.path}
                  onClick={() => click(r.path, kids)}
                  className={cn('flex flex-1 items-center gap-2 rounded-[10px] border-0 px-2.5 py-[7px] text-left text-[15px] text-ink transition-colors', sel === r.path ? 'bg-surface font-bold' : cn('bg-transparent', r.depth === 0 ? 'font-bold' : 'font-medium'))}
                >
                  <span className="w-[18px] shrink-0 text-xs text-tone-ink transition-transform duration-150" style={{ transform: kids && r.isOpen ? 'rotate(90deg)' : undefined }}>{kids ? '▶' : '•'}</span>
                  <span className="flex-1">{r.n.label}</span>
                  {kids > 0 && !r.isOpen && <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-ink-3">{count(r.n)}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-subtle p-4">
          <span className="text-[13px] font-bold text-ink-3">{S.trail.length ? S.trail.join(' › ') : 'Top level'}</span>
          <span className="font-display text-2xl font-bold tracking-[-.01em]">{S.n.label}</span>
          <RichText
            text={S.n.note ?? (S.n.children ? `${S.n.children.length} branches: ${S.n.children.map((c) => c.label).join(', ')}.` : 'No further branches here.')}
            className="text-[15px] leading-normal text-ink-2"
          />
        </div>
      </div>
    </BlockCard>
  );
}
