import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const VennItem = named(
  'VennItem',
  z.object({
    text: z.string(),
    in: z.array(z.number().int().min(0)).describe('Indexes of the sets it belongs to; [] = outside all'),
  }),
);

export const venn = defineContract({
  type: 'Venn',
  category: 'visual',
  tone: 'teal',
  pill: 'Venn',
  purpose: 'A 2- or 3-set Venn diagram with items placed in their regions. "Sort it yourself" mode: the learner clicks where each item belongs, then checks.',
  whenToUse: 'Comparing overlapping categories: animal traits, language features, set theory, "which of these is both…". 5–10 items.',
  results: 'In "Sort it yourself" mode, one attempt per check: items[{prompt: item, answer: sets it was placed in (or "none"), expected, correct}].',
  schema: z
    .object({
      title: z.string().default(''),
      sets: z.array(z.string()).min(2).max(3).describe('2 or 3 set names'),
      items: z.array(VennItem).min(1),
      initial: z.enum(['view', 'practice']).default('view').describe('Starting mode'),
    })
    .refine((p) => p.items.every((i) => i.in.every((s) => s < p.sets.length)), { message: 'item.in must index into sets', path: ['items'] }),
  snippet: { title: 'Animal traits', sets: ['Mammals', 'Can fly'], items: [{ text: 'Dog', in: [0] }, { text: 'Bat', in: [0, 1] }, { text: 'Eagle', in: [1] }] },
  examples: {
    demo: {
      note: 'Three sets',
      props: {
        title: 'Animal traits',
        sets: ['Mammals', 'Can fly', 'Lives in water'],
        items: [
          { text: 'Dog', in: [0] },
          { text: 'Bat', in: [0, 1] },
          { text: 'Whale', in: [0, 2] },
          { text: 'Eagle', in: [1] },
          { text: 'Duck', in: [1, 2] },
          { text: 'Shark', in: [2] },
          { text: 'Butterfly', in: [1] },
        ],
      },
    },
    practice: { note: 'Two sets, initial: "practice"', props: { title: 'Python vs JavaScript', initial: 'practice', sets: ['Python', 'JavaScript'], items: [{ text: 'list comprehensions', in: [0] }, { text: 'first-class functions', in: [0, 1] }, { text: '=== operator', in: [1] }, { text: 'garbage collected', in: [0, 1] }, { text: 'pointer arithmetic', in: [] }] } },
  },
});
