import type { BoardDef } from '@kit/board';

/** Every board in /boards, discovered automatically. */
const modules = import.meta.glob<{ default: BoardDef }>('/boards/*.board.{tsx,ts,json}', { eager: true });

export const boards: BoardDef[] = Object.entries(modules)
  .map(([file, m]) => {
    const b = (m.default ?? m) as BoardDef;
    const fromFile = file.split('/').pop()!.replace(/\.board\.(tsx|ts|json)$/, '');
    return { ...b, slug: b.slug ?? fromFile };
  })
  .sort((a, b) => a.subject.localeCompare(b.subject) || (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));

export const findBoard = (slug: string) => boards.find((b) => b.slug === slug);
