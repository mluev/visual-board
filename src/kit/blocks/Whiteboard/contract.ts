import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export const whiteboard = defineContract({
  type: 'Whiteboard',
  category: 'core',
  tone: 'pink',
  pill: 'Whiteboard',
  purpose: 'A freehand drawing canvas with pen, marker, eraser, 4 colours, 3 sizes, undo and clear.',
  whenToUse: 'When the learner should sketch: memory diagrams, a proof, a graph by hand, a map. Give a concrete prompt with a question they can answer by drawing.',
  results: 'progress = strokes (resumes after reload). "Submit for review" saves a PNG to results/<board>/<id>-drawing.png and an attempt with items[{prompt, answer: "<png path>", needsReview: true}]. Open the PNG to judge it.',
  schema: z.object({
    title: z.string().default('Scratchpad').describe('Title next to the pill'),
    prompt: z.string().optional().describe('What to draw. Supports `code` and **bold**'),
    height: z.number().int().min(160).default(360).describe('Canvas height in px'),
    submit: z.boolean().default(true).describe('Show "Submit for review" (only when there is a prompt)'),
  }),
  snippet: { title: 'Sketch it', prompt: 'Draw `a`, `s` and their shared backing array after `s = append(s, 9)`. What is `a[3]` now?', height: 380 },
  examples: {
    demo: { note: 'With a prompt', props: { title: 'Sketch it', prompt: 'a := [4]int{1,2,3,4}; s := a[1:3]; s = append(s, 9). Draw `a`, `s` and their shared memory. What is `a[3]` now?' }, wide: true },
    blank: { note: 'Plain scratchpad', props: { height: 240 } },
  },
});
