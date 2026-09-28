import { defineBoard } from '@kit';

const caps = (n: number) => {
  const out: number[] = [];
  let c = 0;
  for (let i = 1; i <= n; i++) if (i > c) out.push((c = c ? c * 2 : 1));
  return out;
};

export default defineBoard({
  slug: 'go-slices',
  subject: 'Go',
  lesson: 'Lesson 3',
  title: 'Slices, from the inside',
  blurb: 'len, cap, append and shared backing arrays.',
  meta: ['~15 min', 'Beginner'],
  lang: 'go',
  blocks: [
    {
      type: 'Explainer',
      id: 'what-is-a-slice',
      props: {
        title: 'What a slice really is',
        body: 'A slice is a small header that points into an underlying array. It stores three things: a pointer, a length and a capacity.\n\nSlicing never copies data. Two slices can share the same array, so writing through one is visible through the other.',
        code: 'a := [5]int{1, 2, 3, 4, 5}\ns := a[1:3]   // [2 3], len 2, cap 4',
        points: ['`len(s)` is how many elements you can read.', '`cap(s)` is how far the slice can grow before append reallocates.', 'append returns a new header — always reassign: `s = append(s, x)`.'],
      },
    },
    {
      type: 'BarChart',
      id: 'append-growth',
      props: {
        title: 'Why append is cheap on average',
        param: { name: 'appends', min: 1, max: 64, value: 20 },
        data: (n) => caps(n).map((c, i) => ({ label: `#${i + 1}`, value: c })),
        note: (n, d) => `${n} appends needed only ${d.length} allocations. Capacity doubles each time, so the total copying stays proportional to n.`,
        highlight: -1,
      },
    },
    {
      type: 'Flashcards',
      id: 'vocab',
      props: {
        title: 'Slice vocabulary',
        cards: [
          { front: 'len(s)', hint: 'Go · slices', back: 'Number of elements the slice currently holds.', example: 'len([]int{1,2,3}) == 3' },
          { front: 'cap(s)', hint: 'Go · slices', back: 'Elements available in the backing array from the slice’s start.', example: 's := make([]int, 2, 8) // cap 8' },
          { front: 's[low:high]', hint: 'Go · slicing', back: 'A new slice over the same array, from low up to (not including) high.', example: 'No data is copied.' },
          { front: 'copy(dst, src)', hint: 'Go · built-in', back: 'Copies min(len(dst), len(src)) elements and returns the count.', example: 'Use it to break sharing between slices.' },
        ],
      },
    },
    {
      type: 'Quiz',
      id: 'check',
      props: {
        title: 'Slices check-in',
        timeLimit: 120,
        questions: [
          { q: 'What is len(s) and cap(s)?', code: 'a := [6]int{}\ns := a[2:4]', options: ['2 and 2', '2 and 4', '4 and 6', '2 and 6'], answer: 1, explain: 'len = 4 − 2 = 2. cap counts from index 2 to the end of a: 6 − 2 = 4.' },
          { q: 'Why must you write `s = append(s, x)`?', options: ['append is lazy', 'append may return a slice with a new backing array', 'append sorts the slice', 'It’s only a style rule'], answer: 1, explain: 'When cap is exceeded, append allocates a bigger array and returns a new header pointing to it.' },
          { q: 'What prints?', code: 'a := []int{1, 2, 3}\nb := a[:2]\nb[0] = 9\nfmt.Println(a[0])', options: ['1', '9', '0', 'panic'], answer: 1, explain: 'b shares a’s backing array, so writing b[0] changes a[0].' },
          { q: 'The zero value of a slice is…', options: ['[]int{}', 'nil', 'a panic', 'undefined'], answer: 1, explain: 'A nil slice has len 0 and cap 0 and is safe to append to.' },
        ],
      },
    },
    {
      type: 'Whiteboard',
      id: 'sketch',
      span: 'full',
      props: {
        title: 'Sketch it',
        prompt: '`a := [4]int{1,2,3,4}; s := a[1:3]; s = append(s, 9)`. Draw `a`, `s` and their shared memory. What is `a[3]` now?',
        height: 380,
      },
    },
  ],
});
