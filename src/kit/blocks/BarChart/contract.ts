import { z } from 'zod';
import { defineContract, fn, named } from '@/kit/contract';

export const Bar = named('Bar', z.object({ label: z.string(), value: z.number() }));
export type BarT = z.output<typeof Bar>;

export const Param = named(
  'Param',
  z.object({
    name: z.string().describe('Shown as "name = value"'),
    min: z.number(),
    max: z.number(),
    step: z.number().default(1),
    value: z.number().describe('Starting value'),
    unit: z.string().optional().describe('Suffix after the value'),
  }),
);

export const barChart = defineContract({
  type: 'BarChart',
  category: 'chart',
  tone: 'teal',
  pill: 'Chart',
  purpose: 'Bar chart of labelled values. Optionally live: a slider parameter feeds a function that returns the bars, and the note updates with it.',
  whenToUse: 'Comparing a handful (2–10) of quantities, or showing how they change as one parameter moves (complexity classes, frequencies, costs).',
  schema: z.object({
    title: z.string().default('').describe('Chart title'),
    data: z.union([z.array(Bar), fn<(p: number) => BarT[]>('(p: number) => Bar[]')]).describe('Bars, or a function of the slider value'),
    param: Param.optional().describe('Adds a slider; its value is passed to data() and note()'),
    note: z.union([z.string(), fn<(p: number, data: BarT[]) => string>('(p: number, data: Bar[]) => string')]).optional().describe('Caption under the chart'),
    highlight: z.union([z.number(), z.string()]).optional().describe('Bar to emphasise: index or label (-1 = last)'),
    unit: z.string().optional().describe('Suffix for values, e.g. "%", " ms"'),
    allowLog: z.boolean().default(false).describe('Show a Linear | Log toggle'),
  }),
  snippet: {
    title: 'Why append is cheap on average',
    param: { name: 'appends', min: 1, max: 64, value: 20 },
    data: (n) => [{ label: 'copies', value: n * 2 }, { label: 'appends', value: n }],
    note: (n, d) => `${n} appends cost ${d[0].value} copies.`,
  },
  examples: {
    demo: {
      note: 'Live: slider → data(n), log toggle',
      props: {
        title: 'How much work does each algorithm do?',
        param: { name: 'n', min: 2, max: 64, value: 16 },
        data: (n: number) => {
          const l = Math.log2(n);
          return [{ label: 'O(log n)', value: l }, { label: 'O(n)', value: n }, { label: 'O(n log n)', value: n * l }, { label: 'O(n²)', value: n * n }];
        },
        note: (n: number, d: BarT[]) => `At n = ${n}, O(n²) does ${n}× the work of O(n), and ${Math.round(d[3].value / d[0].value).toLocaleString()}× the work of O(log n).`,
        highlight: 3,
        allowLog: true,
      },
    },
    static: {
      note: 'Static data with unit and highlight by label',
      props: {
        title: 'Most common English verbs (per 1,000 words)',
        data: [{ label: 'be', value: 8.9 }, { label: 'have', value: 4.2 }, { label: 'do', value: 2.6 }, { label: 'say', value: 1.9 }, { label: 'get', value: 1.6 }, { label: 'make', value: 1.2 }],
        highlight: 'be',
        note: '"Be" alone appears more often than the next three verbs put together.',
      },
    },
  },
});
