import type { BlockOutput, BlockType } from './contracts';

/** Props a block component receives: the parsed schema output (defaults applied). */
export type BlockProps<K extends BlockType> = BlockOutput<K>;
