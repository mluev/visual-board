# Learning Kit

A React kit of interactive learning blocks. You teach by **writing a board**: one data file that lists blocks and their props. You don't answer with a wall of text.

## Writing or editing a board
1. Read **`KIT.md`**. It is the full contract for every block: its purpose, when to use it, props, defaults, what it saves, and an example. **Do not read `src/kit/`.** Everything you need is in KIT.md.
2. Create `boards/<slug>.board.tsx` with `npm run new-board <slug> "<Subject>"`, or copy `boards/go-slices.board.tsx`.
3. Fill `blocks: [{ type, id, props }]`. Follow the recipe in KIT.md: understand → practice → remember → check.
4. Run `npm run check`. Fix every reported path until it prints `OK`.
5. The board is at `http://localhost:5173/b/<slug>` (dev server: `npm run dev`). New boards show up on the course map (`/`) automatically.

## Judging the learner's work
- Activity is in `results/<slug>.json`. Read it; never edit it. Each block id has `attempts[].items[]` with `prompt`, `answer`, `expected` and `correct`. Items with `needsReview: true` are yours to judge. Open any `files` (e.g. whiteboard PNGs).
- Write feedback to `reviews/<slug>.json` (format in KIT.md). The open board shows it live.
- When the learner is struggling, add a follow-up block to the board (more practice on the weak spot) instead of just explaining.

## Changing the kit itself (only when asked, or when a needed block type doesn't exist)
- Each block lives in `src/kit/blocks/<Name>/`:
  - `contract.ts`: a Zod schema with `.describe()` on every prop, plus purpose, whenToUse, results, snippet and examples.
  - `<Name>.tsx`: the component. It receives the parsed props.
- Register a new block in `src/kit/contracts.ts` and `src/kit/components.tsx`.
- Build from the primitives in `src/kit/primitives/`: BlockCard, Pill, Button, Meter, Segmented, Panel, RichText, CodeBlock, OptionButton, ScoreBanner, ParamSlider. Colours come from the card `tone` (`bg-tone`, `bg-tone-soft`, `text-tone-ink`…). Don't hard-code hex values in blocks.
- Interactive blocks call `useBlockResult()` from `src/kit/results/store.tsx`: `saveProgress()` for resumable state, `submit()` for finished attempts.
- Visual reference: `design/<Name>.dc.html`. Match its layout and behaviour.
- After changes: `npm run docs` (regenerates KIT.md), `npm run check`, `npm test`.

## Style
UK English. Explanations say *why*. Keep blocks focused: 3–8 cards, 3–6 quiz questions.
