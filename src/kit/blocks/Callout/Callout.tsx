import type { BlockProps } from '@/kit/types';
import type { Tone } from '@/kit/contract';
import { BlockCard } from '@/kit/primitives/BlockCard';
import { RichText } from '@/kit/primitives/RichText';

const KIND: Record<BlockProps<'Callout'>['kind'], { tone: Tone; label: string }> = {
  note: { tone: 'blue', label: 'Note' },
  tip: { tone: 'teal', label: 'Tip' },
  warning: { tone: 'red', label: 'Watch out' },
  success: { tone: 'green', label: 'Nice work' },
  key: { tone: 'ink', label: 'Key idea' },
};

export function Callout({ kind, label, title, body }: BlockProps<'Callout'>) {
  const k = KIND[kind];
  return (
    <BlockCard tone={k.tone} pill={label ?? k.label} className="gap-3">
      {title && <h3 className="m-0 font-display text-[22px] leading-tight font-bold tracking-[-.01em] text-balance">{title}</h3>}
      <RichText text={body} className="text-base leading-normal text-ink-2" />
    </BlockCard>
  );
}
