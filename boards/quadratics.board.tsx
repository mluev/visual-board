import { defineBoard } from '@kit';

export default defineBoard({
  slug: 'quadratics',
  subject: 'Maths',
  lesson: 'Algebra',
  title: 'Quadratic equations',
  blurb: 'How the parabola works, and three ways to solve ax² + bx + c = 0.',
  meta: ['~15 min', 'Beginner'],
  blocks: [
    {
      type: 'Explainer',
      id: 'intro',
      props: {
        title: 'What a quadratic equation is',
        body:
          'A quadratic is any equation you can write as `ax² + bx + c = 0`, with `a ≠ 0`.\n\n' +
          'Its graph, `y = ax² + bx + c`, is always a **parabola**: a symmetric U-shape (or upside-down U if `a` is negative). ' +
          'Solving the equation just means finding where that curve crosses the x-axis — its **roots**.\n\n' +
          'There can be two roots, one (repeated) root, or none at all, depending on the curve.',
        points: [
          '`a` controls how narrow and which way up the curve is.',
          '`b` shifts the curve sideways (together with `a`).',
          '`c` is the y-intercept — where the curve crosses the y-axis.',
          'The vertex (turning point) sits at `x = −b / (2a)`.',
        ],
      },
    },
    {
      type: 'FunctionPlot',
      id: 'graph',
      span: 'full',
      props: {
        title: 'Drag a, b and c and watch the parabola move',
        params: [
          { name: 'a', min: -3, max: 3, step: 0.5, value: 1 },
          { name: 'b', min: -6, max: 6, step: 0.5, value: -4 },
          { name: 'c', min: -6, max: 6, step: 0.5, value: 3 },
        ],
        fns: [{ name: 'y = ax² + bx + c', f: (x, p) => p.a * x * x + p.b * x + p.c }],
        x: [-6, 6],
        y: [-8, 12],
        formula: (p) => `y = ${p.a}x² + ${p.b}x + ${p.c}`,
        note: (p) => {
          if (p.a === 0) return 'a = 0: this is a straight line, not a parabola.';
          const vx = -p.b / (2 * p.a);
          const vy = p.a * vx * vx + p.b * vx + p.c;
          const disc = p.b * p.b - 4 * p.a * p.c;
          let roots: string;
          if (disc > 0) {
            const r1 = (-p.b + Math.sqrt(disc)) / (2 * p.a);
            const r2 = (-p.b - Math.sqrt(disc)) / (2 * p.a);
            roots = `two real roots: x ≈ ${r1.toFixed(2)} and x ≈ ${r2.toFixed(2)}`;
          } else if (disc === 0) {
            roots = `one repeated root: x = ${(-p.b / (2 * p.a)).toFixed(2)}`;
          } else {
            roots = 'no real roots — the curve stays off the x-axis';
          }
          return `Vertex at (${vx.toFixed(2)}, ${vy.toFixed(2)}); ${roots}.`;
        },
      },
    },
    {
      type: 'Formula',
      id: 'quadratic-formula',
      span: 'full',
      props: {
        title: 'The quadratic formula',
        parts: [
          { t: 'x', name: 'Root(s)', note: 'The value(s) of x where the curve crosses the x-axis.' },
          { t: '=' },
          {
            t: '(−b ± √(b² − 4ac))',
            name: 'Numerator',
            note:
              'b² − 4ac is the discriminant. Positive → two real roots. Zero → one repeated root. Negative → no real roots.',
          },
          { t: '/' },
          { t: '2a', name: 'Denominator', note: 'Twice the coefficient of x².' },
        ],
        calc: {
          vars: [
            { sym: 'a', label: 'a', value: 1 },
            { sym: 'b', label: 'b', value: -4 },
            { sym: 'c', label: 'c', value: 3 },
          ],
          f: (v) => (-v.b + Math.sqrt(v.b * v.b - 4 * v.a * v.c)) / (2 * v.a),
          label: 'x (the + root)',
        },
      },
    },
    {
      type: 'Callout',
      id: 'discriminant-tip',
      props: {
        kind: 'key',
        title: 'Reading the discriminant',
        body:
          'Work out `b² − 4ac` before you solve anything:\n\n' +
          '- Positive — two real roots\n' +
          '- Zero — one repeated root\n' +
          '- Negative — no real roots (the parabola never touches the x-axis)',
      },
    },
    {
      type: 'WorkedExample',
      id: 'solve-by-factoring',
      props: {
        title: 'Solving by factoring',
        problem: 'Solve for x:  x² − 5x + 6 = 0',
        steps: [
          {
            work: '(x − 2)(x − 3) = 0',
            why: 'Find two numbers that multiply to 6 and add to −5: −2 and −3.',
          },
          {
            work: 'x − 2 = 0  or  x − 3 = 0',
            why: 'If a product of two factors is zero, at least one factor must be zero.',
          },
          {
            work: 'x = 2  or  x = 3',
            why: 'Solve each simple equation.',
            accept: ['x=2 or x=3', 'x=3 or x=2'],
          },
        ],
      },
    },
    {
      type: 'ShortAnswer',
      id: 'quick-numbers',
      props: {
        title: 'Read the curve',
        questions: [
          {
            q: 'What is the axis of symmetry of y = x² − 4x + 3?',
            answer: ['x=2', 'x = 2'],
            explain: 'x = −b/(2a) = −(−4)/(2·1) = 2.',
          },
          {
            q: 'How many real roots does y = x² + 4x + 5 have?',
            answer: '0',
            hint: 'Work out the discriminant b² − 4ac first.',
            explain: 'Discriminant = 4² − 4·1·5 = 16 − 20 = −4, which is negative, so there are no real roots.',
          },
          {
            q: 'What is the discriminant of 2x² − 4x + 2 = 0?',
            answer: '0',
            explain: 'b² − 4ac = (−4)² − 4·2·2 = 16 − 16 = 0.',
          },
          {
            q: 'For y = x² − 4x + 3, where does the curve cross the y-axis?',
            answer: ['3', '(0,3)', '(0, 3)'],
            hint: 'Set x = 0.',
            explain: 'y(0) = 0² − 4·0 + 3 = 3, so it crosses at (0, 3).',
          },
        ],
      },
    },
    {
      type: 'Flashcards',
      id: 'vocabulary',
      props: {
        title: 'Quadratic vocabulary',
        cards: [
          {
            front: 'Parabola',
            back: 'The U-shaped curve of a quadratic function y = ax² + bx + c.',
            hint: 'Graph shape',
          },
          {
            front: 'Vertex',
            back: 'The turning point of the parabola, at x = −b / (2a).',
            example: 'For y = x² − 4x + 3, the vertex is at (2, −1).',
          },
          {
            front: 'Axis of symmetry',
            back: 'The vertical line x = −b / (2a) that the parabola is mirror-symmetric about.',
          },
          {
            front: 'Discriminant',
            back: 'b² − 4ac. Its sign tells you how many real roots the equation has.',
            example: 'Positive → 2 roots, zero → 1 root, negative → 0 real roots.',
          },
          {
            front: 'Roots (zeros)',
            back: 'The values of x where the parabola crosses the x-axis — where y = 0.',
          },
          {
            front: 'Standard form',
            back: 'Writing a quadratic as ax² + bx + c, with a ≠ 0.',
          },
        ],
      },
    },
    {
      type: 'Quiz',
      id: 'check',
      span: 'full',
      props: {
        title: 'Quadratics check-in',
        timeLimit: 150,
        questions: [
          {
            q: 'What shape does the graph of a quadratic function make?',
            options: ['A straight line', 'A parabola', 'A circle', 'A wave'],
            answer: 1,
            explain: 'y = ax² + bx + c always graphs as a U-shaped curve called a parabola, since a ≠ 0.',
          },
          {
            q: 'For y = 2x² − 8x + 6, what is the discriminant?',
            options: ['16', '−16', '4', '0'],
            answer: 0,
            explain: 'b² − 4ac = (−8)² − 4·2·6 = 64 − 48 = 16.',
          },
          {
            q: 'A quadratic has discriminant −9. How many real roots does it have?',
            options: ['Two', 'One (repeated)', 'Zero', 'Infinite'],
            answer: 2,
            explain: 'A negative discriminant means the parabola never crosses the x-axis, so there are no real roots.',
          },
          {
            q: 'What is the x-coordinate of the vertex of y = x² − 6x + 5?',
            options: ['3', '−3', '6', '5'],
            answer: 0,
            explain: 'Vertex x = −b / (2a) = −(−6) / (2·1) = 3.',
          },
          {
            q: 'Solve: x² − x − 6 = 0',
            options: ['x = 2 or x = −3', 'x = 3 or x = −2', 'x = 2 or x = 3', 'x = −2 or x = −3'],
            answer: 1,
            explain: 'Factors of −6 that sum to −1 are −3 and 2: (x − 3)(x + 2) = 0, so x = 3 or x = −2.',
          },
        ],
      },
    },
  ],
});
