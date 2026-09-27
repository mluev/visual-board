import { useState } from 'react';
import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { Button } from '@/kit/primitives/Button';
import { Inline, RichText } from '@/kit/primitives/RichText';

const KIND = { start: 'START', step: 'STEP', decision: 'QUESTION', end: 'RESULT' } as const;

export function FlowDiagram({ title, nodes, cases }: BlockProps<'FlowDiagram'>) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const [path, setPath] = useState<string[]>([nodes[0].id]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [ci, setCi] = useState(0);
  const cur = path[path.length - 1];

  const go = (from: string, to: string | undefined, choice: string) => {
    if (!to) return;
    setPath((p) => [...p.slice(0, p.indexOf(from) + 1), to]);
    setChoices((c) => ({ ...c, [from]: choice }));
  };

  return (
    <BlockCard tone="teal" pill="Flow" title={title} aside={<Button variant="plain" size="sm" className="px-[14px]" onClick={() => { setPath([nodes[0].id]); setChoices({}); setCi((c) => c + 1); }}>Start over</Button>}>
      {cases.length > 0 && (
        <div className="rounded-[14px] bg-tone-soft px-[14px] py-3 text-base leading-normal text-pretty">
          <b>Example:</b> <Inline text={cases[ci % cases.length]} />
        </div>
      )}
      <div className="flex flex-col items-center">
        {path.map((id, k) => {
          const n = byId[id];
          if (!n) return null;
          const active = id === cur;
          const dec = n.type === 'decision';
          const end = n.type === 'end';
          return (
            <div key={id + k} className="flex w-full flex-col items-center">
              {k > 0 && (
                <div className="flex h-[30px] flex-col items-center">
                  <div className="w-0.5 flex-1 bg-tone" />
                  <div className="size-0 border-x-[6px] border-t-8 border-x-transparent border-t-tone" />
                </div>
              )}
              <div
                className="box-border flex w-full max-w-[520px] flex-col items-center gap-2.5 border-2 px-[18px] py-[14px] text-center transition-[background,border-color,opacity] duration-200 animate-in fade-in slide-in-from-top-1"
                style={{
                  background: end && active ? 'var(--ok-soft)' : active ? 'var(--tone-soft)' : '#FFFFFF',
                  borderColor: end && active ? 'var(--ok)' : active ? 'var(--tone)' : '#E2E4E9',
                  borderRadius: dec ? 28 : n.type === 'start' ? 999 : 16,
                  opacity: active ? 1 : 0.75,
                }}
              >
                <span className="text-xs font-bold tracking-[.02em]" style={{ color: active ? 'var(--tone-ink)' : 'var(--ink-4)' }}>{KIND[n.type]}</span>
                <span className="text-[17px] leading-[1.35] text-balance" style={{ fontWeight: active ? 700 : 500 }}><Inline text={n.text} /></span>
                {n.note && (active || end) && <RichText text={n.note} className="text-sm leading-[1.45] text-ink-2" />}
                {dec && active && (
                  <div className="flex gap-2">
                    <Button size="sm" className="px-[18px] py-[9px] text-[15px]" onClick={() => go(n.id, n.yes, n.yesLabel ?? 'Yes')}>{n.yesLabel ?? 'Yes'}</Button>
                    <Button variant="ghost" size="sm" className="bg-surface px-[18px] py-[9px] text-[15px] text-ink shadow-[inset_0_0_0_2px_oklch(0.85_0.05_195)]" onClick={() => go(n.id, n.no, n.noLabel ?? 'No')}>{n.noLabel ?? 'No'}</Button>
                  </div>
                )}
                {dec && !active && choices[n.id] && <span className="text-[13px] font-bold text-tone-ink">→ {choices[n.id]}</span>}
                {active && !dec && !end && n.next && <Button size="sm" className="px-4" onClick={() => go(n.id, n.next, '')}>Next →</Button>}
              </div>
            </div>
          );
        })}
      </div>
    </BlockCard>
  );
}
