import type { CSSProperties, KeyboardEventHandler, ReactNode } from 'react';
import type { Tone } from '@/kit/contract';
import { cn } from '@/kit/lib/utils';
import { ReviewPanel } from './ReviewPanel';

export function Pill({ tone, children, variant = 'solid', className }: { tone?: Tone; children: ReactNode; variant?: 'solid' | 'soft' | 'white' | 'ok' | 'bad'; className?: string }) {
  return (
    <span
      data-tone={tone}
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-3 py-[5px] text-[13px] leading-none font-bold whitespace-nowrap',
        variant === 'solid' && 'bg-tone text-white',
        variant === 'soft' && 'bg-tone-tint text-tone-ink',
        variant === 'white' && 'bg-surface text-ink font-medium text-sm',
        variant === 'ok' && 'bg-ok-soft text-ok',
        variant === 'bad' && 'bg-bad-soft text-bad',
        className,
      )}
    >
      {children}
    </span>
  );
}

export type BlockCardProps = {
  tone: Tone;
  pill: ReactNode;
  /** Title next to the pill. For blocks with a big in-body title, leave it out. */
  title?: ReactNode;
  /** Right side of the header (counter, timer, segmented control…). */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Minimum height in px (flashcards/quiz use 460). */
  minHeight?: number;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  /** Show the AI review for this block at the bottom (default true). */
  showReview?: boolean;
};

/** The white card every block lives in: coloured pill, optional title, header aside, body, AI review. */
export function BlockCard({ tone, pill, title, aside, children, className, style, minHeight, tabIndex, onKeyDown, showReview = true }: BlockCardProps) {
  return (
    <section
      data-tone={tone}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      style={{ minHeight, ...style }}
      className={cn('box-border flex h-full flex-col gap-4 rounded-card bg-surface p-6 text-ink shadow-[0_1px_2px_rgba(20,22,30,.06)] outline-none', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Pill tone={tone}>{pill}</Pill>
          {title != null && title !== '' && <h3 className="m-0 min-w-0 font-display text-[19px] font-bold tracking-[-.01em] text-balance">{title}</h3>}
        </div>
        {aside}
      </header>
      {children}
      {showReview && <ReviewPanel />}
    </section>
  );
}

/** Thin progress bar in the block tone. value is 0..1. */
export function Meter({ value, className, transition = 'width .3s' }: { value: number; className?: string; transition?: string }) {
  return (
    <div className={cn('h-2 rounded-[4px] bg-tone-tint', className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 rounded-[4px] bg-tone" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, transition }} />
    </div>
  );
}

/** Pill segmented control (Linear | Log, Study | Faded | Solve…). */
export function Segmented<T extends string>({ options, value, onChange, className }: { options: readonly { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="radiogroup" className={cn('flex gap-0.5 rounded-full bg-subtle p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn('rounded-full border-0 px-[14px] py-[7px] text-sm font-bold transition-colors', value === o.value ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,30,.08)]' : 'bg-transparent text-ink-3 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Rounded grey (or tinted) panel used inside blocks. */
export function Panel({ children, className, tinted }: { children: ReactNode; className?: string; tinted?: boolean }) {
  return <div className={cn('rounded-[14px] px-[14px] py-3', tinted ? 'bg-tone-soft' : 'bg-subtle', className)}>{children}</div>;
}
