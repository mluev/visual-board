import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const PatternRow = named(
  'PatternRow',
  z.object({
    label: z.string().describe('Row heading, e.g. "yo", "tú"'),
    cells: z.array(z.string()).describe('One per column, written "stem|ending" so the ending is highlighted, e.g. "habl|o"'),
  }),
);

export const patternTable = defineContract({
  type: 'PatternTable',
  category: 'visual',
  tone: 'teal',
  pill: 'Pattern',
  purpose: 'A table that shows a pattern with the changing part highlighted (stem + ending). Practice mode hides every cell for the learner to fill in from memory.',
  whenToUse: 'Conjugation and declension tables, plural rules, number patterns, any grid where one part changes by rule.',
  results: 'In Practice mode, one attempt per check: items[{prompt: "<row> · <column>", answer, expected, correct}]. Accents must match.',
  schema: z
    .object({
      title: z.string().default(''),
      subtitle: z.string().optional().describe('The rule in one sentence'),
      columns: z.array(z.string()).min(1),
      rows: z.array(PatternRow).min(1),
      note: z.string().optional().describe('Tip shown in Study mode'),
      initial: z.enum(['study', 'practice']).default('study'),
    })
    .refine((p) => p.rows.every((r) => r.cells.length === p.columns.length), { message: 'every row needs one cell per column', path: ['rows'] }),
  snippet: { title: 'hablar (to speak)', subtitle: 'Keep the stem habl-, add the ending.', columns: ['Present'], rows: [{ label: 'yo', cells: ['habl|o'] }, { label: 'tú', cells: ['habl|as'] }] },
  examples: {
    demo: {
      note: 'Two tenses with a note',
      props: {
        title: 'Spanish -ar verbs: hablar (to speak)',
        subtitle: 'Keep the stem habl-, then add the ending for the person and tense.',
        columns: ['Present', 'Preterite (past)'],
        rows: [
          { label: 'yo', cells: ['habl|o', 'habl|é'] },
          { label: 'tú', cells: ['habl|as', 'habl|aste'] },
          { label: 'él / ella', cells: ['habl|a', 'habl|ó'] },
          { label: 'nosotros', cells: ['habl|amos', 'habl|amos'] },
          { label: 'vosotros', cells: ['habl|áis', 'habl|asteis'] },
          { label: 'ellos', cells: ['habl|an', 'habl|aron'] },
        ],
        note: 'Watch the accents: hablo = "I speak", but habló = "he spoke". Nosotros is the same in both tenses, so context tells them apart.',
      },
    },
    practice: { note: 'initial: "practice"', props: { title: 'English plurals', initial: 'practice', columns: ['Plural'], rows: [{ label: 'cat', cells: ['cat|s'] }, { label: 'box', cells: ['box|es'] }, { label: 'city', cells: ['cit|ies'] }] } },
  },
});
