/**
 * Generates KIT.md (the block contracts an AI reads to write boards) from src/kit/contracts.ts.
 *   npm run docs
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { contracts, blockTypes, type BlockType } from '../src/kit/contracts';
import { CATEGORY_LABEL, type Category } from '../src/kit/contract';

type Def = { type: string; [k: string]: unknown };
const def = (s: z.ZodType) => (s as unknown as { _zod: { def: Def } })._zod.def;
const meta = (s: z.ZodType) => (z.globalRegistry.get(s) ?? {}) as { description?: string; title?: string; signature?: string };

/** Named nested types collected while printing a block ("Question = {...}"). */
let named: Map<string, string>;

function unwrap(s: z.ZodType): { inner: z.ZodType; optional: boolean; dflt?: unknown; desc?: string } {
  let optional = false;
  let dflt: unknown;
  let desc = meta(s).description;
  let cur = s;
  for (;;) {
    const d = def(cur);
    if (d.type === 'optional') optional = true;
    else if (d.type === 'default') {
      optional = true;
      dflt = typeof d.defaultValue === 'function' ? (d.defaultValue as () => unknown)() : d.defaultValue;
    } else break;
    cur = d.innerType as z.ZodType;
    desc ??= meta(cur).description;
  }
  return { inner: cur, optional, dflt, desc };
}

function ts(s: z.ZodType, depth = 0): string {
  const m = meta(s);
  if (m.signature) return m.signature;
  const d = def(s);
  switch (d.type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'literal':
      return (d.values as unknown[]).map((v) => JSON.stringify(v)).join(' | ');
    case 'enum':
      return Object.values(d.entries as Record<string, string>).map((v) => JSON.stringify(v)).join(' | ');
    case 'array': {
      const el = ts(d.element as z.ZodType, depth);
      return /[|=> ]/.test(el) && !el.startsWith('{') ? `(${el})[]` : `${el}[]`;
    }
    case 'tuple':
      return `[${(d.items as z.ZodType[]).map((i) => ts(i, depth)).join(', ')}]`;
    case 'record':
      return `Record<${ts(d.keyType as z.ZodType)}, ${ts(d.valueType as z.ZodType, depth)}>`;
    case 'union':
      return (d.options as z.ZodType[]).map((o) => ts(o, depth)).join(' | ');
    case 'optional':
    case 'default':
    case 'nullable':
      return ts(d.innerType as z.ZodType, depth);
    case 'object': {
      const body = objectInline(s, depth);
      if (m.title) {
        if (!named.has(m.title)) {
          named.set(m.title, ''); // reserve (handles recursion)
          named.set(m.title, objectFields(s));
        }
        return m.title;
      }
      return body;
    }
    case 'lazy':
      return ts((d.getter as () => z.ZodType)(), depth);
    case 'any':
    case 'unknown':
      return 'unknown';
    default:
      return d.type;
  }
}

function objectInline(s: z.ZodType, depth: number) {
  const shape = def(s).shape as Record<string, z.ZodType>;
  const parts = Object.entries(shape).map(([k, v]) => {
    const u = unwrap(v);
    return `${k}${u.optional ? '?' : ''}: ${ts(u.inner, depth + 1)}`;
  });
  return `{ ${parts.join('; ')} }`;
}

/** Named object: one field per line with descriptions. */
function objectFields(s: z.ZodType) {
  const shape = def(s).shape as Record<string, z.ZodType>;
  return Object.entries(shape)
    .map(([k, v]) => {
      const u = unwrap(v);
      const dflt = u.dflt !== undefined && u.dflt !== '' ? ` = ${JSON.stringify(u.dflt)}` : '';
      return `    ${k}${u.optional ? '?' : ''}: ${ts(u.inner, 1)}${dflt}${u.desc ? `  — ${u.desc}` : ''}`;
    })
    .join('\n');
}

/** JS-ish literal for snippets: unquoted keys, functions kept as source. */
function lit(v: unknown, indent = ''): string {
  if (typeof v === 'function') return v.toString().replace(/\s+/g, ' ');
  if (Array.isArray(v)) {
    const items = v.map((x) => lit(x, indent + '  '));
    const flat = `[${items.join(', ')}]`;
    return flat.length < 110 ? flat : `[\n${items.map((i) => `${indent}  ${i}`).join(',\n')},\n${indent}]`;
  }
  if (v && typeof v === 'object') {
    const entries = Object.entries(v).map(([k, x]) => `${/^[a-z_$][\w$]*$/i.test(k) ? k : JSON.stringify(k)}: ${lit(x, indent + '  ')}`);
    const flat = `{ ${entries.join(', ')} }`;
    return flat.length < 110 ? flat : `{\n${entries.map((e) => `${indent}  ${e}`).join(',\n')},\n${indent}}`;
  }
  return JSON.stringify(v);
}

function block(t: BlockType) {
  const c = contracts[t];
  named = new Map();
  const shape = c.schema.shape as Record<string, z.ZodType>;
  const props = Object.entries(shape).map(([k, v]) => {
    const u = unwrap(v);
    const dflt = u.dflt !== undefined && u.dflt !== '' ? ` = ${JSON.stringify(u.dflt)}` : '';
    return `  ${k}${u.optional ? '?' : ''}: ${ts(u.inner)}${dflt}${u.desc ? `  — ${u.desc}` : ''}`;
  });
  const types = [...named].map(([n, body]) => (body.includes('  — ') ? `  ${n} = {\n${body}\n  }` : `  ${n} = { ${body.trim().split(/\n\s*/).join('; ')} }`));
  const variants = Object.entries(c.examples)
    .filter(([k]) => k !== 'demo')
    .map(([k, e]) => `${k} (${e.note})`);
  const out = [
    `### ${t}`,
    `${c.purpose}`,
    `**Use when:** ${c.whenToUse}`,
    '```ts',
    `props: {`,
    ...props,
    `}`,
    ...(types.length ? ['', ...types] : []),
    '```',
  ];
  if (c.results) out.push(`**Saves:** ${c.results}`);
  if (c.notes?.length) out.push(`**Notes:** ${c.notes.join(' ')}`);
  if (variants.length) out.push(`**Variants shown in /kit:** ${variants.join(' · ')}`);
  out.push('```ts', `{ type: '${t}', id: '…', props: ${lit(c.snippet)} }`, '```');
  return out.join('\n');
}

