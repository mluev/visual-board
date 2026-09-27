/**
 * Dev-server API that persists learner activity to disk and streams AI reviews back.
 *
 *   GET  /api/results                 → { [slug]: BoardResults }
 *   GET  /api/results/:slug           → BoardResults | empty
 *   POST /api/results/:slug/:blockId  ← { type, title?, progress?, attempt? }
 *   GET  /api/reviews/:slug           → BoardReview | empty
 *   GET  /api/uploads/:name           → { url } | empty           (image slots)
 *   POST /api/uploads/:name           ← { dataUrl } → { url }
 *
 * reviews/*.json is watched; changes are pushed to the page as the `kit:review` HMR event.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import type { Attempt, BoardResults, SubmitInput } from '../src/kit/results/types';

const SAFE = /^[a-z0-9][a-z0-9._-]*$/i;

type Body = { type: string; title?: string; progress?: unknown; attempt?: SubmitInput };

export function resultsPlugin(): Plugin {
  let root = process.cwd();
  const dirs = () => ({
    results: path.join(root, 'results'),
    reviews: path.join(root, 'reviews'),
    uploads: path.join(root, 'public', 'uploads'),
  });

  const readJson = <T>(file: string): T | null => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
    } catch {
      return null;
    }
  };
  const writeJson = (file: string, data: unknown) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
    fs.renameSync(tmp, file);
  };
  const saveDataUrl = (file: string, dataUrl: string) => {
    const m = /^data:[^;]+;base64,(.*)$/.exec(dataUrl);
    if (!m) throw new Error('Expected a base64 data URL');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(m[1], 'base64'));
  };

  const send = (res: ServerResponse, status: number, data: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(data === undefined ? '' : JSON.stringify(data));
  };
  const body = (req: IncomingMessage) =>
    new Promise<unknown>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        try {
          resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });

  function update(slug: string, blockId: string, b: Body) {
    const file = path.join(dirs().results, `${slug}.json`);
    const now = new Date().toISOString();
    const data: BoardResults = readJson<BoardResults>(file) ?? { board: slug, updatedAt: now, blocks: {} };
    if (b.title) data.title = b.title;
    const prev = data.blocks[blockId];
    const block = prev ?? { type: b.type, status: 'in_progress' as const, updatedAt: now, attempts: [] };
    block.type = b.type;
    block.updatedAt = now;
    if (b.progress !== undefined) block.progress = b.progress;
    if (b.attempt) {
      const { files, ...rest } = b.attempt;
      const attempt: Attempt = { ...rest, at: now };
      if (rest.items?.some((i) => i.needsReview)) attempt.needsReview = true;
      if (files) {
        attempt.files = [];
        for (const [name, dataUrl] of Object.entries(files)) {
          if (!SAFE.test(name)) continue;
          const rel = `${slug}/${blockId}-${name}`;
          saveDataUrl(path.join(dirs().results, rel), dataUrl);
          attempt.files.push(`results/${rel}`);
        }
      }
      block.attempts.push(attempt);
      block.status = 'submitted';
    }
    data.blocks[blockId] = block;
    data.updatedAt = now;
    writeJson(file, data);
    return data;
  }

  function pushReview(server: ViteDevServer, file: string) {
    if (!file.startsWith(dirs().reviews) || !file.endsWith('.json')) return;
    const slug = path.basename(file, '.json');
    const review = readJson(file);
    server.ws.send({ type: 'custom', event: 'kit:review', data: { slug, review } });
  }

  return {
    name: 'learning-kit-results',
    configResolved(c) {
      root = c.root;
    },
    configureServer(server) {
      fs.mkdirSync(dirs().reviews, { recursive: true });
      server.watcher.add(dirs().reviews);
      server.watcher.on('add', (f) => pushReview(server, f));
      server.watcher.on('change', (f) => pushReview(server, f));
      server.watcher.on('unlink', (f) => {
        if (f.startsWith(dirs().reviews) && f.endsWith('.json'))
          server.ws.send({ type: 'custom', event: 'kit:review', data: { slug: path.basename(f, '.json'), review: null } });
      });

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://x');
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts[0] !== 'api') return next();
        try {
          const [, kind, slug, blockId] = parts;
          if ((slug && !SAFE.test(slug)) || (blockId && !SAFE.test(blockId))) return send(res, 400, { error: 'bad name' });

          if (kind === 'results' && req.method === 'GET') {
            if (!slug) {
              const all: Record<string, unknown> = {};
              const dir = dirs().results;
              if (fs.existsSync(dir))
                for (const f of fs.readdirSync(dir)) if (f.endsWith('.json')) all[f.slice(0, -5)] = readJson(path.join(dir, f));
              return send(res, 200, all);
            }
            return send(res, 200, readJson(path.join(dirs().results, `${slug}.json`)));
          }
          if (kind === 'results' && req.method === 'POST' && slug && blockId) {
            const b = (await body(req)) as Body;
            if (!b.type) return send(res, 400, { error: 'type is required' });
            return send(res, 200, update(slug, blockId, b));
          }
          if (kind === 'reviews' && req.method === 'GET' && slug) {
            return send(res, 200, readJson(path.join(dirs().reviews, `${slug}.json`)));
          }
          if (kind === 'uploads' && req.method === 'GET' && slug) {
            const dir = dirs().uploads;
            const f = fs.existsSync(dir) ? fs.readdirSync(dir).find((x) => x.slice(0, x.lastIndexOf('.')) === slug) : undefined;
            return send(res, 200, f ? { url: `/uploads/${f}?v=${fs.statSync(path.join(dir, f)).mtimeMs | 0}` } : undefined);
          }
          if (kind === 'uploads' && req.method === 'POST' && slug) {
            const dir = dirs().uploads;
            if (fs.existsSync(dir)) for (const x of fs.readdirSync(dir)) if (x.slice(0, x.lastIndexOf('.')) === slug) fs.unlinkSync(path.join(dir, x));
            const { dataUrl } = (await body(req)) as { dataUrl: string };
            const ext = /^data:image\/(png|jpe?g|gif|webp|svg\+xml)/.exec(dataUrl)?.[1]?.replace('svg+xml', 'svg').replace('jpeg', 'jpg');
            if (!ext) return send(res, 400, { error: 'expected an image data URL' });
            const name = `${slug}.${ext}`;
            saveDataUrl(path.join(dirs().uploads, name), dataUrl);
            return send(res, 200, { url: `/uploads/${name}?v=${Date.now()}` });
          }
          return send(res, 404, { error: 'not found' });
        } catch (e) {
          return send(res, 500, { error: String(e) });
        }
      });
    },
  };
}
