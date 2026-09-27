import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const QuizQuestion = named(
  'Question',
  z
    .object({
      q: z.string().describe('The question'),
      code: z.string().optional().describe('Code shown under the question'),
      options: z.array(z.string()).min(2).max(8).describe('2–8 choices'),
      answer: z.number().int().min(0).describe('Index of the correct option (0-based)'),
      explain: z.string().optional().describe('Why the answer is right. Shown in the review. Always write it'),
    })
    .refine((q) => q.answer < q.options.length, { message: 'answer must be an index into options', path: ['answer'] }),
);

export const quiz = defineContract({
  type: 'Quiz',
  category: 'assessment',
  tone: 'orange',
  pill: 'Quiz',
  purpose: 'Timed multiple choice, one question at a time. Feedback is held back until the end, then a score and a review of every answer with explanations.',
  whenToUse: 'The "check" step at the end of a board. 3–6 questions. Use Test instead when you want all questions on one page or multi-answer questions.',
  results: 'One attempt per finish: score/total, items[{prompt, answer, expected, correct}], meta.secondsUsed. progress.best = best score.',
  notes: ['Options are labelled A, B, C… Keys: 1–8 or A–H pick, Enter goes next.'],
  schema: z.object({
    title: z.string().default('Quiz').describe('Shown on the intro screen'),
    description: z.string().optional().describe('Intro line. Default: "N questions · m:ss time limit…"'),
    questions: z.array(QuizQuestion).min(1),
    timeLimit: z.number().int().min(0).default(90).describe('Seconds for the whole quiz. 0 = untimed'),
    initial: z.enum(['intro', 'run', 'done']).default('intro').describe('Starting screen (for previews; boards leave it)'),
  }),
  snippet: {
    title: 'Slices check-in',
    timeLimit: 120,
    questions: [
      { q: 'What is len(s) and cap(s)?', code: 'a := [6]int{}\ns := a[2:4]', options: ['2 and 2', '2 and 4', '4 and 6'], answer: 1, explain: 'len = 4 − 2. cap counts from index 2 to the end of a: 6 − 2.' },
    ],
  },
  examples: {
    demo: {
      note: 'Timed, with code',
      props: {
        title: 'Go basics: slices, goroutines, maps',
        questions: [
          { q: 'What does this print?', code: 's := make([]int, 3, 10)\nfmt.Println(len(s))', options: ['0', '3', '10', '13'], answer: 1, explain: 'len is the number of elements (3). The 10 is the capacity, which cap(s) returns.' },
          { q: 'Which keyword starts a goroutine?', options: ['async', 'spawn', 'go', 'defer'], answer: 2, explain: '`go f()` runs f in a new goroutine. defer delays a call until the function returns.' },
          { q: 'What happens on the second line?', code: 'var m map[string]int\nm["a"] = 1', options: ['m becomes {a:1}', 'Compile error', 'Runtime panic', 'Nothing'], answer: 2, explain: 'A nil map can be read (you get zero values), but writing to it panics. Create it with make(map[string]int).' },
        ],
      },
    },
    running: { note: 'initial: "run"', props: { initial: 'run', questions: [{ q: 'Which keyword starts a goroutine?', options: ['async', 'spawn', 'go', 'defer'], answer: 2 }, { q: 'The zero value of a slice is…', options: ['[]int{}', 'nil', 'a panic'], answer: 1 }] } },
    done: {
      note: 'initial: "done" (results + review)',
      props: {
        initial: 'done',
        timeLimit: 0,
        questions: [
          { q: 'Capital of Australia?', options: ['Sydney', 'Canberra', 'Melbourne'], answer: 1, explain: 'Canberra was purpose-built as a compromise between Sydney and Melbourne.' },
          { q: '7 × 8 =', options: ['54', '56', '64'], answer: 1, explain: '7 × 8 = 56. Trick: 5, 6, 7, 8 → 56 = 7 × 8.' },
        ],
      },
    },
  },
});
