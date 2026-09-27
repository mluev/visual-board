import type { BoardDef } from './board';
import { Block } from './Block';
import { BoardProvider } from './results/store';
import { CodeLangContext } from './primitives/CodeBlock';
import { BlockGrid, BoardFeedback, BoardHeader, BoardShell, GridItem } from './primitives/Board';

/** Renders a whole board: header, tutor feedback, then every block in the grid, with results saving on. */
export function BoardView({ board }: { board: BoardDef }) {
  const kicker = [board.subject, board.lesson].filter(Boolean).join(' · ');
  return (
    <BoardProvider slug={board.slug} title={board.title}>
      <CodeLangContext.Provider value={board.lang}>
        <BoardShell>
          <BoardHeader kicker={kicker} title={board.title} meta={board.meta} />
          <BoardFeedback />
          <BlockGrid>
            {board.blocks.map((b) => (
              <GridItem key={b.id} span={b.span}>
                <Block type={b.type} id={b.id} props={b.props} />
              </GridItem>
            ))}
          </BlockGrid>
        </BoardShell>
      </CodeLangContext.Provider>
    </BoardProvider>
  );
}
