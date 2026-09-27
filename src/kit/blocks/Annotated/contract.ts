import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Note = named(
  'Note',
  z.object({
    mark: z.string().describe('EXACT substring of text to highlight (first occurrence)'),
    note: z.string().describe('What it means'),
  }),
);

export const annotated = defineContract({
  type: 'Annotated',
  category: 'visual',
  tone: 'teal',
  pill: 'Annotated',
  purpose: 'A passage of code or prose with numbered highlights; each links to a note. Step through with ← → or hover a highlight.',
  whenToUse: 'Walking through a code sample line by line, a poem, a historical source, a legal clause, a sentence’s grammar. 3–7 notes.',
  notes: ['A mark that does not appear in text (or overlaps an earlier mark) is skipped, so copy marks exactly.'],
  schema: z.object({
    title: z.string().default(''),
    text: z.string().describe('The passage. Newlines are kept'),
    notes: z.array(Note).min(1),
    mono: z.boolean().default(false).describe('Code: monospace on a dark panel'),
  }),
  snippet: { title: 'A Go worker', mono: true, text: 'for j := range jobs {\n    results <- j * 2\n}', notes: [{ mark: 'range jobs', note: 'Loops until jobs is closed.' }, { mark: 'results <-', note: 'Sends on the results channel.' }] },
  examples: {
    demo: {
      note: 'Code (mono)',
      props: {
        title: 'A Go worker pool, line by line',
        mono: true,
        text: 'func worker(id int, jobs <-chan int, results chan<- int) {\n    for j := range jobs {\n        results <- j * 2\n    }\n}\n\nfunc main() {\n    jobs := make(chan int, 100)\n    results := make(chan int, 100)\n    for w := 1; w <= 3; w++ {\n        go worker(w, jobs, results)\n    }\n}',
        notes: [
          { mark: '<-chan int', note: 'Receive-only channel. The worker can read jobs but can’t send on it.' },
          { mark: 'chan<- int', note: 'Send-only channel: the worker only writes results.' },
          { mark: 'range jobs', note: 'Loops until the jobs channel is closed and drained.' },
          { mark: 'make(chan int, 100)', note: 'Buffered channel: up to 100 sends can happen before a send blocks.' },
          { mark: 'go worker', note: 'Starts each worker in its own goroutine, so three workers run at the same time.' },
        ],
      },
      wide: true,
    },
    prose: {
      note: 'Prose',
      props: {
        title: 'Reading a sonnet',
        text: 'Shall I compare thee to a summer’s day?\nThou art more lovely and more temperate.',
        notes: [
          { mark: 'Shall I compare thee', note: 'A rhetorical question that sets up the whole poem as a comparison.' },
          { mark: 'more temperate', note: 'Milder, more even — unlike summer, which can be too hot or too short.' },
        ],
      },
    },
  },
});
