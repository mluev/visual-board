import type { BlockProps } from '@/kit/types';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { RichText, Inline } from '@/kit/primitives/RichText';
import { CodeBlock } from '@/kit/primitives/CodeBlock';

export function Explainer({ label, title, body, code, lang, points }: BlockProps<'Explainer'>) {
  return (
    <BlockCard tone="ink" pill={label} className="gap-[14px]">
      <h2 className="m-0 font-display text-[28px] leading-[1.15] font-bold tracking-[-.015em] text-balance">{title}</h2>
      <RichText text={body} className="max-w-[68ch] text-[17px] leading-[1.55] text-ink-2" />
      {code && <CodeBlock code={code} lang={lang} />}
      {points?.length ? (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {points.map((pt, i) => (
            <li key={i} className="flex items-baseline gap-3 rounded-xl bg-subtle px-[14px] py-2.5">
              <span className="text-[13px] font-bold text-ink-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-base leading-[1.45] text-pretty"><Inline text={pt} /></span>
            </li>
          ))}
        </ol>
      ) : null}
    </BlockCard>
  );
}
