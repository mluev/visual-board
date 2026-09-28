import { useBlockReview } from '@/kit/results/store';
import { cn } from '@/kit/lib/utils';
import { RichText } from './RichText';

const VERDICT: Record<string, { label: string; cls: string }> = {
  correct: { label: 'Correct', cls: 'bg-ok-soft text-ok' },
  partial: { label: 'Partly right', cls: 'bg-warn-soft text-warn' },
  incorrect: { label: 'Not quite', cls: 'bg-bad-soft text-bad' },
};

/** Shows the AI's feedback (reviews/<board>.json → blocks[id]) at the bottom of a block. */
export function ReviewPanel() {
  const review = useBlockReview();
  if (!review || (!review.feedback && !review.verdict && !review.items?.length)) return null;
  const v = review.verdict ? (VERDICT[review.verdict] ?? { label: review.verdict, cls: 'bg-tone-tint text-tone-ink' }) : null;
  return (
    <aside aria-label="Feedback" className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-tone-line bg-tone-soft p-4 animate-in fade-in slide-in-from-bottom-1">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold text-tone-ink">Feedback</span>
        {v && <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', v.cls)}>{v.label}</span>}
      </div>
      <RichText text={review.feedback} className="text-[15px] leading-normal text-ink-2" />
      {review.items?.length ? (
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
          {review.items.map((it) => (
            <li key={it.index} className="flex gap-2 text-sm leading-snug text-ink-2">
              <span className={cn('font-bold tabular-nums', it.correct === false ? 'text-bad' : it.correct ? 'text-ok' : 'text-ink-3')}>{it.index + 1}.</span>
              <RichText text={it.feedback} />
            </li>
          ))}
        </ol>
      ) : null}
    </aside>
  );
}
