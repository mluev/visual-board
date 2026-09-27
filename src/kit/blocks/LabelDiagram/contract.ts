import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Pin = named(
  'Pin',
  z.object({
    x: z.number().min(0).max(100).describe('% from the left of the image'),
    y: z.number().min(0).max(100).describe('% from the top of the image'),
    label: z.string().describe('Correct label for this pin'),
  }),
);

export const labelDiagram = defineContract({
  type: 'LabelDiagram',
  category: 'practice',
  tone: 'gold',
  pill: 'Label it',
  purpose: 'Numbered pins on an image; the learner picks the right label for each pin from a bank (with optional distractors), then checks.',
  whenToUse: 'Anatomy, maps, parts of a machine, a circuit, a plant cell, UI parts of a screenshot. 4–8 pins.',
  results: 'One attempt per check: items[{prompt: "Pin n", answer: chosen label, expected: label, correct}].',
  notes: [
    'Give `image` (a URL, or a file in public/, e.g. "/kit/plant-cell.svg") OR a `slotId`: then the learner drops their own image, saved to public/uploads/<slotId>.* and reused. Place pins by % after you know the image.',
  ],
  schema: z.object({
    title: z.string().default(''),
    image: z.string().optional().describe('Image URL or /path in public/'),
    slotId: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/i).optional().describe('Unique id for a drop-your-own-image slot (when no image)'),
    placeholder: z.string().optional().describe('Text in the empty slot'),
    pins: z.array(Pin).min(1),
    distractors: z.array(z.string()).default([]).describe('Extra wrong labels in the bank'),
    aspect: z.string().default('4 / 3').describe('Image box aspect ratio, e.g. "16 / 9"'),
    initial: z.enum(['open', 'submitted']).default('open').describe('Starting state (for previews)'),
  }),
  snippet: { title: 'Parts of a plant cell', image: '/kit/plant-cell.svg', pins: [{ x: 48, y: 46, label: 'Nucleus' }, { x: 72, y: 28, label: 'Chloroplast' }], distractors: ['Centriole'] },
  examples: {
    demo: {
      note: 'Image in public/, with a distractor',
      props: {
        title: 'Parts of a plant cell',
        image: '/kit/plant-cell.svg',
        pins: [
          { x: 7, y: 30, label: 'Cell wall' },
          { x: 48, y: 46, label: 'Nucleus' },
          { x: 72, y: 28, label: 'Chloroplast' },
          { x: 62, y: 70, label: 'Vacuole' },
          { x: 26, y: 70, label: 'Mitochondrion' },
        ],
        distractors: ['Centriole'],
      },
    },
    slot: { note: 'slotId (drop your own image), initial: "submitted"', props: { title: 'Label your diagram', slotId: 'kit-demo-slot', initial: 'submitted', pins: [{ x: 30, y: 40, label: 'Left' }, { x: 70, y: 60, label: 'Right' }] } },
  },
});
