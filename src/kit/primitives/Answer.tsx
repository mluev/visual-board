import type { ReactNode } from 'react';
import { cn } from '@/kit/lib/utils';
import { Inline } from './RichText';

const LETTERS = 'ABCDEFGH';

/** A lettered answer option (Quiz, Test). `state` shows grading after submit. */
export function OptionButton({ index, selected, onClick, children, state, multi, disabled, mark }: { index: number; selected: boolean; onClick?: () => void; children: string; state?: 'correct' | 'wrong' | 'missed'; multi?: boolean; disabled?: boolean; /** Replaces the letter (e.g. ✓ ✕). */ mark?: string }) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-[14px] border-2 px-3 py-2.5 text-left text-base font-medium text-ink transition-colors disabled:cursor-default',
        !state && (selected ? 'border-tone bg-tone-soft' : 'border-subtle bg-subtle hover:border-line'),
        state === 'correct' && 'border-ok bg-ok-soft',
        state === 'wrong' && 'border-bad bg-bad-soft',
        state === 'missed' && 'border-dashed border-ok bg-surface',
      )}
    >
      <span
        className={cn(
          'flex size-[26px] shrink-0 items-center justify-center text-[13px] font-bold',
          multi ? 'size-6 rounded-[7px]' : 'rounded-full',
          !state && (selected ? 'bg-tone text-white' : 'bg-surface text-ink-3'),
          state === 'correct' && 'bg-ok text-white',
          state === 'wrong' && 'bg-bad text-white',
          state === 'missed' && 'bg-ok-soft text-ok',
        )}
      >
        {mark ?? LETTERS[index]}
      </span>
      <span className="flex-1"><Inline text={children} /></span>
    </button>
  );
}

export function verdictFor(ratio: number) {
  return ratio === 1 ? 'Perfect score' : ratio >= 0.7 ? 'Solid — review what you missed' : ratio >= 0.4 ? 'Getting there' : 'Worth another pass';
}

/** Big score + verdict line at the top of a results screen. */
export function ScoreBanner({ score, verdict, line, children }: { score: ReactNode; verdict: ReactNode; line?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-tone-soft p-4">
      <span className="font-display text-5xl leading-none font-bold text-tone-ink tabular-nums">{score}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-bold">{verdict}</span>
        {line && <span className="text-sm text-ink-2">{line}</span>}
      </div>
      {children}
    </div>
  );
}
