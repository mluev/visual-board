import type { ComponentType } from 'react';
import type { BlockProps } from './types';
import type { BlockType } from './contracts';
import { Explainer } from './blocks/Explainer/Explainer';
import { Flashcards } from './blocks/Flashcards/Flashcards';
import { Quiz } from './blocks/Quiz/Quiz';
import { BarChart } from './blocks/BarChart/BarChart';
import { Whiteboard } from './blocks/Whiteboard/Whiteboard';
import { Test } from './blocks/Test/Test';
import { ShortAnswer } from './blocks/ShortAnswer/ShortAnswer';
import { Cloze } from './blocks/Cloze/Cloze';
import { ExplainBack } from './blocks/ExplainBack/ExplainBack';
import { WorkedExample } from './blocks/WorkedExample/WorkedExample';
import { CodeExercise } from './blocks/CodeExercise/CodeExercise';
import { Callout } from './blocks/Callout/Callout';
import { Stats } from './blocks/Stats/Stats';

export const components: { [K in BlockType]: ComponentType<BlockProps<K>> } = {
  Explainer,
  Flashcards,
  Quiz,
  BarChart,
  Whiteboard,
  Test,
  ShortAnswer,
  Cloze,
  ExplainBack,
  WorkedExample,
  CodeExercise,
  Callout,
  Stats,
};
