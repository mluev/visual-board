/**
 * Scaffolds boards/<slug>.board.tsx.
 *   npm run new-board <slug> [subject]
 */
import fs from 'node:fs';
import path from 'node:path';

const [slug, subject = 'General'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('Usage: npm run new-board <slug> [subject]   (slug: lowercase letters, digits, dashes)');
  process.exit(1);
}
const file = path.resolve(import.meta.dirname, '..', 'boards', `${slug}.board.tsx`);
if (fs.existsSync(file)) {
  console.error(`boards/${slug}.board.tsx already exists`);
  process.exit(1);
}
const title = slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
fs.writeFileSync(
  file,
  `import { defineBoard } from '@kit';

export default defineBoard({
  slug: '${slug}',
  subject: ${JSON.stringify(subject)},
  title: ${JSON.stringify(title)},
  meta: ['~10 min'],
  blocks: [
    { type: 'Explainer', id: 'intro', props: { title: ${JSON.stringify(title)}, body: 'TODO' } },
    {
      type: 'Quiz',
      id: 'check',
      props: { questions: [{ q: 'TODO', options: ['A', 'B'], answer: 0, explain: 'TODO' }] },
    },
  ],
});
`,
);
console.log(`Created boards/${slug}.board.tsx → http://localhost:5173/b/${slug}`);
