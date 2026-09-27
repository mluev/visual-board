import { defineBoard } from '@kit';

export default defineBoard({
  slug: 'french-passe-compose',
  subject: 'French',
  lesson: 'Lesson 1',
  title: 'The passé composé with avoir',
  blurb: 'How to form French’s everyday past tense, and the one agreement rule that trips everyone up.',
  meta: ['~15 min', 'Beginner'],
  blocks: [
    {
      type: 'Explainer',
      id: 'intro',
      span: 'full',
      props: {
        title: 'What is the passé composé?',
        body:
          "The passé composé is how French talks about completed actions in the past — it's the everyday equivalent of English \"I ate\", \"we saw\", \"they finished\".\n\n" +
          "It's a compound tense: you take the **auxiliary verb** (avoir, in its present tense) and add the **past participle** of the main verb.\n\n" +
          '`j’ai` + `mangé` = `j’ai mangé` — "I ate" / "I have eaten".',
        code: "je   n'ai   pas   mangé\ntu   as         mangé\nil   a          mangé\nnous avons      mangé\nvous avez       mangé\nils  ont        mangé",
        points: [
          "Regular -er verbs → -é: parler → parlé, manger → mangé.",
          "Regular -ir verbs → -i: finir → fini, choisir → choisi.",
          "Regular -re verbs → -u: vendre → vendu, attendre → attendu.",
          'Negation wraps around avoir: `ne` + avoir + `pas` + participle — "je n’ai pas mangé".',
        ],
      },
    },
    {
      type: 'Stats',
      id: 'endings-glance',
      props: {
        label: 'At a glance',
        title: 'Regular participle endings',
        tone: 'blue',
        items: [
          { label: '-ER verbs', value: '-é', note: 'parler → parlé' },
          { label: '-IR verbs', value: '-i', note: 'finir → fini' },
          { label: '-RE verbs', value: '-u', note: 'vendre → vendu' },
          { label: 'Auxiliary', value: 'avoir', note: 'ai, as, a, avons, avez, ont' },
        ],
      },
    },
    {
      type: 'Callout',
      id: 'agreement-rule',
      props: {
        kind: 'key',
        title: 'Past participle agreement with avoir',
        body:
          "With **avoir**, the past participle is normally invariable — it doesn't change for the subject.\n\n" +
          'But it **agrees in gender and number** with a preceding direct object (COD):\n' +
          '- `J’ai mangé la pomme.` — no agreement, the COD comes *after* the verb.\n' +
          '- `La pomme que j’ai mangée.` — `que` refers back to *la pomme* and comes *before* the verb, so `mangée`.\n' +
          '- `Je l’ai vue hier.` — `l’` = *la* (a woman), so `vue`.',
      },
    },
    {
      type: 'Cloze',
      id: 'conjugate-finir',
      props: {
        title: 'Conjugate finir',
        text: 'J’[ai] [fini] mes devoirs. Tu [as] [fini] ton café ? Nous [avons] [fini] le livre. Elles [ont] [fini] à midi.',
      },
    },
    {
      type: 'ShortAnswer',
      id: 'translate',
      props: {
        title: 'Say it in French',
        questions: [
          { q: 'I ate an apple.', answer: ['J’ai mangé une pomme', "J'ai mangé une pomme"], hint: 'manger → mangé', explain: 'avoir (ai) + past participle (mangé).' },
          { q: 'We did our homework.', answer: ['Nous avons fait nos devoirs', 'On a fait nos devoirs'], hint: 'faire is irregular: fait', explain: 'faire → fait. With "on", use the il/elle form: on a fait.' },
          { q: 'She didn’t see the film.', answer: ['Elle n’a pas vu le film', "Elle n'a pas vu le film"], hint: 'ne … pas goes around the auxiliary', explain: 'Negation wraps avoir: n’a pas vu. voir → vu.' },
        ],
      },
    },
    {
      type: 'Flashcards',
      id: 'irregular-participles',
      props: {
        title: 'Irregular past participles',
        cards: [
          { front: 'avoir', hint: 'irregular participle', back: 'eu', example: 'J’ai eu peur. (I was scared.)' },
          { front: 'être', hint: 'irregular participle', back: 'été', example: 'Il a été malade. (He was ill.)' },
          { front: 'faire', hint: 'irregular participle', back: 'fait', example: 'Nous avons fait les courses. (We did the shopping.)' },
          { front: 'prendre', hint: 'irregular participle', back: 'pris', example: 'Tu as pris le train. (You took the train.)' },
          { front: 'mettre', hint: 'irregular participle', back: 'mis', example: 'Elle a mis son manteau. (She put on her coat.)' },
          { front: 'voir', hint: 'irregular participle', back: 'vu', example: 'J’ai vu ce film. (I saw this film.)' },
          { front: 'dire', hint: 'irregular participle', back: 'dit', example: 'Ils ont dit la vérité. (They told the truth.)' },
          { front: 'boire', hint: 'irregular participle', back: 'bu', example: 'Vous avez bu du café. (You drank some coffee.)' },
        ],
      },
    },
    {
      type: 'Quiz',
      id: 'check',
      span: 'full',
      props: {
        title: 'Passé composé check',
        timeLimit: 120,
        questions: [
          {
            q: 'How do you form the passé composé of a regular -er verb like "parler"?',
            options: [
              'avoir (present tense) + parlé',
              'être (present tense) + parlé',
              'avoir (imperfect tense) + parlé',
              'parlé on its own',
            ],
            answer: 0,
            explain:
              'Regular -er verbs replace -er with -é to form the participle, and take avoir as the auxiliary: j’ai parlé.',
          },
          {
            q: 'What is the past participle of "faire"?',
            options: ['faisé', 'fait', 'fais', 'faisu'],
            answer: 1,
            explain: '"Faire" has an irregular past participle: fait — j’ai fait.',
          },
          {
            q: 'Which sentence is correctly negated in the passé composé?',
            options: [
              'Je pas ai mangé.',
              'Je n’ai pas mangé.',
              'Je n’ai mangé pas.',
              'Ne j’ai pas mangé.',
            ],
            answer: 1,
            explain:
              'Negation wraps around the auxiliary, not the participle: ne + avoir + pas + participle → je n’ai pas mangé.',
          },
          {
            q: 'Which of these verbs takes être instead of avoir in the passé composé?',
            options: ['manger', 'aller', 'finir', 'choisir'],
            answer: 1,
            explain:
              '"Aller" is one of the ~14 verbs of movement that take être (je suis allé(e)). Manger, finir and choisir all take avoir.',
          },
          {
            q: 'Complete correctly: "La lettre que j’ai ___."',
            options: ['écrit', 'écris', 'écrite', 'écrites'],
            answer: 2,
            explain:
              '"Que" refers back to "la lettre" (feminine singular) and comes before the verb, so the participle agrees: écrite.',
          },
        ],
      },
    },
  ],
});
