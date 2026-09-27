# Learning Kit: how to build a board

The user learns by asking questions. Answer by **writing or editing a board**: one `Board - <Topic>.dc.html` file made from kit blocks. Don't answer with a wall of text. Start from `Board - Go Slices.dc.html` and copy it.

## Board recipe
1. The header is the same as the example: small kicker ("Subject · Lesson n"), a Bricolage 44px title, and meta pills.
2. Blocks go in a grid: `repeat(auto-fit,minmax(min(100%,460px),1fr))`, gap 16. For a full-width block, add `style="grid-column:1 / -1"` to its `<dc-import>`.
3. Put all block data in the board's `renderVals()` (arrays, functions) and pass it with `{{ holes }}`. Plain strings can be literal attributes.
4. Every `<dc-import>` needs `hint-size` (e.g. `"100%,460px"`).
5. A good order: **understand** (Explainer + one visual block) → **practice** (2–3 practice blocks, mixing types) → **remember** (Flashcards) → **check** (Quiz or Test). Pick blocks that fit the subject. For example: languages use PatternTable, Cloze, ListenType, SortBuckets. Math uses Formula, FunctionPlot, WorkedExample. Code uses Annotated, Stepper, SpotMistake, CodeExercise. History and science use Timeline, ConceptMap, Hotspots, CompareTable, OrderSteps.
6. Give each block a stable id (`deckId`, `quizId`, `boardId`, `explainId`, `exerciseId`) so progress persists in localStorage. Image blocks need a unique `slotId`.
8. After creating a board, add it to `BOARDS` in `Boards.dc.html` (the course map), with the same quizIds and deckIds.
7. Page background is `#ECEEF1`. Blocks are already white cards; don't wrap them.

## Blocks (props; kebab-case in attributes)
- **Explainer**: `label`, `title`, `body` (use `\n\n` between paragraphs), `code`, `points: string[]`
- **Flashcards**: `title`, `cards: {front, back, hint?, example?}[]`, `deckId`, `initial: front|back|done`
- **Quiz** (one question at a time, timed, score and review at the end): `title`, `description`, `questions: {q, code?, options[], answer: index, explain?}[]`, `timeLimit` (seconds, 0 = untimed, default 90), `quizId`, `initial: intro|run|done`
- **Test** (all questions on one page, submitted together): `title`, `questions` (same shape as Quiz; `answer` can be an array for multiple choice), `initial: blank|answered|submitted`
- **BarChart**: `title`, `data: {label,value}[]` or `(p) => {label,value}[]`, `param: {name,min,max,step,value}`, `note` (string or `(p, data) => string`), `highlight` (index or label), `unit`, `allowLog`
- **LineChart**: `title`, `series: {name, color?, points:[x,y][]}[]` or `(p) => series`, `param` (can include `unit`), `note`, `xLabel`, `yMin`
- **Whiteboard**: `title`, `prompt`, `height` (px), `boardId`

### Practice (gold pill)
- **Cloze**: `title`, `text` with blanks as `[answer]` or `[answer|alt]`, `bank` (word bank, default true), `mono`
- **ShortAnswer**: `questions: {q, answer: string|string[], hint?, explain?}[]`. Small typos and missing accents are accepted as "almost"
- **Matching**: `pairs: {left, right}[]` (4–7), `mono`
- **OrderSteps**: `items: string[]` in the CORRECT order (shuffled on display), `explain`, `instruction`
- **SortBuckets**: `categories: string[]`, `items: {text, cat: index, why?}[]`
- **SpotMistake**: `lines: (string | {text, fix, why?})[]`. Lines that have a `fix` are the mistakes. Set `mono` (default true) to false for prose
- **ExplainBack**: `prompt`, `keyPoints: (string | {point, keywords?[]})[]`, `explainId`. Learners self-grade, plus a "Check with AI" button when Claude is available in the page
- **WorkedExample**: `problem`, `steps: {work, why?, accept?[]}[]`. Has Study, Faded and Solve modes
- **CodeExercise**: `language`, `task`, `starter`, `tests: {call, expect}[]` (only run for JavaScript), `hints[]`, `solution`, `exerciseId`. For other languages, it's write, then compare with the solution
- **LabelDiagram**: `image` (url) or `slotId` (the user drops an image), `pins: {x%, y%, label}[]`, `distractors[]`, `aspect`
- **ListenType**: `items: {text, lang (BCP-47), translation?}[]`. Uses browser speech for dictation and, where supported, speaking practice

### Visual (teal pill)
- **ConceptMap**: `nodes: {id, label, x%, y%, note?}[]`, `links: {from, to, label?}[]`, `height`
- **Timeline**: `events: {date, title, body?}[]`
- **Stepper**: `steps: {cells[], caption, hl?[], swap?[], done?[], ptr?{index:name}, vars?{}}[]` or a function that returns them. Generate the steps in `renderVals` for algorithms
- **FunctionPlot**: `fns: {name, f:(x,p)=>y}[]`, `params: {name,min,max,step,value}[]`, `x:[min,max]`, `y:[min,max]`, `formula` and `note` (string or `(p)=>string`)
- **CompareTable**: `columns: string[]`, `rows: {label, values[]}[]`, `note`. Has a built-in "Quiz me" mode
- **Annotated**: `text`, `notes: {mark (exact substring), note}[]`, `mono`
- **Formula**: `parts: {t, name?, note?}[]` (parts with a name are explainable), `calc: {vars:{sym,label,value}[], f:(v)=>number, label}`
- **FlowDiagram**: `nodes: {id, type: start|step|decision|end, text, note?, next?, yes?, no?, yesLabel?, noLabel?}[]`, `cases: string[]`
- **Tree**: `root: {label, note?, children?[]}`
- **Hotspots**: `image` or `slotId`, `spots: {x%, y%, title, body}[]`, `aspect`
- **PatternTable**: `columns[]`, `rows: {label, cells: 'stem|ending'[]}[]`, `subtitle`, `note`. Has a Practice mode
- **Venn**: `sets: string[]` (2 or 3), `items: {text, in: index[]}[]`. Has a sorting mode

### Pages
- **Boards.dc.html**: the course map. Update its `BOARDS` array for every new board.

## Rules
- Match the subject: code goes in `code` fields; languages, math and anything else in plain text.
- Explanations in Quiz and Test are what teach. Always write them, and say *why*.
- Keep each block focused: 3–8 cards, 3–6 quiz questions.
- Prefer blocks where the learner produces an answer (Cloze, ShortAnswer, ExplainBack, WorkedExample in Solve mode) over ones where they only recognize it. Mix block types instead of repeating one.
- Don't invent new block styles on a board. If a new block type is needed, add it to the kit as `<Name>.dc.html` in the same card style (white, 22px radius, colored pill label) and list it in `Learning Kit.dc.html`.
