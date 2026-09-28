import { defineBoard } from '@kit';

export default defineBoard({
  slug: 'wwi-causes',
  subject: 'History',
  lesson: 'Lesson 1',
  title: 'Why the First World War began',
  blurb: 'Long-term causes, the July Crisis, and how one assassination pulled in the great powers.',
  meta: ['~25 min', 'GCSE'],
  blocks: [
    {
      type: 'Explainer',
      id: 'main',
      props: {
        label: 'Big idea',
        title: 'A spark in a room full of gunpowder',
        body: 'Historians often group the long-term causes as **MAIN**: Militarism, Alliances, Imperialism and Nationalism. None of them made war certain, but together they made Europe very unstable.\n\nThe spark was the assassination of Archduke Franz Ferdinand in Sarajevo on 28 June 1914. The alliance system then turned a regional crisis into a continental war in about five weeks.',
        points: [
          '**Militarism**: arms races, especially the Anglo-German naval race, and detailed war plans.',
          '**Alliances**: the Triple Entente and the Triple Alliance meant a local war could drag in the great powers.',
          '**Imperialism**: rivalry over colonies and influence, for example in Africa and the Balkans.',
          '**Nationalism**: pride and resentment, such as Serbian nationalism against Austria-Hungary.',
        ],
      },
    },
    {
      type: 'Timeline',
      id: 'july-crisis',
      props: {
        title: 'From Sarajevo to world war',
        events: [
          { date: '28 June 1914', title: 'Assassination in Sarajevo', body: 'Gavrilo Princip, a Bosnian Serb nationalist, shoots Archduke Franz Ferdinand, heir to the Austro-Hungarian throne.' },
          { date: '23 July 1914', title: 'Ultimatum to Serbia', body: 'Austria-Hungary, backed by Germany, sends Serbia demands it expects Serbia to refuse.' },
          { date: '28 July 1914', title: 'Austria-Hungary declares war on Serbia', body: 'Exactly one month after the assassination.' },
          { date: '1 August 1914', title: 'Germany declares war on Russia', body: 'Russia had begun mobilising to support Serbia.' },
          { date: '4 August 1914', title: 'Britain declares war on Germany', body: 'Germany invades Belgium to reach France under the Schlieffen Plan. Britain had guaranteed Belgian neutrality in 1839.' },
          { date: '11 November 1918', title: 'Armistice', body: 'Fighting ends on the Western Front at 11 a.m.' },
        ],
      },
    },
    {
      type: 'ConceptMap',
      id: 'alliances',
      span: 'full',
      props: {
        title: 'How the alliances pulled everyone in',
        height: 440,
        nodes: [
          { id: 'sar', label: 'Sarajevo, 28 June', x: 50, y: 8, note: 'The assassination of Franz Ferdinand.' },
          { id: 'ah', label: 'Austria-Hungary', x: 22, y: 34, note: 'Blamed Serbia and wanted to crush Serbian nationalism.' },
          { id: 'ser', label: 'Serbia', x: 78, y: 34, note: 'Small Balkan state, protected by Russia.' },
          { id: 'ger', label: 'Germany', x: 14, y: 62, note: 'Gave Austria-Hungary a "blank cheque" of support.' },
          { id: 'rus', label: 'Russia', x: 86, y: 62, note: 'Saw itself as protector of Slavic peoples; mobilised for Serbia.' },
          { id: 'bel', label: 'Belgium', x: 30, y: 90, note: 'Neutral. Invaded by Germany on the way to France.' },
          { id: 'fra', label: 'France', x: 70, y: 90, note: 'Allied to Russia.' },
          { id: 'gb', label: 'Britain', x: 50, y: 62, note: 'Entered the war after Germany invaded Belgium.' },
        ],
        links: [
          { from: 'sar', to: 'ah', label: 'provokes' },
          { from: 'ah', to: 'ser', label: 'attacks' },
          { from: 'ger', to: 'ah', label: 'backs' },
          { from: 'rus', to: 'ser', label: 'protects' },
          { from: 'rus', to: 'fra', label: 'allied with' },
          { from: 'ger', to: 'bel', label: 'invades' },
          { from: 'gb', to: 'bel', label: 'guarantees' },
        ],
      },
    },
    {
      type: 'CompareTable',
      id: 'sides',
      props: {
        title: 'The two alliances in 1914',
        columns: ['Triple Entente', 'Triple Alliance'],
        rows: [
          { label: 'Members', values: ['Britain, France, Russia', 'Germany, Austria-Hungary, Italy'] },
          { label: 'Formed', values: ['1907 (building on 1894 and 1904 agreements)', '1882'] },
          { label: 'In the war', values: ['Became the Allies', 'Italy stayed out, then joined the Allies in 1915'] },
        ],
        note: 'Turn on Quiz me and try to recall each cell before tapping it.',
      },
    },
    {
      type: 'SortBuckets',
      id: 'sort-main',
      props: {
        title: 'Which long-term cause?',
        categories: ['Militarism', 'Alliances', 'Imperialism', 'Nationalism'],
        items: [
          { text: 'Anglo-German naval race', cat: 0, why: 'Building battleships (Dreadnoughts) is an arms race.' },
          { text: 'Schlieffen Plan', cat: 0, why: 'A detailed military plan made in peacetime.' },
          { text: 'Entente Cordiale (1904)', cat: 1 },
          { text: 'Treaty guaranteeing Belgian neutrality', cat: 1, why: 'A treaty obligation between states — part of the alliance web.' },
          { text: 'Scramble for Africa', cat: 2 },
          { text: 'Rivalry over Morocco', cat: 2, why: 'A clash over colonial influence between France and Germany.' },
          { text: 'Serbian nationalism', cat: 3 },
          { text: 'Pan-Slavism', cat: 3, why: 'The idea that Slavic peoples belong together — a nationalist movement.' },
        ],
      },
    },
    {
      type: 'OrderSteps',
      id: 'order-crisis',
      props: {
        title: 'Put the July Crisis in order',
        items: ['Franz Ferdinand is assassinated', 'Austria-Hungary sends an ultimatum to Serbia', 'Austria-Hungary declares war on Serbia', 'Germany declares war on Russia', 'Germany invades Belgium', 'Britain declares war on Germany'],
        explain: 'Each step triggered the next through alliances and war plans: a local conflict became a European war in five weeks.',
      },
    },
    {
      type: 'ExplainBack',
      id: 'explain',
      props: {
        prompt: 'Explain how an assassination in Sarajevo turned into a war between the great powers.',
        keyPoints: [
          { point: 'Austria-Hungary blamed Serbia and declared war on it', keywords: ['serbia', 'austria'] },
          { point: 'Russia supported Serbia and mobilised', keywords: ['russia', 'mobilis', 'mobiliz'] },
          { point: 'Germany backed Austria-Hungary and declared war on Russia and France', keywords: ['germany', 'blank cheque'] },
          { point: 'The invasion of Belgium brought Britain into the war', keywords: ['belgium', 'britain'] },
        ],
      },
    },
    {
      type: 'Flashcards',
      id: 'cards',
      props: {
        title: 'Key terms',
        cards: [
          { front: 'MAIN', hint: 'Long-term causes', back: 'Militarism, Alliances, Imperialism, Nationalism.' },
          { front: 'Blank cheque', hint: 'July 1914', back: 'Germany’s promise of unconditional support to Austria-Hungary.' },
          { front: 'Schlieffen Plan', hint: 'German war plan', back: 'Defeat France quickly through Belgium, then turn to fight Russia.' },
          { front: 'Triple Entente', hint: 'Alliance', back: 'Britain, France and Russia.' },
          { front: 'Gavrilo Princip', hint: 'Sarajevo, 1914', back: 'The Bosnian Serb who shot Archduke Franz Ferdinand.' },
        ],
      },
    },
    {
      type: 'Quiz',
      id: 'check',
      props: {
        title: 'Causes of the war: check-in',
        timeLimit: 120,
        questions: [
          { q: 'Why did Britain declare war on Germany on 4 August 1914?', options: ['Germany attacked British colonies', 'Germany invaded neutral Belgium', 'Austria-Hungary attacked Serbia', 'Russia asked Britain to'], answer: 1, explain: 'Britain had guaranteed Belgian neutrality in 1839. The German invasion of Belgium brought Britain in.' },
          { q: 'Which country was in the Triple Alliance but did not fight with Germany in 1914?', options: ['Austria-Hungary', 'Italy', 'Russia', 'France'], answer: 1, explain: 'Italy stayed neutral in 1914 and joined the Allies in 1915.' },
          { q: 'The Anglo-German naval race is an example of…', options: ['Militarism', 'Alliances', 'Imperialism', 'Nationalism'], answer: 0, explain: 'An arms race is militarism: building up military power and seeing war as a solution.' },
          { q: 'What was the "blank cheque"?', options: ['A British loan to France', 'German support for Austria-Hungary', 'A Serbian bribe', 'Russian war funding'], answer: 1, explain: 'Germany promised to back Austria-Hungary whatever it did against Serbia, which encouraged a hard line.' },
        ],
      },
    },
  ],
});
