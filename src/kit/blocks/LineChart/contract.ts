import { z } from 'zod';
import { defineContract, fn, named } from '@/kit/contract';
import { Param } from '../BarChart/contract';

export const Series = named(
  'Series',
  z.object({
    name: z.string(),
    points: z.array(z.tuple([z.number(), z.number()])).min(2).describe('[x, y] pairs, sorted by x'),
    color: z.string().optional().describe('CSS colour. Default: kit series colours'),
  }),
);
export type SeriesT = z.output<typeof Series>;

export const lineChart = defineContract({
  type: 'LineChart',
  category: 'chart',
  tone: 'teal',
  pill: 'Chart',
  purpose: 'Line chart of one or more series with hover read-out. Optionally live: a slider parameter feeds a function that returns the series.',
  whenToUse: 'Change over time or over a variable: growth, decay, compound interest, temperature, population, comparing curves.',
  schema: z.object({
    title: z.string().default(''),
    series: z.union([z.array(Series).min(1), fn<(p: number) => SeriesT[]>('(p: number) => Series[]')]).describe('Series, or a function of the slider value'),
    param: Param.optional().describe('Adds a slider; its value is passed to series() and note()'),
    note: z.union([z.string(), fn<(p: number, series: SeriesT[]) => string>('(p: number, series: Series[]) => string')]).optional(),
    xLabel: z.string().default('').describe('x-axis name, e.g. "years"'),
    yMin: z.number().optional().describe('Force the y-axis start (default: min(0, data))'),
    unit: z.string().default('').describe('Suffix for y values in the tooltip'),
  }),
  snippet: {
    title: 'Simple vs compound interest on £1,000',
    xLabel: 'years',
    param: { name: 'rate', min: 1, max: 12, step: 0.5, value: 7, unit: '%' },
    series: (r) => [{ name: 'Compound', points: [...Array(31).keys()].map((y) => [y, 1000 * (1 + r / 100) ** y] as [number, number]) }],
  },
  examples: {
    demo: {
      note: 'Live: slider → series(rate)',
      props: {
        title: 'Simple vs compound interest on £1,000',
        xLabel: 'years',
        unit: '',
        param: { name: 'rate', min: 1, max: 12, step: 0.5, value: 7, unit: '%' },
        series: (r: number) => {
          const yrs = [...Array(31).keys()];
          return [
            { name: 'Compound', points: yrs.map((y) => [y, 1000 * Math.pow(1 + r / 100, y)] as [number, number]) },
            { name: 'Simple', points: yrs.map((y) => [y, 1000 * (1 + (r / 100) * y)] as [number, number]) },
          ];
        },
        note: (r: number, s: SeriesT[]) => {
          const c = s[0].points[30][1];
          const p = s[1].points[30][1];
          return `After 30 years at ${r}%, £1,000 grows to £${Math.round(c).toLocaleString('en-GB')} compounded vs £${Math.round(p).toLocaleString('en-GB')} simple — ${(c / p).toFixed(1)}× more.`;
        },
      },
      wide: true,
    },
    static: {
      note: 'Static data',
      props: {
        title: 'Growth: x² vs 2ˣ',
        series: [
          { name: 'x²', points: [...Array(11).keys()].map((x) => [x, x * x] as [number, number]) },
          { name: '2ˣ', points: [...Array(11).keys()].map((x) => [x, 2 ** x] as [number, number]) },
        ],
        note: 'x² is ahead until x = 4. After that, 2ˣ pulls away fast.',
      },
    },
  },
});
