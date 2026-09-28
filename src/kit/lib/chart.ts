/** Chart helpers shared by LineChart, FunctionPlot and friends. */

/** "Nice" axis ticks covering [min, max] with roughly n steps. */
export function niceTicks(min: number, max: number, n = 4) {
  const span = max - min || 1;
  const s0 = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(s0)));
  const f = s0 / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(8));
  return { lo, hi, ticks };
}

/** Axis label: 1.2k, 3.4M, 0.25, 12. */
export const fmtAxis = (v: number) =>
  Math.abs(v) >= 1000 ? (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : (v / 1000).toFixed(Math.abs(v) >= 1e4 ? 0 : 1) + 'k') : Math.abs(v) < 10 && v % 1 ? v.toFixed(2) : Math.round(v).toString();

/** Series colours used when a series has no colour of its own. */
export const SERIES_COLORS = ['oklch(0.52 0.12 195)', 'oklch(0.55 0.16 290)', 'oklch(0.58 0.16 45)', 'oklch(0.55 0.16 250)', 'oklch(0.55 0.16 340)', 'oklch(0.55 0.13 155)'];
