import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const ShortQuestion = named(
  'ShortQuestion',
  z.object({
    q: z.string().describe('The question'),
    answer: z.union([z.string(), z.array(z.string()).min(1)]).describe('Accepted answer(s). The first is shown as the correct one'),
    hint: z.string().optional().describe('Revealed on request'),
    explain: z.string().optional().describe('Shown after checking'),
  }),
);

export const shortAnswer = defineContract({
  type: 'ShortAnswer',
  category: 'practice',
  tone: 'gold',
  pill: 'Type it',
  purpose: 'Recall from memory: the learner types short answers. Case, punctuation, missing accents and small typos are accepted as "almost".',
  whenToUse: 'Facts, translations, conjugations, definitions, one-word or one-number answers. Prefer it over multiple choice when the learner should produce the answer.',
  results: 'One attempt per check: items[{prompt, answer: typed text, expected, correct}]. Exact matches are correct; "almost" (typo/accents) is correct with note "almost"; anything else is marked needsReview so you can accept synonyms.',
  notes: ['Enter checks the answers.'],
  schema: z.object({
    title: z.string().default('Recall from memory'),
    questions: z.array(ShortQuestion).min(1),
    initial: z.enum(['blank', 'submitted']).default('blank').describe('Starting state (for previews)'),
  }),
  snippet: {
    title: 'Irregular verbs',
    questions: [
      { q: 'Past tense of "go"?', answer: 'went', hint: 'It doesn’t end in -ed.', explain: 'go → went → gone.' },
      { q: 'Capital of Australia?', answer: ['Canberra'], explain: 'A purpose-built compromise between Sydney and Melbourne.' },
    ],
  },
  examples: {
    demo: {
      note: 'Hints and explanations',
      props: {
        questions: [
          { q: 'Past tense of "go"?', answer: 'went', hint: 'Irregular — it doesn’t end in -ed.', explain: 'go → went → gone. One of the most common irregular verbs.' },
          { q: 'What is 7 × 8?', answer: '56', explain: '7 × 8 = 56. A trick: 5, 6, 7, 8 → 56 = 7 × 8.' },
          { q: 'Capital of Australia?', answer: ['Canberra'], hint: 'Not Sydney.', explain: 'Canberra was purpose-built as a compromise between Sydney and Melbourne.' },
        ],
      },
    },
    submitted: {
      note: 'initial: "submitted" (right, almost, wrong)',
      props: {
        initial: 'submitted',
        questions: [
          { q: '"Thank you" in French?', answer: 'merci' },
          { q: '"Coffee" in French?', answer: 'café', explain: 'Accents are accepted as "almost".' },
          { q: '"Library" in French?', answer: 'bibliothèque', explain: 'Une librairie is a bookshop — a classic false friend.' },
        ],
      },
    },
  },
});
