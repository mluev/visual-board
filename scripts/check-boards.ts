/**
 * Validates every board in boards/: meta, unique ids, known block types, every prop.
 *   npm run check   (runs tsc first, then this)
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBoard } from '../src/kit/board';

const dir = path.resolve(import.meta.dirname, '..', 'boards');
const files = fs.readdirSync(dir).filter((f) => /\.board\.(tsx|ts|json)$/.test(f));
let bad = 0;

for (const f of files) {
  const full = path.join(dir, f);
  let board: unknown;
  try {
    board = f.endsWith('.json') ? JSON.parse(fs.readFileSync(full, 'utf8')) : (await import(pathToFileURL(full).href)).default;
  } catch (e) {
    console.log(`✗ ${f}\n    could not load: ${(e as Error).message}`);
    bad++;
    continue;
  }
  const issues = validateBoard(board);
  const slug = f.replace(/\.board\.(tsx|ts|json)$/, '');
  if (board && typeof board === 'object' && (board as { slug?: string }).slug !== slug) issues.push({ path: 'slug', message: `must match the file name ("${slug}")` });
  if (issues.length) {
    bad++;
    console.log(`✗ ${f}`);
    for (const i of issues) console.log(`    ${i.path}: ${i.message}`);
  } else console.log(`✓ ${f}`);
}

console.log(files.length ? `\n${files.length - bad}/${files.length} boards OK` : 'No boards in boards/');
process.exit(bad ? 1 : 0);
