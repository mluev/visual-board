import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const TestQuestion = named(
  'TestQuestion',
  z
    .object({
      q: z.string().describe('The question'),
      code: z.string().optional().describe('Code shown under the question'),
      options: z.array(z.string()).min(2).max(8),
      answer: z.union([z.number().int().min(0), z.array(z.number().int().min(0)).min(1)]).describe('Correct option index, or an array of indexes for "select all that apply"'),
      explain: z.string().optional().describe('Why. Shown after submitting. Always write it'),
    })
    .refine((q) => (Array.isArray(q.answer) ? q.answer : [q.answer]).every((a) => a < q.options.length), { message: 'answer must index into options', path: ['answer'] }),
);

export const test = defineContract({
  type: 'Test',
  category: 'assessment',
  tone: 'blue',
  pill: 'Test',
  purpose: 'All questions on one page, untimed, submitted together. Supports single-answer and select-all-that-apply questions. Marks every option and shows explanations after submitting.',
  whenToUse: 'A calm check or a longer exam-style set, or when a question has several correct options. Use Quiz for a quick timed round.',
  results: 'One attempt per submit: score/total, items[{prompt, answer: picked option text(s), expected, correct}].',
  schema: z.object({
    title: z.string().default('Quick check'),
    questions: z.array(TestQuestion).min(1),
    initial: z.enum(['blank', 'answered', 'submitted']).default('blank').describe('Starting state (for previews)'),
  }),
  snippet: {
    title: 'Grammar check',
    questions: [
      { q: 'Choose the correct sentence.', options: ['She don’t like coffee.', 'She doesn’t like coffee.'], answer: 1, explain: 'Third person singular takes "doesn’t" + base verb.' },
      { q: 'Which of these are prime?', options: ['21', '23', '27', '29'], answer: [1, 3], explain: '21 = 3·7 and 27 = 3³.' },
    ],
  },
  examples: {
    demo: {
      note: 'Single and multiple answer',
      props: {
        questions: [
          { q: 'Choose the correct sentence.', options: ['She don’t like coffee.', 'She doesn’t like coffee.', 'She not like coffee.', 'She doesn’t likes coffee.'], answer: 1, explain: 'Third-person singular takes "doesn’t" + the base verb (like, not likes).' },
          { q: 'Which of these are prime?', options: ['21', '23', '27', '29'], answer: [1, 3], explain: '23 and 29 have no divisors other than 1 and themselves. 21 = 3·7, 27 = 3³.' },
        ],
      },
    },
    submitted: {
      note: 'initial: "submitted" (marked)',
      props: {
        initial: 'submitted',
        questions: [
          { q: 'What does this print?', code: 'print(len("héllo"))', options: ['5', '6', 'Error'], answer: 0, explain: 'Python 3 strings count code points, not bytes.' },
          { q: 'Which are mutable in Python?', options: ['list', 'tuple', 'dict', 'str'], answer: [0, 2], explain: 'Lists and dicts can change in place; tuples and strings cannot.' },
        ],
      },
    },
  },
});
