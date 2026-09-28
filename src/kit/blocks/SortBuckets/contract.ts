import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const SortItem = named(
  'SortItem',
  z.object({
    text: z.string(),
    cat: z.number().int().min(0).describe('Index into categories'),
    why: z.string().optional().describe('Shown if the learner puts it in the wrong group'),
  }),
);

export const sortBuckets = defineContract({
  type: 'SortBuckets',
  category: 'practice',
  tone: 'gold',
  pill: 'Sort',
  purpose: 'Sort items into groups: drag a chip into a bucket, or click a chip then a bucket. Wrongly placed items explain why.',
  whenToUse: 'Classification: parts of speech, types of rock, O(n) vs O(n²) snippets, mammals vs reptiles. 2–4 groups, 6–12 items.',
  results: 'One attempt per check: items[{prompt: item text, answer: chosen group, expected: correct group, correct}].',
  schema: z
    .object({
      title: z.string().default(''),
      categories: z.array(z.string()).min(2).max(5),
      items: z.array(SortItem).min(2),
      mono: z.boolean().default(false),
      initial: z.enum(['open', 'submitted']).default('open').describe('Starting state (for previews)'),
    })
    .refine((p) => p.items.every((i) => i.cat < p.categories.length), { message: 'every item.cat must index into categories', path: ['items'] }),
  snippet: { title: 'Parts of speech', categories: ['Noun', 'Verb', 'Adjective'], items: [{ text: 'happiness', cat: 0, why: '-ness makes a noun.' }, { text: 'run', cat: 1 }, { text: 'bright', cat: 2 }] },
  examples: {
    demo: {
      note: 'Three groups',
      props: {
        title: 'Parts of speech',
        categories: ['Noun', 'Verb', 'Adjective'],
        items: [
          { text: 'happiness', cat: 0, why: '-ness turns an adjective into a noun.' },
          { text: 'run', cat: 1 },
          { text: 'enormous', cat: 2 },
          { text: 'bright', cat: 2 },
          { text: 'decide', cat: 1 },
          { text: 'decision', cat: 0, why: '-sion makes a noun from the verb "decide".' },
          { text: 'careful', cat: 2 },
          { text: 'city', cat: 0 },
        ],
      },
    },
    submitted: {
      note: 'mono, initial: "submitted"',
      props: {
        title: 'Time complexity',
        mono: true,
        initial: 'submitted',
        categories: ['O(1)', 'O(n)', 'O(n²)'],
        items: [
          { text: 'arr[0]', cat: 0 },
          { text: 'arr.includes(x)', cat: 1, why: 'includes scans the array.' },
          { text: 'nested for loops', cat: 2 },
          { text: 'map.get(k)', cat: 0 },
        ],
      },
    },
  },
});
