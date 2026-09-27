import { z } from 'zod';
import { defineContract, fn, named } from '@/kit/contract';

export const FormulaPart = named(
  'FormulaPart',
  z.object({
    t: z.string().describe('The symbol or text, e.g. "KE", "=", "½", "v²"'),
    name: z.string().optional().describe('Give a name to make the part explainable (hover/click)'),
    note: z.string().optional().describe('What it means, units, why it is there'),
  }),
);
export const CalcVar = named('CalcVar', z.object({ sym: z.string().describe('Key in v'), label: z.string().optional().describe('Input label, e.g. "m (kg)"'), value: z.number() }));

export const formula = defineContract({
  type: 'Formula',
  category: 'visual',
  tone: 'teal',
  pill: 'Formula',
  purpose: 'A big formula where each named part is explainable (hover or click to highlight it and read what it means), plus an optional "Try it" calculator.',
  whenToUse: 'Introducing any formula or equation: physics, finance, statistics, chemistry. Name every meaningful symbol; leave operators plain.',
  schema: z.object({
    title: z.string().default(''),
    parts: z.array(FormulaPart).min(1).describe('The formula split into parts, left to right'),
    calc: z
      .object({
        vars: z.array(CalcVar).min(1),
        f: fn<(v: Record<string, number>) => number>('(v: Record<string, number>) => number'),
        label: z.string().default('Result'),
      })
      .optional()
      .describe('Calculator: inputs for vars, result of f(v)'),
  }),
  snippet: {
    title: 'Kinetic energy',
    parts: [{ t: 'KE', name: 'Kinetic energy', note: 'In joules.' }, { t: '=' }, { t: '½' }, { t: 'm', name: 'Mass', note: 'kg' }, { t: 'v²', name: 'Speed squared', note: 'Double the speed → 4× the energy.' }],
    calc: { vars: [{ sym: 'm', label: 'm (kg)', value: 1200 }, { sym: 'v', label: 'v (m/s)', value: 14 }], f: (v) => 0.5 * v.m * v.v ** 2, label: 'KE (J)' },
  },
  examples: {
    demo: {
      note: 'Explainable parts and calculator',
      props: {
        title: 'Kinetic energy',
        parts: [
          { t: 'KE', name: 'Kinetic energy', note: 'Energy an object has because it is moving. Measured in joules (J).' },
          { t: '=' },
          { t: '½', name: 'One half', note: 'Comes from integrating force over distance. Work = ∫ m·v dv = ½mv².' },
          { t: 'm', name: 'Mass', note: 'In kilograms. Double the mass → double the energy.' },
          { t: 'v²', name: 'Velocity squared', note: 'In m/s. Double the speed → four times the energy. That’s why speed matters so much in crashes.' },
        ],
        calc: { vars: [{ sym: 'm', label: 'm (kg)', value: 1200 }, { sym: 'v', label: 'v (m/s)', value: 14 }], f: (v: Record<string, number>) => 0.5 * v.m * v.v * v.v, label: 'KE (joules)' },
      },
      wide: true,
    },
    plain: {
      note: 'No calculator',
      props: {
        title: 'Area of a circle',
        parts: [{ t: 'A', name: 'Area', note: 'Square units.' }, { t: '=' }, { t: 'π', name: 'Pi', note: '≈ 3.14159: circumference ÷ diameter for every circle.' }, { t: 'r²', name: 'Radius squared', note: 'Double the radius → 4× the area.' }],
      },
    },
  },
});
