/**
 * Registry of every block contract (no React here, so boards, scripts and docs can import it).
 * To add a block: create src/kit/blocks/<Name>/{contract.ts,<Name>.tsx}, add it here and in components.tsx.
 */
import type { z } from 'zod';
import { explainer } from './blocks/Explainer/contract';
import { flashcards } from './blocks/Flashcards/contract';
import { quiz } from './blocks/Quiz/contract';
import { barChart } from './blocks/BarChart/contract';
import { whiteboard } from './blocks/Whiteboard/contract';
import { test } from './blocks/Test/contract';
import { shortAnswer } from './blocks/ShortAnswer/contract';
import { cloze } from './blocks/Cloze/contract';
import { explainBack } from './blocks/ExplainBack/contract';
import { workedExample } from './blocks/WorkedExample/contract';
import { codeExercise } from './blocks/CodeExercise/contract';
import { callout } from './blocks/Callout/contract';
import { stats } from './blocks/Stats/contract';

export const contracts = {
  Explainer: explainer,
  Flashcards: flashcards,
  Quiz: quiz,
  BarChart: barChart,
  Whiteboard: whiteboard,
  Test: test,
  ShortAnswer: shortAnswer,
  Cloze: cloze,
  ExplainBack: explainBack,
  WorkedExample: workedExample,
  CodeExercise: codeExercise,
  Callout: callout,
  Stats: stats,
} as const;

export type Contracts = typeof contracts;
export type BlockType = keyof Contracts;
/** What an author writes (defaults optional). */
export type BlockInput<K extends BlockType> = z.input<Contracts[K]['schema']>;
/** What a component receives (defaults applied). */
export type BlockOutput<K extends BlockType> = z.output<Contracts[K]['schema']>;

export const blockTypes = Object.keys(contracts) as BlockType[];
export const isBlockType = (t: string): t is BlockType => t in contracts;
