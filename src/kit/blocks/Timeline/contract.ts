import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const TimelineEvent = named(
  'TimelineEvent',
  z.object({
    date: z.string().describe('Shown as-is, e.g. "1914", "c. 500 BC", "June 1944". A 3–4 digit year in it enables "n years after …"'),
    title: z.string(),
    body: z.string().optional().describe('Details shown when selected'),
  }),
);

export const timeline = defineContract({
  type: 'Timeline',
  category: 'visual',
  tone: 'teal',
  pill: 'Timeline',
  purpose: 'A horizontal timeline of events; select one (click, ← →) to read its details and how long after the previous event it happened.',
  whenToUse: 'History, the development of a science, a biography, a product’s release history, geological eras. 4–10 events in order.',
  schema: z.object({
    title: z.string().default(''),
    events: z.array(TimelineEvent).min(2).describe('In chronological order'),
  }),
  snippet: { title: 'The Scientific Revolution', events: [{ date: '1543', title: 'Copernicus', body: 'Proposes a Sun-centred model.' }, { date: '1687', title: 'Newton’s Principia', body: 'Laws of motion and gravitation.' }] },
  examples: {
    demo: {
      note: 'Six events',
      props: {
        title: 'The Scientific Revolution and after',
        events: [
          { date: '1440', title: 'Printing press', body: 'Gutenberg’s movable type makes books cheap. Ideas spread faster than ever before.' },
          { date: '1543', title: 'Copernicus', body: 'Proposes that the Earth orbits the Sun, challenging the Earth-centred model.' },
          { date: '1609', title: 'Galileo’s telescope', body: 'Observes Jupiter’s moons and the phases of Venus, which is evidence for Copernicus.' },
          { date: '1687', title: 'Newton’s Principia', body: 'Laws of motion and universal gravitation explain both falling apples and planetary orbits.' },
          { date: '1859', title: 'On the Origin of Species', body: 'Darwin explains how species change over time by natural selection.' },
          { date: '1905', title: 'Special relativity', body: 'Einstein shows that space and time depend on the observer’s motion. E = mc².' },
        ],
      },
      wide: true,
    },
  },
});
