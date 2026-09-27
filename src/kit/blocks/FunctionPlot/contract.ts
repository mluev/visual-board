import { z } from 'zod';
import { defineContract, fn, named } from '@/kit/contract';

type P = Record<string, number>;

export const PlotFn = named(
  'PlotFn',
  z.object({
    name: z.string().describe('Legend label, e.g. "y = sin(x)"'),
    f: fn<(x: number, p: P) => number>('(x: number, p: Record<string, number>) => number').describe('p holds the slider values by name'),
    color: z.string().optional(),
  }),
);
export const PlotParam = named(
  'PlotParam',
  z.object({ name: z.string().describe('Key in p, e.g. "a"'), min: z.number(), max: z.number(), step: z.number().default(0.1), value: z.number() }),
);

export const functionPlot = defineContract({
  type: 'FunctionPlot',
  category: 'visual',
  tone: 'teal',
  pill: 'Plot',
  purpose: 'Plots y = f(x) on a grid with sliders for parameters, a live formula, hover read-out and a note that updates with the parameters.',
  whenToUse: 'Maths and physics: how a, b, c change a graph (parabolas, sine waves, exponentials), comparing functions, seeing roots and intercepts.',
  notes: ['p is { [param.name]: current slider value } for every entry in params. fns can mix live curves (using p) with fixed reference curves (ignoring p), e.g. the plain y = x² for comparison. Points where f returns NaN/Infinity are skipped (gaps in the curve).'],
  schema: z.object({
    title: z.string().default(''),
    fns: z.array(PlotFn).min(1),
    params: z.array(PlotParam).default([]),
    x: z.tuple([z.number(), z.number()]).default([-6, 6]).describe('x range'),
    y: z.tuple([z.number(), z.number()]).default([-6, 6]).describe('y range'),
    formula: z.union([z.string(), fn<(p: P) => string>('(p: Record<string, number>) => string')]).optional().describe('Shown above the sliders. Default: function names'),
    note: z.union([z.string(), fn<(p: P) => string>('(p: Record<string, number>) => string')]).optional(),
  }),
  snippet: {
    title: 'Transforming a parabola',
    params: [{ name: 'a', min: -3, max: 3, value: 1 }, { name: 'k', min: -5, max: 5, step: 0.5, value: 0 }],
    fns: [{ name: 'y = a·x² + k', f: (x, p) => p.a * x * x + p.k }],
    formula: (p) => `y = ${p.a}x² + ${p.k}`,
  },
  examples: {
    demo: {
      note: 'Three parameters, live formula and note',
      props: {
        title: 'Transforming a parabola',
        params: [
          { name: 'a', min: -3, max: 3, step: 0.1, value: 1 },
          { name: 'h', min: -5, max: 5, step: 0.5, value: 0 },
          { name: 'k', min: -5, max: 5, step: 0.5, value: 0 },
        ],
        fns: [{ name: 'y = a(x − h)² + k', f: (x: number, p: P) => p.a * (x - p.h) ** 2 + p.k }],
        formula: (p: P) => `y = ${p.a}(x − ${p.h})² + ${p.k}`,
        note: (p: P) => `Vertex at (${p.h}, ${p.k}). ${p.a > 0 ? 'Opens upward' : p.a < 0 ? 'Opens downward' : 'a = 0, so it’s a flat line'}${Math.abs(p.a) > 1 ? ', narrower than y = x²' : Math.abs(p.a) < 1 && p.a !== 0 ? ', wider than y = x²' : ''}.`,
      },
      wide: true,
    },
    compare: {
      note: 'Two functions, no parameters',
      props: {
        title: 'sin and cos',
        x: [-7, 7],
        y: [-2, 2],
        fns: [
          { name: 'sin x', f: (x: number) => Math.sin(x) },
          { name: 'cos x', f: (x: number) => Math.cos(x) },
        ],
        note: 'cos is sin shifted left by π/2.',
      },
    },
  },
});
