import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export const callout = defineContract({
  type: 'Callout',
  category: 'layout',
  tone: 'blue',
  pill: 'Note',
  purpose: 'A short highlighted message: a tip, a warning, a key takeaway or a summary of what the learner just did.',
  whenToUse: 'One or two sentences that must not be missed (a common pitfall, a rule of thumb). Use sparingly, at most one or two per board; use Explainer for real teaching.',
  schema: z.object({
    kind: z.enum(['note', 'tip', 'warning', 'success', 'key']).default('note').describe('Sets colour and default label'),
    label: z.string().optional().describe('Pill text. Default by kind: Note, Tip, Watch out, Nice work, Key idea'),
    title: z.string().optional(),
    body: z.string().describe('Supports `code`, **bold**, bullets'),
  }),
  snippet: { kind: 'warning', title: 'Nil maps panic on write', body: 'Reading a nil map is fine; writing to it panics. Create maps with `make`.' },
  examples: {
    demo: { note: 'kind: "warning"', props: { kind: 'warning', title: 'Nil maps panic on write', body: 'Reading from a nil map returns zero values, but `m["a"] = 1` panics. Always create maps with `make(map[string]int)`.' } },
    tip: { note: 'kind: "tip"', props: { kind: 'tip', body: 'Say the rule out loud before each practice question — it doubles recall.' } },
    key: { note: 'kind: "key" with bullets', props: { kind: 'key', title: 'Remember', body: '- `len` counts elements\n- `cap` counts room to grow\n- `append` may move the data' } },
  },
});
