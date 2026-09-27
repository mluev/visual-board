import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/kit/lib/utils';
import { Inline } from './RichText';

/** Grey count label on the right of a block header ("3 questions"). */
export function Counter({ children }: { children: ReactNode }) {
  return <span className="shrink-0 text-sm font-medium text-ink-3">{children}</span>;
}

/** One numbered question row, separated by a hairline. */
export function Item({ n, title, size = 'md', children, className }: { n: number | string; title: string; size?: 'md' | 'lg'; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5 border-t border-page pt-4', className)}>
      <div className="flex items-baseline gap-2.5">
        <span className="text-sm font-bold text-tone-ink">{n}</span>
        <span className={size === 'lg' ? 'font-display text-xl leading-[1.3] font-medium text-pretty' : 'text-[17px] leading-[1.4] font-medium text-pretty'}>
          <Inline text={title} />
        </span>
      </div>
      {children}
    </div>
  );
}

/** Bottom action row: status/score on the left, buttons on the right. */
export function Footer({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-4 border-t border-page pt-4">{children}</div>;
}

/** Big score + one line, used in footers after checking. */
export function ScoreLine({ score, line, bad }: { score: ReactNode; line?: ReactNode; bad?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className={cn('font-display text-4xl leading-none font-bold tabular-nums', bad ? 'text-bad' : 'text-tone-ink')}>{score}</span>
      {line && <span className="text-[15px] text-ink-2">{line}</span>}
    </div>
  );
}

export type FieldState = 'idle' | 'right' | 'wrong';

/** Text input in the kit style. `state` colours it after checking. */
export function TextField({ state = 'idle', mono, className, value, ...rest }: InputHTMLAttributes<HTMLInputElement> & { state?: FieldState; mono?: boolean }) {
  return (
    <input
      spellCheck={false}
      autoComplete="off"
      value={value}
      className={cn(
        'min-w-0 rounded-xl border-2 px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-4',
        mono && 'font-mono',
        state === 'idle' && (value ? 'border-tone bg-subtle' : 'border-subtle bg-subtle focus:border-tone-line'),
        state === 'right' && 'border-ok bg-ok-soft',
        state === 'wrong' && 'border-bad bg-bad-soft',
        className,
      )}
      {...rest}
    />
  );
}

/** Correct / Not quite line with an explanation. */
export function Result({ ok, label, children }: { ok: boolean; label: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-[15px] leading-[1.45]">
      <span className={cn('font-bold', ok ? 'text-ok' : 'text-bad')}>{label}</span>
      {children && <span className="text-pretty text-ink-2">{children}</span>}
    </div>
  );
}
