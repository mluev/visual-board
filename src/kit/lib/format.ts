/** 90 → "1:30" */
export const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

/** Compact number for chart labels: 1.5, 42, 1,024. */
export const fmtNum = (v: number, unit = '') => (Math.abs(v) < 10 && v % 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-GB')) + unit;

/** Fisher–Yates shuffle with an optional seed, so a board shuffles the same way on every render. */
export function shuffle<T>(arr: readonly T[], seed = Math.random() * 2 ** 32): T[] {
  const a = [...arr];
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
