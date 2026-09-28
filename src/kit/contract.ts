/**
 * The block contract: one object per block that holds everything an author needs.
 * It stays free of React so boards, scripts and docs can import it anywhere.
 * KIT.md is generated from these contracts (scripts/gen-kit-docs.ts).
 */
import { z } from 'zod';

export type Tone = 'ink' | 'violet' | 'orange' | 'blue' | 'teal' | 'gold' | 'pink' | 'green' | 'red';

export type Category = 'core' | 'assessment' | 'chart' | 'practice' | 'visual' | 'layout';

export const CATEGORY_LABEL: Record<Category, string> = {
  core: 'Core',
  assessment: 'Check',
  chart: 'Charts',
  practice: 'Practice (learner produces an answer)',
  visual: 'Visual (explore an idea)',
  layout: 'Layout',
};

export type Example<S extends z.ZodType> = {
  /** One line: what this variant shows. */
  note: string;
  props: z.input<S>;
  /** Show this example full width in the catalogue. */
  wide?: boolean;
};

export type Contract<T extends string = string, S extends z.ZodObject = z.ZodObject> = {
  type: T;
  category: Category;
  tone: Tone;
  /** Default pill text. */
  pill: string;
  /** One sentence: what the block is. */
  purpose: string;
  /** One or two sentences: when an author should pick it. */
  whenToUse: string;
  /** What the block writes to results/<board>.json. Omit for display-only blocks. */
  results?: string;
  /** Keyboard shortcuts and other behaviour worth knowing. */
  notes?: string[];
  schema: S;
  /** Short, realistic usage shown in KIT.md. Type-checked against the schema. */
  snippet: z.input<S>;
  /** Named variants. `demo` is used when the block is rendered without props. */
  examples: { demo: Example<S> } & Record<string, Example<S>>;
};

export function defineContract<const T extends string, S extends z.ZodObject>(c: Contract<T, S>): Contract<T, S> {
  return c;
}

/* ---------- schema helpers (they carry the metadata the doc generator prints) ---------- */

/** A function prop. `signature` is printed in KIT.md, e.g. "(p: number) => Bar[]". */
export function fn<F extends (...args: never[]) => unknown>(signature: string) {
  return z.custom<F>((v) => typeof v === 'function', { message: `Expected a function ${signature}` }).meta({ signature });
}

/** Names a nested object type so KIT.md prints it once as `Name = {...}`. */
export function named<S extends z.ZodType>(name: string, schema: S): S {
  return schema.meta({ title: name }) as S;
}

/** A value that may be a plain value or a function of the parameter (for live, slider-driven blocks). */
export function valueOrFn<S extends z.ZodType>(value: S, signature: string) {
  return z.union([value, fn<(...args: never[]) => z.output<S>>(signature)]);
}

/** Card/grid spans. */
export type Span = 'full';
