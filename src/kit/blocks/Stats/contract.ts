import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Stat = named(
  'Stat',
  z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]).describe('Big number or short text, e.g. 42, "O(n)", "1914"'),
    note: z.string().optional().describe('Small line under the value'),
    trend: z.enum(['up', 'down', 'flat']).optional().describe('Adds ▲ ▼ ▬'),
  }),
);

export const stats = defineContract({
  type: 'Stats',
  category: 'layout',
  tone: 'teal',
  pill: 'At a glance',
  purpose: 'A row of big-number tiles (KPI style).',
  whenToUse: 'Key facts that are numbers: dates, sizes, complexities, percentages, results. 2–6 tiles.',
  schema: z.object({
    label: z.string().default('At a glance').describe('Pill text'),
    title: z.string().default(''),
    items: z.array(Stat).min(1).max(8),
    tone: z.enum(['teal', 'violet', 'orange', 'blue', 'gold', 'pink', 'ink']).default('teal'),
  }),
  snippet: { title: 'Slices in numbers', items: [{ label: 'Header size', value: '24 B', note: 'ptr + len + cap' }, { label: 'Growth factor', value: '2×', note: 'until 256 elements' }] },
  examples: {
    demo: {
      note: 'Four tiles with notes and trends',
      props: {
        title: 'World War I in numbers',
        items: [
          { label: 'Began', value: 1914, note: '28 July' },
          { label: 'Countries involved', value: 32 },
          { label: 'Mobilised', value: '70 M', note: 'soldiers' },
          { label: 'Empires dissolved', value: 4, trend: 'down' },
        ],
      },
      wide: true,
    },
    violet: { note: 'tone: "violet"', props: { tone: 'violet', label: 'Your progress', items: [{ label: 'Cards learned', value: 24, trend: 'up' }, { label: 'Best quiz', value: '5/6' }] } },
  },
});