const ORDER: Category[] = ['core', 'assessment', 'chart', 'practice', 'visual', 'layout'];

const header = `# Learning Kit — block contracts

> GENERATED by \`npm run docs\` from \`src/kit/blocks/*/contract.ts\`. Do not edit by hand.
> This file is everything you need to write a board. **Do not read \`src/kit\`.**

## Board file
One file per board: \`boards/<slug>.board.tsx\`. Start with \`npm run new-board <slug>\`, or copy \`boards/go-slices.board.tsx\`.

\`\`\`ts
import { defineBoard } from '@kit';

export default defineBoard({
  slug: 'go-slices',            // must match the file name; URL is /b/go-slices
  subject: 'Go',                // groups boards on the course map
  lesson: 'Lesson 3',           // optional kicker
  title: 'Slices, from the inside',
  blurb: 'len, cap, append and shared backing arrays.', // optional, course map
  meta: ['~15 min', 'Beginner'],  // optional header pills
  lang: 'go',                   // optional default code language for highlighting
  blocks: [
    { type: 'Explainer', id: 'intro', props: { title: '…', body: '…' } },
    { type: 'Quiz', id: 'check', span: 'full', props: { questions: [/* … */] } },
  ],
});
\`\`\`

- \`id\` is required, unique on the board, and stable: results are saved under it. Never rename an id once the learner has used the board.
- A block entry has exactly four keys: \`type\`, \`id\`, \`span\` (optional) and \`props\`. Everything else, including options like \`kind\` or \`tone\`, goes inside \`props\`.
- \`span: 'full'\` makes a block take the whole row; it is the only value. Without it, blocks flow into as many 460px+ columns as fit.
- Props are plain data. Some props accept a function (shown as \`(p: number) => …\`); write those inline or as helpers at the top of the file.
- Text props accept light formatting: blank line = new paragraph, \`- \` bullets, \`\\\`code\\\`\`, \`**bold**\`, \`*italic*\`, \`[link](url)\`.
- Run \`npm run check\` after writing a board. It type-checks and validates every prop and prints the exact path of any mistake, e.g. \`blocks[3] (Quiz "check").props.questions.1.answer: answer must be an index into options\`. In the browser, a block with bad props shows a red error card with the same messages.

## Recipe
1. **Understand**: an Explainer, plus one visual or chart block.
2. **Practice**: 2–3 practice blocks of different types. Prefer blocks where the learner produces an answer over ones where they only recognise it.
3. **Remember**: Flashcards (3–8 cards).
4. **Check**: Quiz (3–6 questions). Always write \`explain\` — it is what teaches.

The recipe is a shape, not a checklist: pick only blocks that fit the subject. **Never invent data.** Charts and Stats need real, checkable numbers (or a function that computes them). If the subject has no natural quantity, leave charts out.

Match the subject: code goes in \`code\` fields; languages, maths and everything else in plain text. Keep each block focused. Mix block types rather than repeating one. Don't invent new styles on a board; if a new block type is needed, add it to the kit.

## Results → review loop
- The app writes learner activity to \`results/<slug>.json\` (never edit it). Per block id: \`{ type, status: "in_progress" | "submitted", progress, attempts: [{ at, score?, total?, items: [{ prompt, answer, expected?, correct?, needsReview? }], needsReview?, files?, meta? }] }\`.
- \`needsReview: true\` means the block could not grade it (drawings, explanations, free text). Judge it yourself. \`files\` are saved next to the JSON (e.g. \`results/go-slices/sketch-drawing.png\`); open them.
- Give feedback by writing \`reviews/<slug>.json\` (the app never writes it). The open board updates live, no reload:

\`\`\`json
{
  "board": { "feedback": "Overall comment shown under the board title." },
  "blocks": {
    "check": { "verdict": "partial", "feedback": "3 of 4 — see question 2.", "items": [{ "index": 1, "correct": false, "feedback": "Why…" }] }
  }
}
\`\`\`
\`verdict\`: \`"correct" | "partial" | "incorrect"\` or short free text. \`items[].index\` is the index in \`attempt.items\` (0-based).

## Blocks
`;

const sections = ORDER.map((cat) => {
  const list = blockTypes.filter((t) => contracts[t].category === cat);
  if (!list.length) return '';
  return `\n## ${CATEGORY_LABEL[cat]}\n\n${list.map(block).join('\n\n')}\n`;
}).join('');

const index = ORDER.map((cat) => {
  const list = blockTypes.filter((t) => contracts[t].category === cat);
  return list.length ? `- **${CATEGORY_LABEL[cat]}:** ${list.join(', ')}` : '';
})
  .filter(Boolean)
  .join('\n');

const out = `${header}${index}\n${sections}`;
const file = path.resolve(import.meta.dirname, '..', 'KIT.md');
fs.writeFileSync(file, out);
console.log(`KIT.md written: ${blockTypes.length} blocks, ${(out.length / 1024).toFixed(1)} KB`);
