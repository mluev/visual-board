import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export const explainer = defineContract({
  type: 'Explainer',
  category: 'core',
  tone: 'ink',
  pill: 'Explainer',
  purpose: 'The teaching text of a board: a big title, short paragraphs, an optional code sample and numbered key points.',
  whenToUse: 'Start almost every board with one. Keep it short (2–3 paragraphs, 2–4 points) and put the depth in the blocks that follow.',
  schema: z.object({
    label: z.string().default('Explainer').describe('Pill text, e.g. "Big idea", "Recap"'),
    title: z.string().describe('Headline, one line'),
    body: z.string().optional().describe('Paragraphs separated by a blank line. Supports `code`, **bold**, *italic*, [links](url), "- " bullets'),
    code: z.string().optional().describe('Code sample shown under the text'),
    lang: z.string().optional().describe('Code language for highlighting (defaults to the board lang)'),
    points: z.array(z.string()).optional().describe('Numbered key points (01, 02 …)'),
  }),
  snippet: {
    title: 'What a slice really is',
    body: 'A slice is a small header that points into an array.\n\nSlicing never copies data.',
    code: 's := a[1:3]',
    points: ['len(s) is how many elements you can read.', 'Always reassign: `s = append(s, x)`.'],
  },
  examples: {
    demo: {
      note: 'Text, code and points',
      props: {
        title: 'What a slice really is',
        body: 'A slice is a small header that points into an underlying array. It stores three things: a pointer, a length and a capacity.\n\nSlicing never copies data. Two slices can share the same array, so writing through one is visible through the other.',
        code: 'a := [5]int{1, 2, 3, 4, 5}\ns := a[1:3]   // [2 3], len 2, cap 4',
        lang: 'go',
        points: ['len(s) is how many elements you can read.', 'cap(s) is how far the slice can grow before append reallocates.', 'append returns a new header — always reassign: `s = append(s, x)`.'],
      },
    },
    textOnly: {
      note: 'Prose only, custom label',
      props: {
        label: 'Big idea',
        title: 'Why the Treaty of Versailles failed',
        body: 'It punished Germany hard enough to breed resentment, but not hard enough to stop it from rearming.\n\nThe **war guilt clause** became a rallying point for nationalists throughout the 1920s.',
      },
    },
  },
});
