import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export const cloze = defineContract({
  type: 'Cloze',
  category: 'practice',
  tone: 'gold',
  pill: 'Fill in',
  purpose: 'A passage with gaps the learner types into, with an optional word bank. Typos and missing accents count as "almost".',
  whenToUse: 'Vocabulary and grammar in context, key terms in a paragraph, filling in code keywords (with mono). 3–8 blanks.',
  results: 'One attempt per check: items[{prompt: the sentence with ___ for the blank, answer, expected, correct}]. Non-matching answers are marked needsReview.',
  notes: ['Enter checks. Clicking a word-bank chip fills the next empty blank.'],
  schema: z.object({
    title: z.string().default(''),
    text: z
      .string()
      .refine((t) => /\[[^\]]+\]/.test(t), 'text needs at least one [blank]')
      .describe('Passage. Blanks are [answer] or [answer|alternative|…]. Newlines are kept'),
    bank: z.boolean().default(true).describe('Show a word bank of the answers (sorted, so it gives no order away)'),
    mono: z.boolean().default(false).describe('Monospace text, for code'),
    initial: z.enum(['blank', 'submitted']).default('blank').describe('Starting state (for previews)'),
  }),
  snippet: { title: 'How plants make food', text: 'Photosynthesis happens in the [chloroplasts]. Plants take in water and [carbon dioxide|CO2] and release [oxygen].' },
  examples: {
    demo: {
      note: 'Word bank, alternative answers',
      props: {
        title: 'How plants make food',
        text: 'Photosynthesis turns light energy into chemical energy. It happens in the [chloroplasts], using a green pigment called [chlorophyll]. The plant takes in water and [carbon dioxide|CO2] and releases [oxygen] as a by-product.',
      },
    },
    code: { note: 'mono, no bank', props: { title: 'Fill in the Go keywords', mono: true, bank: false, text: '[func] main() {\n    [for] i := 0; i < 3; i++ {\n        [go] worker(i)\n    }\n}' } },
    submitted: { note: 'initial: "submitted"', props: { title: 'Le passé composé', initial: 'submitted', text: 'Hier, j’[ai] [mangé] une pomme et nous [avons] regardé un film.' } },
  },
});
