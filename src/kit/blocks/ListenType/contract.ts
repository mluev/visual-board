import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Phrase = named(
  'Phrase',
  z.object({
    text: z.string().describe('What is spoken'),
    lang: z.string().optional().describe('BCP-47 code, e.g. "fr-FR", "es-ES", "en-GB". Defaults to the block lang'),
    translation: z.string().optional().describe('Meaning or note shown after answering'),
  }),
);

export const listenType = defineContract({
  type: 'ListenType',
  category: 'practice',
  tone: 'gold',
  pill: 'Listen',
  purpose: 'Dictation and speaking practice with the browser’s speech voices. "Listen & type": hear a phrase (normal or slow) and type it. "Say it": read it aloud and the browser checks what it heard (where speech recognition exists).',
  whenToUse: 'Language learning: listening comprehension, spelling, pronunciation. 3–8 short phrases.',
  results: 'When the set is finished: an attempt with items[{prompt: phrase, answer: typed or heard text, expected: phrase, correct}], meta.mode ("listen" | "speak").',
  notes: ['Enter checks, then Enter again goes to the next phrase. Speech quality depends on the voices installed in the browser.'],
  schema: z.object({
    title: z.string().default(''),
    items: z.array(Phrase).min(1),
    lang: z.string().default('en-GB').describe('Default BCP-47 language for items'),
  }),
  snippet: { title: 'Everyday French', lang: 'fr-FR', items: [{ text: 'Où est la gare ?', translation: 'Where is the station?' }, { text: 'Je voudrais un café, s’il vous plaît.' }] },
  examples: {
    demo: {
      note: 'English phrases',
      props: {
        title: 'Everyday phrases',
        items: [
          { text: 'Where is the train station?', translation: 'Asking for directions' },
          { text: 'I would like a coffee, please.' },
          { text: 'It depends on the weather.', translation: '"depends on", not "depends of"' },
        ],
      },
    },
    french: { note: 'lang: "fr-FR"', props: { title: 'Le passé composé à l’oral', lang: 'fr-FR', items: [{ text: 'J’ai mangé une pomme.', translation: 'I ate an apple.' }, { text: 'Nous avons fini nos devoirs.', translation: 'We finished our homework.' }] } },
  },
});
