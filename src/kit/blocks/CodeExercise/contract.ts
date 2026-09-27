import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const CodeTest = named(
  'CodeTest',
  z.object({
    call: z.string().describe('An expression, e.g. \'isPalindrome("racecar")\''),
    expect: z.unknown().describe('Expected return value (compared as JSON)'),
  }),
);

export const codeExercise = defineContract({
  type: 'CodeExercise',
  category: 'practice',
  tone: 'gold',
  pill: 'Code',
  purpose: 'A coding task with a real editor (syntax highlighting for any common language), hints revealed one at a time, and a solution. JavaScript runs against tests in the browser; other languages are write → send to tutor → compare with the solution.',
  whenToUse: 'Practising code: write a function, fix a bug, finish a snippet. Give JavaScript tests whenever the language is JS.',
  results: 'progress = current code. JS: each "Run tests" adds an attempt with items[{prompt: call, answer: got, expected, correct}] and meta.code. Other languages: "Send to tutor" adds an attempt with items[{prompt: task, answer: code, expected: solution, needsReview: true}].',
  notes: ['⌘/Ctrl + Enter runs the tests.'],
  schema: z.object({
    title: z.string().default(''),
    language: z.string().default('javascript').describe('javascript, typescript, python, go, rust, sql, java, c, cpp…'),
    task: z.string().describe('What to write. Supports `code` and **bold**'),
    starter: z.string().default('').describe('Starting code in the editor'),
    tests: z.array(CodeTest).default([]).describe('Only run for JavaScript'),
    hints: z.array(z.string()).default([]).describe('Revealed one at a time'),
    solution: z.string().optional().describe('Hidden until the learner asks'),
  }),
  snippet: {
    title: 'Palindrome check',
    task: 'Write `isPalindrome(s)`, ignoring case and non-letters.',
    starter: 'function isPalindrome(s) {\n  // your code\n}\n',
    tests: [{ call: 'isPalindrome("racecar")', expect: true }, { call: 'isPalindrome("hello")', expect: false }],
    hints: ['Lower-case it and drop anything that isn’t [a-z0-9].'],
    solution: 'function isPalindrome(s) {\n  const t = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return t === [...t].reverse().join("");\n}',
  },
  examples: {
    demo: {
      note: 'JavaScript with tests',
      props: {
        title: 'Palindrome check',
        task: 'Write `isPalindrome(s)`. It returns true if `s` reads the same forwards and backwards, ignoring case and anything that isn’t a letter or digit.',
        starter: 'function isPalindrome(s) {\n  // your code\n}\n',
        tests: [
          { call: 'isPalindrome("racecar")', expect: true },
          { call: 'isPalindrome("Was it a car or a cat I saw?")', expect: true },
          { call: 'isPalindrome("hello")', expect: false },
          { call: 'isPalindrome("")', expect: true },
        ],
        hints: ['First clean the string: lowercase it and drop characters that don’t match /[a-z0-9]/.', 'Compare the cleaned string with its reverse: [...t].reverse().join("").'],
        solution: 'function isPalindrome(s) {\n  const t = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return t === [...t].reverse().join("");\n}',
      },
      wide: true,
    },
    go: {
      note: 'language: "go" (send to tutor)',
      props: {
        title: 'Reverse a slice in place',
        language: 'go',
        task: 'Write `reverse(s []int)` that reverses `s` in place without allocating a new slice.',
        starter: 'func reverse(s []int) {\n\t// your code\n}\n',
        hints: ['Use two indexes, one from each end, and swap until they meet.'],
        solution: 'func reverse(s []int) {\n\tfor i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {\n\t\ts[i], s[j] = s[j], s[i]\n\t}\n}',
      },
      wide: true,
    },
  },
});
