import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const CompareRow = named('CompareRow', z.object({ label: z.string().describe('Row heading'), values: z.array(z.string()).describe('One value per column') }));

export const compareTable = defineContract({
  type: 'CompareTable',
  category: 'visual',
  tone: 'teal',
  pill: 'Compare',
  purpose: 'Side-by-side comparison table with column highlight on hover and a built-in "Quiz me" mode that hides every cell until the learner recalls and taps it.',
  whenToUse: 'Two to four things compared on the same features: mitosis vs meiosis, TCP vs UDP, arrays vs linked lists, Romans vs Greeks. 3–7 rows.',
  schema: z
    .object({
      title: z.string().default(''),
      columns: z.array(z.string()).min(2).max(5).describe('Things being compared'),
      rows: z.array(CompareRow).min(1),
      note: z.string().optional().describe('Caption under the table'),
      initial: z.enum(['table', 'quiz']).default('table').describe('Start in Quiz me mode'),
    })
    .refine((p) => p.rows.every((r) => r.values.length === p.columns.length), { message: 'every row needs one value per column', path: ['rows'] }),
  snippet: { title: 'Mitosis vs meiosis', columns: ['Mitosis', 'Meiosis'], rows: [{ label: 'Purpose', values: ['Growth and repair', 'Making gametes'] }, { label: 'Daughter cells', values: ['2, identical', '4, all different'] }] },
  examples: {
    demo: {
      note: 'Two columns',
      props: {
        title: 'Mitosis vs meiosis',
        columns: ['Mitosis', 'Meiosis'],
        rows: [
          { label: 'Purpose', values: ['Growth and repair', 'Making sex cells (gametes)'] },
          { label: 'Divisions', values: ['1', '2'] },
          { label: 'Daughter cells', values: ['2, identical', '4, all different'] },
          { label: 'Chromosomes', values: ['Diploid (2n), same as the parent', 'Haploid (n), half the parent'] },
          { label: 'Crossing over', values: ['No', 'Yes, in prophase I'] },
        ],
        note: 'Tip: turn on Quiz me and try to recall each cell before you tap it.',
      },
    },
    quiz: { note: 'Three columns, initial: "quiz"', props: { title: 'Data structures', initial: 'quiz', columns: ['Array', 'Linked list', 'Hash map'], rows: [{ label: 'Lookup by index', values: ['O(1)', 'O(n)', '—'] }, { label: 'Lookup by key', values: ['O(n)', 'O(n)', 'O(1) average'] }, { label: 'Insert at front', values: ['O(n)', 'O(1)', '—'] }] } },
  },
});
