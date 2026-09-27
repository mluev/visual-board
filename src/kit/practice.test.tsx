import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardView } from './BoardView';
import type { BlockSpec } from './board';
import { canon, judge } from './lib/grade';

describe('grading', () => {
  it('accepts case, punctuation, accents and small typos', () => {
    expect(judge('Went.', ['went'])).toBe('right');
    expect(judge('cafe', ['café'])).toBe('close');
    expect(judge('Canbera', ['Canberra'])).toBe('close');
    expect(judge('Sydney', ['Canberra'])).toBe('wrong');
    expect(judge('', ['x'])).toBe('wrong');
  });
  it('canon ignores spaces and unifies signs', () => {
    expect(canon('3x − 6 + 4 = 19')).toBe(canon('3x-6+4=19'));
    expect(canon('2x·sin x')).toBe(canon('2x*sinx'));
  });
});

let posts: { url: string; body: any }[];
beforeEach(() => {
  posts = [];
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
});
afterEach(() => vi.unstubAllGlobals());

const board = (block: BlockSpec) => <BoardView board={{ slug: 't', subject: 'T', title: 'T', blocks: [block] }} />;
const attempt = async () => {
  await waitFor(() => expect(posts.some((p) => p.body.attempt)).toBe(true));
  return posts.find((p) => p.body.attempt)!.body.attempt;
};

describe('practice blocks write results', () => {
  it('ShortAnswer: right, almost, and wrong-needs-review', async () => {
    const user = userEvent.setup();
    render(board({ type: 'ShortAnswer', id: 'sa', props: { questions: [{ q: 'go?', answer: 'went' }, { q: 'coffee?', answer: 'café' }, { q: 'big?', answer: 'large' }] } }));
    await user.type(await screen.findByLabelText('go?'), 'went');
    await user.type(screen.getByLabelText('coffee?'), 'cafe');
    await user.type(screen.getByLabelText('big?'), 'huge');
    await act(() => user.click(screen.getByText('Check answers')));
    const a = await attempt();
    expect(a.score).toBe(2);
    expect(a.items[0]).toMatchObject({ answer: 'went', correct: true });
    expect(a.items[1]).toMatchObject({ correct: true, note: 'almost (typo or accents)' });
    expect(a.items[2]).toMatchObject({ answer: 'huge', expected: 'large', correct: false, needsReview: true });
    expect(screen.getByText('Almost — the spelling is "café"')).toBeInTheDocument();
  });

  it('Cloze: items carry the sentence with the blank', async () => {
    const user = userEvent.setup();
    render(board({ type: 'Cloze', id: 'c', props: { text: 'Water is made of [hydrogen] and oxygen. Salt is [sodium] chloride.' } }));
    await user.type(await screen.findByLabelText('Blank 1'), 'hydrogen');
    await user.type(screen.getByLabelText('Blank 2'), 'potassium');
    await act(() => user.click(screen.getByText('Check')));
    const a = await attempt();
    expect(a.items[0]).toMatchObject({ prompt: 'Water is made of ___ and oxygen.', correct: true });
    expect(a.items[1]).toMatchObject({ prompt: 'Salt is ___ chloride.', answer: 'potassium', expected: 'sodium', correct: false });
  });

  it('Test: multi-answer questions need the exact set', async () => {
    const user = userEvent.setup();
    render(board({ type: 'Test', id: 't', props: { questions: [{ q: 'Primes?', options: ['21', '23', '29'], answer: [1, 2] }, { q: 'One?', options: ['one', 'two'], answer: 0 }] } }));
    await user.click(await screen.findByText('23'));
    await user.click(screen.getByText('one'));
    await act(() => user.click(screen.getByText('Submit answers')));
    const a = await attempt();
    expect(a.items[0]).toMatchObject({ answer: ['23'], expected: ['23', '29'], correct: false });
    expect(a.items[1]).toMatchObject({ answer: 'one', correct: true });
    expect(a.score).toBe(1);
  });

  it('WorkedExample: faded mode grades hidden steps', async () => {
    const user = userEvent.setup();
    render(board({ type: 'WorkedExample', id: 'w', props: { initial: 'faded', problem: '2x = 6', steps: [{ work: '2x = 6' }, { work: 'x = 6/2' }, { work: 'x = 3' }, { work: 'check: 2·3 = 6' }] } }));
    await user.type(await screen.findByLabelText('Step 3'), 'x=3');
    await user.type(screen.getByLabelText('Step 4'), 'check 6');
    await act(() => user.click(screen.getByText('Check steps')));
    const a = await attempt();
    expect(a.meta.mode).toBe('faded');
    expect(a.items).toEqual([
      expect.objectContaining({ prompt: 'Step 3 of: 2x = 6', correct: true }),
      expect.objectContaining({ prompt: 'Step 4 of: 2x = 6', correct: false, needsReview: true }),
    ]);
  });

  it('ExplainBack: sends the text and key points for review', async () => {
    const user = userEvent.setup();
    render(board({ type: 'ExplainBack', id: 'e', props: { prompt: 'Why seasons?', keyPoints: [{ point: 'Axis tilt', keywords: ['tilt'] }, 'Not distance'] } }));
    await user.type(await screen.findByLabelText('Your explanation'), 'Because of the tilt.');
    await user.click(screen.getByText('Compare with key points'));
    await act(() => user.click(screen.getByText('Send to tutor')));
    const a = await attempt();
    expect(a.score).toBe(1);
    expect(a.items[0]).toMatchObject({ prompt: 'Why seasons?', answer: 'Because of the tilt.', needsReview: true });
    expect(a.items[1]).toMatchObject({ prompt: 'Key point: Axis tilt', answer: 'ticked' });
    expect(a.items[2]).toMatchObject({ prompt: 'Key point: Not distance', answer: 'not ticked' });
  });
});
