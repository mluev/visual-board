import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Step = named(
  'Step',
  z.object({
    work: z.string().describe('The step itself, e.g. "3x = 21" (shown in monospace)'),
    why: z.string().optional().describe('The reason for the step. Also used as the hint'),
    accept: z.array(z.string()).optional().describe('Other accepted ways to write this step'),
  }),
);

export const workedExample = defineContract({
  type: 'WorkedExample',
  category: 'practice',
  tone: 'gold',
  pill: 'Worked example',
  purpose: 'A solved problem, step by step with reasons, and three modes: Study (all shown), Faded (the second half hidden) and Solve (write every step).',
  whenToUse: 'Maths, physics, algorithms, grammar transformations: anything solved in steps. 3–6 steps. The learner studies it, then fades to solving alone.',
  results: 'One attempt per "Check steps": items[{prompt: "Step n of: <problem>", answer, expected: work, correct}] for the hidden steps; meta.mode. Wrong answers are marked needsReview (they may be an equivalent form).',
  notes: ['Each answer is compared with `work` and every `accept` entry as a whole string, ignoring case and spaces, with − and - (and ×, ·, *) treated as the same. Order is not normalised: add "x = 3 or x = 2" to accept if both orders are fine.'],
  schema: z.object({
    title: z.string().default(''),
    problem: z.string().describe('The problem statement'),
    steps: z.array(Step).min(2),
    initial: z.enum(['study', 'faded', 'solve']).default('study').describe('Starting mode'),
  }),
  snippet: {
    title: 'Solving a linear equation',
    problem: 'Solve for x:  3(x − 2) + 4 = 19',
    steps: [
      { work: '3x − 6 + 4 = 19', why: 'Distribute the 3.' },
      { work: '3x = 21', why: 'Combine constants, add 2 to both sides.', accept: ['3x=21'] },
      { work: 'x = 7', why: 'Divide by 3.' },
    ],
  },
  examples: {
    demo: {
      note: 'Study mode',
      props: {
        title: 'Solving a linear equation',
        problem: 'Solve for x:  3(x − 2) + 4 = 19',
        steps: [
          { work: '3x − 6 + 4 = 19', why: 'Distribute the 3 across the bracket.' },
          { work: '3x − 2 = 19', why: 'Combine the constants: −6 + 4 = −2.' },
          { work: '3x = 21', why: 'Add 2 to both sides.' },
          { work: 'x = 7', why: 'Divide both sides by 3. Check: 3(7 − 2) + 4 = 19 ✓' },
        ],
      },
    },
    faded: {
      note: 'initial: "faded"',
      props: {
        initial: 'faded',
        title: 'Differentiate',
        problem: 'd/dx (x² · sin x)',
        steps: [
          { work: "(uv)' = u'v + uv'", why: 'Product rule with u = x², v = sin x.' },
          { work: "u' = 2x, v' = cos x", why: 'Differentiate each part.' },
          { work: '2x·sin x + x²·cos x', why: 'Substitute into the product rule.', accept: ['2x sin x + x^2 cos x', '2xsinx+x²cosx'] },
        ],
      },
    },
  },
});
