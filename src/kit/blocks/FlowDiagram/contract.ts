import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const FlowNode = named(
  'FlowNode',
  z.object({
    id: z.string(),
    type: z.enum(['start', 'step', 'decision', 'end']),
    text: z.string(),
    note: z.string().optional().describe('Hint on a question, or an example on a result'),
    next: z.string().optional().describe('start/step: id of the next node'),
    yes: z.string().optional().describe('decision: id when the answer is yes'),
    no: z.string().optional().describe('decision: id when the answer is no'),
    yesLabel: z.string().optional().describe('Button text instead of "Yes"'),
    noLabel: z.string().optional().describe('Button text instead of "No"'),
  }),
);

export const flowDiagram = defineContract({
  type: 'FlowDiagram',
  category: 'visual',
  tone: 'teal',
  pill: 'Flow',
  purpose: 'A decision flowchart the learner walks through: answer each question to reveal the path, ending at a result. Optional example cases to reason about; "Start over" cycles to the next case.',
  whenToUse: 'Rules with branches: which tense to use, which algorithm to pick, a diagnosis checklist, a legal test, debugging steps. 3–8 nodes.',
  notes: ['The first node is where the walk starts. Every next/yes/no must be a node id.'],
  schema: z
    .object({
      title: z.string().default(''),
      nodes: z.array(FlowNode).min(2),
      cases: z.array(z.string()).default([]).describe('Example situations to test the flow on'),
    })
    .superRefine((p, ctx) => {
      const ids = new Set(p.nodes.map((n) => n.id));
      p.nodes.forEach((n, i) => {
        for (const k of ['next', 'yes', 'no'] as const) if (n[k] && !ids.has(n[k]!)) ctx.addIssue({ code: 'custom', message: `"${n[k]}" is not a node id`, path: ['nodes', i, k] });
        if (n.type === 'decision' && (!n.yes || !n.no)) ctx.addIssue({ code: 'custom', message: 'a decision needs yes and no', path: ['nodes', i] });
      });
    }),
  snippet: {
    title: 'Past simple or present perfect?',
    cases: ['"She ___ (visit) Rome in 2019."'],
    nodes: [
      { id: 'q1', type: 'decision', text: 'Do you say WHEN it happened?', yes: 'ps', no: 'pp' },
      { id: 'ps', type: 'end', text: 'Past simple', note: '"She visited Rome in 2019."' },
      { id: 'pp', type: 'end', text: 'Present perfect', note: '"I have lost my keys."' },
    ],
  },
  examples: {
    demo: {
      note: 'Grammar decision with cases',
      props: {
        title: 'Past simple or present perfect?',
        cases: ['"I ___ (lose) my keys, so I can’t get in."', '"She ___ (visit) Rome in 2019."'],
        nodes: [
          { id: 's', type: 'start', text: 'You’re describing a finished action.', next: 'q1' },
          { id: 'q1', type: 'decision', text: 'Do you say, or clearly mean, WHEN it happened?', yes: 'ps', no: 'q2', note: 'e.g. yesterday, in 2019, last week, when I was a kid' },
          { id: 'q2', type: 'decision', text: 'Does it matter NOW (a result, or experience up to now)?', yes: 'pp', no: 'ps' },
          { id: 'pp', type: 'end', text: 'Present perfect: have/has + past participle', note: '"I have lost my keys." The result (no keys) is true now.' },
          { id: 'ps', type: 'end', text: 'Past simple: verb + -ed or the irregular form', note: '"She visited Rome in 2019." A finished time in the past.' },
        ],
      },
    },
  },
});
