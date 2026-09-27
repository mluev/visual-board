import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const KeyPoint = named(
  'KeyPoint',
  z.object({
    point: z.string().describe('What a good explanation must say'),
    keywords: z.array(z.string()).optional().describe('Words that auto-tick the point if they appear in the answer'),
  }),
);

export const explainBack = defineContract({
  type: 'ExplainBack',
  category: 'practice',
  tone: 'gold',
  pill: 'Explain it',
  purpose: 'Feynman-style: the learner explains an idea in their own words, then compares it with key points and ticks what they covered. "Send to tutor" saves it for you to judge.',
  whenToUse: 'Checking real understanding of a concept, cause or mechanism ("Explain why…"). Best after an Explainer. 3–5 key points.',
  results: 'progress = draft text. "Send to tutor" adds an attempt: items[0] = {prompt, answer: their text, needsReview: true}, then one item per key point {prompt: "Key point: …", answer: "ticked" | "not ticked", needsReview: true}; score = self-ticked points. Judge the text against the points and reply in reviews/ (items[].index matches these items).',
  schema: z.object({
    title: z.string().default('Teach it back'),
    prompt: z.string().describe('The question, e.g. "Explain why the seasons happen."'),
    keyPoints: z.array(z.union([z.string(), KeyPoint])).min(1).describe('Plain strings or {point, keywords}'),
    initial: z.enum(['write', 'review']).default('write').describe('Starting state (for previews)'),
  }),
  snippet: {
    prompt: 'Explain why the seasons happen.',
    keyPoints: [{ point: 'Earth’s axis is tilted about 23.5°', keywords: ['tilt', 'axis'] }, 'It is NOT caused by distance from the Sun'],
  },
  examples: {
    demo: {
      note: 'Writing',
      props: {
        prompt: 'Explain why the seasons happen.',
        keyPoints: [
          { point: 'Earth’s axis is tilted about 23.5°', keywords: ['tilt', 'axis', '23'] },
          { point: 'The tilt stays pointed the same way as Earth orbits the Sun', keywords: ['same direction', 'orbit', 'fixed'] },
          { point: 'The hemisphere tilted toward the Sun gets more direct light and longer days', keywords: ['direct', 'longer day', 'angle', 'toward'] },
          { point: 'It is NOT caused by distance from the Sun', keywords: ['not distance', 'not because of distance', 'not how close', 'isn’t distance'] },
        ],
      },
    },
    review: {
      note: 'initial: "review" (self-check)',
      props: {
        initial: 'review',
        prompt: 'Explain why the seasons happen.',
        keyPoints: [
          { point: 'Earth’s axis is tilted about 23.5°', keywords: ['tilt', 'axis'] },
          { point: 'The hemisphere tilted toward the Sun gets more direct light and longer days', keywords: ['direct', 'longer'] },
          'It is NOT caused by distance from the Sun',
        ],
      },
    },
  },
});
