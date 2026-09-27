/**
 * Board definition. A board is a list of blocks; the renderer lays them out in a responsive grid.
 * Authoring guide: KIT.md (generated) and CLAUDE.md.
 */
import { z } from 'zod';
import { contracts, type BlockInput, type BlockType } from './contracts';

export type BlockSpec = {
  [K in BlockType]: {
    type: K;
    /** Stable id, unique on the board. Results are saved under it: results/<board>.json → blocks[id]. */
    id: string;
    /** "full" spans the whole row. */
    span?: 'full';
    props: BlockInput<K>;
  };
}[BlockType];

export type BoardDef = {
  /** URL and file name: boards/<slug>.board.tsx → /b/<slug>. Lowercase, dashes. */
  slug: string;
  /** Groups boards on the course map, e.g. "Go", "Spanish", "Calculus". */
  subject: string;
  /** Kicker above the title, e.g. "Lesson 3". */
  lesson?: string;
  title: string;
  /** One line on the course map. */
  blurb?: string;
  /** Pills in the header, e.g. ["~15 min", "Beginner"]. */
  meta?: string[];
  /** Default code language for highlighting (go, ts, python, sql…). */
  lang?: string;
  /** Sort order within the subject on the course map. */
  order?: number;
  blocks: BlockSpec[];
};

export function defineBoard(board: BoardDef): BoardDef {
  return board;
}

export const boardMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'lowercase letters, digits and dashes'),
  subject: z.string().min(1),
  lesson: z.string().optional(),
  title: z.string().min(1),
  blurb: z.string().optional(),
  meta: z.array(z.string()).optional(),
  lang: z.string().optional(),
  order: z.number().optional(),
  blocks: z.array(z.object({ type: z.string(), id: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/i, 'letters, digits, dot, dash, underscore'), span: z.literal('full').optional(), props: z.record(z.string(), z.unknown()) })).min(1),
});

export type Issue = { path: string; message: string };

/** Validates a whole board: meta, unique ids, known types and every block's props. */
export function validateBoard(board: unknown): Issue[] {
  const issues: Issue[] = [];
  const meta = boardMetaSchema.safeParse(board);
  if (!meta.success) {
    for (const i of meta.error.issues) issues.push({ path: i.path.join('.'), message: i.message });
    return issues;
  }
  const seen = new Set<string>();
  meta.data.blocks.forEach((b, i) => {
    const at = `blocks[${i}] (${b.type} "${b.id}")`;
    if (seen.has(b.id)) issues.push({ path: at, message: `duplicate id "${b.id}"` });
    seen.add(b.id);
    if (!(b.type in contracts)) {
      issues.push({ path: at, message: `unknown block type "${b.type}". Known: ${Object.keys(contracts).join(', ')}` });
      return;
    }
    const r = contracts[b.type as BlockType].schema.safeParse(b.props);
    if (!r.success) for (const e of r.error.issues) issues.push({ path: `${at}.props.${e.path.join('.')}`, message: e.message });
  });
  return issues;
}
