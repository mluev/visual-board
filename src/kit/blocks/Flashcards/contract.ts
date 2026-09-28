import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const FlashCard = named(
  'Card',
  z.object({
    front: z.string().describe('Term, question or prompt'),
    back: z.string().describe('Answer or definition'),
    hint: z.string().optional().describe('Small label above the front, e.g. "Go · built-in"'),
    example: z.string().optional().describe('Example sentence or usage shown on the back'),
  }),
);

export const flashcards = defineContract({
  type: 'Flashcards',
  category: 'core',
  tone: 'violet',
  pill: 'Flashcards',
  purpose: 'Anki-style spaced-repetition deck. Flip a card, grade it Again / Hard / Good / Easy; "Again" sends it back into the session.',
  whenToUse: 'The "remember" step: vocabulary, definitions, formulas, API names. 3–8 cards per deck.',
  results: 'Resumes after reload. On deck complete: an attempt with items[{prompt: front, expected: back, answer: first grade, correct: first grade ≠ "again"}]; score = cards known the first time; meta.counts = grades given.',
  notes: ['Keys: Space/Enter flips, 1–4 grades.'],
  schema: z.object({
    title: z.string().default('').describe('Deck name next to the pill'),
    cards: z.array(FlashCard).min(1),
    shuffle: z.boolean().default(false).describe('Shuffle the order each session'),
    initial: z.enum(['front', 'back', 'done']).default('front').describe('Starting state (for previews)'),
  }),
  snippet: {
    title: 'Slice vocabulary',
    cards: [
      { front: 'len(s)', hint: 'Go · slices', back: 'Number of elements the slice holds.', example: 'len([]int{1,2,3}) == 3' },
      { front: 'cap(s)', back: 'Elements available in the backing array from the slice’s start.' },
    ],
  },
  examples: {
    demo: {
      note: 'Mixed subjects',
      props: {
        title: 'Mixed review',
        cards: [
          { front: 'ubiquitous', hint: 'English · adjective', back: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in daily life.' },
          { front: '∫ 2x dx', hint: 'Calculus', back: 'x² + C', example: 'Power rule: ∫ xⁿ dx = xⁿ⁺¹ ⁄ (n+1) + C' },
          { front: 'make(chan int)', hint: 'Go · channels', back: 'Creates an unbuffered channel of ints.', example: 'A send blocks until another goroutine receives.' },
        ],
      },
    },
    back: { note: 'initial: "back" (revealed, grading)', props: { title: 'Spanish verbs', initial: 'back', cards: [{ front: 'tener', hint: 'Spanish · verb', back: 'to have', example: 'Tengo dos hermanos.' }, { front: 'hacer', back: 'to do / to make' }] } },
    done: { note: 'initial: "done" (summary)', props: { title: 'Spanish verbs', initial: 'done', cards: [{ front: 'tener', back: 'to have' }, { front: 'hacer', back: 'to do / to make' }, { front: 'ir', back: 'to go' }] } },
  },
});
