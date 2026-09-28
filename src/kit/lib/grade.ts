/** Answer checking shared by typed-answer blocks (ShortAnswer, Cloze, WorkedExample…). */

export type Verdict = 'right' | 'close' | 'wrong';

/** Lower-case, collapse spaces, drop punctuation. */
export const clean = (s: unknown) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?,;:"'’]/g, '');

/** Remove accents: "é" → "e". */
export const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export function levenshtein(a: string, b: string) {
  const d = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++) {
    let p = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = t;
    }
  }
  return d[b.length];
}

/** right = exact (ignoring case/punctuation), close = missing accents or a small typo, wrong otherwise. */
export function judge(value: unknown, answers: string[]): Verdict {
  const c = clean(value);
  if (!c) return 'wrong';
  if (answers.some((a) => clean(a) === c)) return 'right';
  const y = stripAccents(c);
  if (
    answers.some((a) => {
      const x = stripAccents(clean(a));
      return x === y || (x.length > 3 && levenshtein(x, y) <= (x.length > 6 ? 2 : 1));
    })
  )
    return 'close';
  return 'wrong';
}

/** For maths/code steps: ignore spaces, unify minus/times signs, drop a trailing period. */
export const canon = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/\s+/g, '')
    .replace(/[.;]$/, '');

export const asArray = <T,>(v: T | T[]) => (Array.isArray(v) ? v : [v]);
