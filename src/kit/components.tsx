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
import { Matching } from './blocks/Matching/Matching';
import { OrderSteps } from './blocks/OrderSteps/OrderSteps';
import { SortBuckets } from './blocks/SortBuckets/SortBuckets';
import { SpotMistake } from './blocks/SpotMistake/SpotMistake';
import { Venn } from './blocks/Venn/Venn';
import { LabelDiagram } from './blocks/LabelDiagram/LabelDiagram';
import { ListenType } from './blocks/ListenType/ListenType';
import { LineChart } from './blocks/LineChart/LineChart';
import { FunctionPlot } from './blocks/FunctionPlot/FunctionPlot';
import { Formula } from './blocks/Formula/Formula';
import { CompareTable } from './blocks/CompareTable/CompareTable';
import { PatternTable } from './blocks/PatternTable/PatternTable';
import { Annotated } from './blocks/Annotated/Annotated';
import { Timeline } from './blocks/Timeline/Timeline';
import { Stepper } from './blocks/Stepper/Stepper';
import { ConceptMap } from './blocks/ConceptMap/ConceptMap';
import { FlowDiagram } from './blocks/FlowDiagram/FlowDiagram';
import { Tree } from './blocks/Tree/Tree';
import { Hotspots } from './blocks/Hotspots/Hotspots';
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
  Matching,
  OrderSteps,
  SortBuckets,
  SpotMistake,
  Venn,
  LabelDiagram,
  ListenType,
  LineChart,
  FunctionPlot,
  Formula,
  CompareTable,
  PatternTable,
  Annotated,
  Timeline,
  Stepper,
  ConceptMap,
  FlowDiagram,
  Tree,
  Hotspots,
  Callout,
  Stats,
};
