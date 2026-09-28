import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { blockTypes, contracts } from './contracts';
import { Block } from './Block';
import { BoardView } from './BoardView';
import { validateBoard, type BoardDef } from './board';
import goSlices from '../../boards/go-slices.board';

beforeEach(() => {
  // canvas and ResizeObserver are not in jsdom
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
});

describe('every contract', () => {
  for (const t of blockTypes) {
    const c = contracts[t];
    it(`${t}: snippet and examples satisfy the schema`, () => {
      expect(c.schema.safeParse(c.snippet).success).toBe(true);
      for (const [name, ex] of Object.entries(c.examples)) {
        const r = c.schema.safeParse(ex.props);
        expect(r.success, `${t}.${name}: ${r.error?.message}`).toBe(true);
      }
    });
    for (const [name, ex] of Object.entries(c.examples)) {
      it(`${t}.${name} renders without errors`, () => {
        render(<Block type={t} props={ex.props as Record<string, unknown>} />);
        expect(screen.queryByRole('alert')).toBeNull();
      });
    }
  }
});

describe('Block', () => {
  it('shows an error card listing bad props', () => {
    render(<Block type="Quiz" props={{ questions: [{ q: 'x', options: ['a'], answer: 3 }] }} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('questions.0.options');
    expect(alert).toHaveTextContent('answer must be an index into options');
  });
  it('shows an error card for unknown types', () => {
    render(<Block type="Nope" props={{}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unknown block "Nope"');
  });
});

describe('boards', () => {
  it('go-slices is valid', () => {
    expect(validateBoard(goSlices)).toEqual([]);
  });
});

describe('results loop', () => {
  it('Quiz posts graded items to /api/results/<board>/<id>', async () => {
    const posts: { url: string; body: any }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          posts.push({ url, body: JSON.parse(init.body as string) });
          return new Response(JSON.stringify({ board: 't', updatedAt: '', blocks: {} }));
        }
        return new Response('');
      }),
    );
    const board: BoardDef = {
      slug: 't',
      subject: 'T',
      title: 'T',
      blocks: [{ type: 'Quiz', id: 'check', props: { timeLimit: 0, questions: [{ q: 'Two?', options: ['1', '2'], answer: 1 }, { q: 'One?', options: ['1', '2'], answer: 0 }] } }],
    };
    const user = userEvent.setup();
    render(<BoardView board={board} />);
    await user.click(await screen.findByText('Start quiz'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('2'));
    await act(() => user.click(screen.getByText('Finish')));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].url).toBe('/api/results/t/check');
    expect(posts[0].body.type).toBe('Quiz');
    expect(posts[0].body.attempt).toMatchObject({
      score: 1,
      total: 2,
      items: [
        { prompt: 'Two?', answer: '2', expected: '2', correct: true },
        { prompt: 'One?', answer: '2', expected: '1', correct: false },
      ],
    });
    expect(screen.getByText('1/2')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
