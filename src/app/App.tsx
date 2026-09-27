import { TooltipProvider } from '@kit/ui/tooltip';
import { BoardView } from '@kit/BoardView';
import { usePath, Link } from './router';
import { findBoard } from './boards';
import { CourseMap } from './CourseMap';
import { Catalogue } from './Catalogue';

export function App() {
  const path = usePath();
  const parts = path.split('/').filter(Boolean);
  let page;
  if (parts[0] === 'b' && parts[1]) {
    const board = findBoard(parts[1]);
    page = board ? <BoardView key={board.slug} board={board} /> : <NotFound what={`board "${parts[1]}"`} />;
  } else if (parts[0] === 'kit') page = <Catalogue only={parts[1]} />;
  else page = <CourseMap />;
  return (
    <TooltipProvider>
      <Nav />
      {page}
    </TooltipProvider>
  );
}

function Nav() {
  return (
    <nav className="mx-auto flex max-w-[1400px] items-center gap-2 px-6 pt-5 text-sm font-bold">
      <Link href="/" className="rounded-full bg-surface px-3 py-1.5 text-ink no-underline hover:text-ink">Boards</Link>
      <Link href="/kit" className="rounded-full px-3 py-1.5 text-ink-3 no-underline hover:text-ink">Kit</Link>
    </nav>
  );
}

function NotFound({ what }: { what: string }) {
  return (
    <main className="mx-auto max-w-[1160px] px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Not found</h1>
      <p className="text-ink-3">No {what}. <Link href="/">Back to boards</Link></p>
    </main>
  );
}
