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

  it('Matching: records first-try correctness per pair', async () => {
    const user = userEvent.setup();
    render(board({ type: 'Matching', id: 'm', props: { pairs: [{ left: 'dog', right: 'chien' }, { left: 'cat', right: 'chat' }] } }));
    await user.click(await screen.findByText('dog'));
    await user.click(screen.getByText('chat'));
    await user.click(screen.getByText('chien'));
    await user.click(screen.getByText('cat'));
    await act(() => user.click(screen.getByText('chat')));
    const a = await attempt();
    expect(a.score).toBe(1);
    expect(a.items[0]).toMatchObject({ prompt: 'dog', correct: false, note: '1 wrong try' });
    expect(a.items[1]).toMatchObject({ prompt: 'cat', correct: true });
  });

  it('OrderSteps: arrows reorder, check records positions', async () => {
    const user = userEvent.setup();
    render(board({ type: 'OrderSteps', id: 'o', props: { items: ['a', 'b', 'c'] } }));
    const texts = () => [...document.querySelectorAll('ol li')].map((li) => li.textContent!.replace(/[↑↓\d]/g, ''));
    await screen.findByText('Check order');
    // sort to a, b, c using the arrows
    for (let guard = 0; guard < 10 && texts().join() !== 'a,b,c'; guard++) {
      const t = texts();
      const i = t.findIndex((x, k) => k > 0 && x < t[k - 1]);
      await user.click(screen.getAllByLabelText('Move up')[i]);
    }
    expect(texts()).toEqual(['a', 'b', 'c']);
    await act(() => user.click(screen.getByText('Check order')));
    const a = await attempt();
    expect(a.score).toBe(3);
    expect(a.items[0]).toMatchObject({ prompt: 'Position 1', answer: 'a', expected: 'a', correct: true });
  });

  it('SortBuckets: click item then bucket', async () => {
    const user = userEvent.setup();
    render(board({ type: 'SortBuckets', id: 's', props: { categories: ['Fruit', 'Veg'], items: [{ text: 'apple', cat: 0 }, { text: 'leek', cat: 1 }] } }));
    await user.click(await screen.findByText('apple'));
    await user.click(screen.getByText('Veg'));
    await user.click(screen.getByText('leek'));
    await user.click(screen.getByText('Veg'));
    await act(() => user.click(screen.getByText('Check')));
    const a = await attempt();
    expect(a.items).toEqual([expect.objectContaining({ prompt: 'apple', answer: 'Veg', expected: 'Fruit', correct: false }), expect.objectContaining({ prompt: 'leek', correct: true })]);
  });

  it('SpotMistake: found, missed and false positives', async () => {
    const user = userEvent.setup();
    render(board({ type: 'SpotMistake', id: 'sm', props: { mono: false, lines: ['ok one', { text: 'bad one', fix: 'good one' }, { text: 'bad two', fix: 'good two' }] } }));
    await user.click(await screen.findByText('bad one'));
    await user.click(screen.getByText('ok one'));
    await act(() => user.click(screen.getByText('Check')));
    const a = await attempt();
    expect(a.score).toBe(1);
    expect(a.items).toEqual([
      expect.objectContaining({ prompt: 'bad one', answer: 'flagged', correct: true }),
      expect.objectContaining({ prompt: 'bad two', answer: 'missed', correct: false }),
      expect.objectContaining({ prompt: 'ok one', expected: '(line is fine)', correct: false }),
    ]);
  });

  it('LabelDiagram: bank labels fill pins in turn', async () => {
    const user = userEvent.setup();
    render(board({ type: 'LabelDiagram', id: 'l', props: { image: '/x.png', pins: [{ x: 10, y: 10, label: 'Head' }, { x: 50, y: 90, label: 'Foot' }], distractors: ['Hand'] } }));
    await user.click(await screen.findByRole('button', { name: 'Head' }));
    await user.click(screen.getByRole('button', { name: 'Hand' }));
    await act(() => user.click(screen.getByText('Check labels')));
    const a = await attempt();
    expect(a.items).toEqual([expect.objectContaining({ prompt: 'Pin 1', answer: 'Head', correct: true }), expect.objectContaining({ prompt: 'Pin 2', answer: 'Hand', expected: 'Foot', correct: false })]);
  });

  it('ListenType: typed dictation is judged and saved at the end', async () => {
    const user = userEvent.setup();
    render(board({ type: 'ListenType', id: 'lt', props: { items: [{ text: 'Bonjour à tous.' }, { text: 'Merci.' }] } }));
    await user.type(await screen.findByLabelText('What you hear'), 'bonjour a tous{Enter}');
    await user.click(screen.getByText('Next'));
    await user.type(screen.getByLabelText('What you hear'), 'mercy{Enter}');
    await act(() => user.click(screen.getByText('See results')));
    const a = await attempt();
    expect(a.meta.mode).toBe('listen');
    expect(a.items[0]).toMatchObject({ expected: 'Bonjour à tous.', correct: true, note: 'almost (spelling slip)' });
    expect(a.items[1]).toMatchObject({ answer: 'mercy', correct: true });
  });
});

