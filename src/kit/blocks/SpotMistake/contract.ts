import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Line = named(
  'Line',
  z.object({
    text: z.string(),
    fix: z.string().optional().describe('Set on WRONG lines only: the corrected line'),
    why: z.string().optional().describe('Why it was wrong'),
  }),
);

export const spotMistake = defineContract({
  type: 'SpotMistake',
  category: 'practice',
  tone: 'gold',
  pill: 'Spot it',
  purpose: 'Lines of code or prose; the learner clicks every line that has a mistake, then sees found/missed lines with the fix and why.',
  whenToUse: 'Debugging practice, grammar errors in a paragraph, wrong steps in a calculation. 1–3 mistakes in 5–12 lines.',
  results: 'One attempt per check: an item per wrong line {prompt: line, answer: "flagged" | "missed", expected: fix, correct: flagged}, plus an item per correct line flagged by mistake {answer: "flagged", expected: "(line is fine)", correct: false}.',
  schema: z
    .object({
      title: z.string().default('Find the mistakes'),
      lines: z.array(z.union([z.string(), Line])).min(2).describe('Plain strings are correct lines; objects with `fix` are the mistakes'),
      instruction: z.string().optional().describe('Default: "Click every line that has a mistake. There are N."'),
      mono: z.boolean().default(true).describe('Monospace (code). Set false for prose'),
      initial: z.enum(['open', 'submitted']).default('open').describe('Starting state (for previews)'),
    })
    .refine((p) => p.lines.some((l) => typeof l !== 'string' && l.fix != null), { message: 'at least one line needs a `fix` (the mistake)', path: ['lines'] }),
  snippet: {
    title: 'Find the bugs',
    lines: ['func sum(nums []int) int {', '    total := 0', { text: '    for i := 0; i <= len(nums); i++ {', fix: 'for i := 0; i < len(nums); i++ {', why: '<= reads one past the end.' }, '        total += nums[i]', '    }', '    return total', '}'],
  },
  examples: {
    demo: {
      note: 'Code, two bugs',
      props: {
        title: 'Find the bugs',
        lines: [
          'func sum(nums []int) int {',
          '    total := 0',
          { text: '    for i := 0; i <= len(nums); i++ {', fix: 'for i := 0; i < len(nums); i++ {', why: '<= reads one past the end and panics with index out of range.' },
          '        total += nums[i]',
          '    }',
          { text: '    return nums', fix: 'return total', why: 'The function should return the sum, not the slice — this won’t even compile.' },
          '}',
        ],
      },
    },
    prose: {
      note: 'mono: false, initial: "submitted"',
      props: {
        title: 'Grammar check',
        mono: false,
        initial: 'submitted',
        lines: ['Yesterday I went to the market.', { text: 'I buyed three apples.', fix: 'I bought three apples.', why: 'buy is irregular: buy → bought.' }, 'Then I walked home.', { text: 'She don’t like apples.', fix: 'She doesn’t like apples.', why: 'Third person: doesn’t.' }],
      },
    },
  },
});
