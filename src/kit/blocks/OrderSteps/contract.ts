import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export const orderSteps = defineContract({
  type: 'OrderSteps',
  category: 'practice',
  tone: 'gold',
  pill: 'Order',
  purpose: 'Put shuffled steps back in the right order by dragging or with ↑ ↓ buttons, then check. Wrong rows say where they belong.',
  whenToUse: 'Processes, algorithms, historical sequences, proof steps, lifecycle stages. 4–8 steps.',
  results: 'One attempt per check: items[{prompt: "Position n", answer: step placed there, expected: correct step, correct}].',
  schema: z.object({
    title: z.string().default(''),
    items: z.array(z.string()).min(3).max(10).describe('Steps in the CORRECT order. They are shuffled for display'),
    instruction: z.string().default('Put the steps in the right order, first at the top.'),
    explain: z.string().optional().describe('Shown after checking'),
    mono: z.boolean().default(false),
    initial: z.enum(['open', 'submitted']).default('open').describe('Starting state (for previews)'),
  }),
  snippet: { title: 'How blood flows through the heart', items: ['Right atrium', 'Right ventricle', 'Lungs', 'Left atrium', 'Left ventricle'], explain: 'Right side → lungs, left side → body.' },
  examples: {
    demo: {
      note: 'Five steps with explanation',
      props: {
        title: 'How blood flows through the heart',
        items: ['Blood returns to the right atrium', 'Right ventricle pumps it to the lungs', 'Lungs add oxygen', 'Left atrium receives oxygenated blood', 'Left ventricle pumps it to the body'],
        explain: 'Right side → lungs, left side → body. The left ventricle has the thickest wall because it pumps blood around the whole body.',
      },
    },
    submitted: { note: 'mono, initial: "submitted"', props: { title: 'Order the Git workflow', mono: true, initial: 'submitted', items: ['git checkout -b feature', 'edit files', 'git add .', 'git commit -m "…"', 'git push -u origin feature'] } },
  },
});
