import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Pair = named('Pair', z.object({ left: z.string().describe('Term (shown in order)'), right: z.string().describe('Its match (shuffled)') }));

export const matching = defineContract({
  type: 'Matching',
  category: 'practice',
  tone: 'gold',
  pill: 'Match',
  purpose: 'Match each item on the left with its partner on the right (shuffled). Wrong picks flash red; matched pairs get their own colour.',
  whenToUse: 'Terms ↔ definitions, words ↔ translations, functions ↔ outputs, causes ↔ effects. 4–7 pairs.',
  results: 'When every pair is matched: an attempt with items[{prompt: left, expected: right, correct: matched on the first try, note: "n wrong tries"}]; score = pairs matched first time.',
  schema: z.object({
    title: z.string().default(''),
    pairs: z.array(Pair).min(2).max(10),
    mono: z.boolean().default(false).describe('Monospace left column, for code'),
    initial: z.enum(['open', 'done']).default('open').describe('Starting state (for previews)'),
  }),
  snippet: { title: 'Cell parts and their jobs', pairs: [{ left: 'mitochondria', right: 'Makes ATP for the cell' }, { left: 'ribosome', right: 'Builds proteins' }, { left: 'nucleus', right: 'Stores the DNA' }] },
  examples: {
    demo: {
      note: 'Five pairs',
      props: {
        title: 'Cell parts and their jobs',
        pairs: [
          { left: 'mitochondria', right: 'Makes ATP for the cell' },
          { left: 'ribosome', right: 'Builds proteins' },
          { left: 'nucleus', right: 'Stores the DNA' },
          { left: 'cell membrane', right: 'Controls what enters and leaves' },
          { left: 'chloroplast', right: 'Captures light for photosynthesis' },
        ],
      },
    },
    done: { note: 'mono, initial: "done"', props: { title: 'What does it return?', mono: true, initial: 'done', pairs: [{ left: 'len("héllo")', right: '5' }, { left: '"a" * 3', right: '"aaa"' }, { left: 'bool([])', right: 'False' }, { left: '7 // 2', right: '3' }] } },
  },
});
