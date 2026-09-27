import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const MapNode = named(
  'MapNode',
  z.object({
    id: z.string(),
    label: z.string(),
    x: z.number().min(0).max(100).describe('% from the left'),
    y: z.number().min(0).max(100).describe('% from the top'),
    note: z.string().optional().describe('Shown when selected'),
  }),
);
export const MapLink = named('MapLink', z.object({ from: z.string().describe('Node id'), to: z.string().describe('Node id'), label: z.string().optional().describe('Relationship, e.g. "eaten by"') }));

export const conceptMap = defineContract({
  type: 'ConceptMap',
  category: 'visual',
  tone: 'teal',
  pill: 'Concept map',
  purpose: 'Concepts as nodes joined by labelled links. Click a node to highlight its neighbours and read its note and relationships; drag nodes to rearrange.',
  whenToUse: 'How ideas relate: ecosystems, causes of a war, parts of an architecture, grammar concepts. 5–10 nodes. Lay them out top-to-bottom from general to specific.',
  notes: ['Cards can be as narrow as ~460px: keep nodes on the same row at least ~25% apart in x and rows ~25% apart in y, at most 3–4 nodes per row, and short labels, so link labels stay visible.'],
  schema: z
    .object({
      title: z.string().default(''),
      nodes: z.array(MapNode).min(2),
      links: z.array(MapLink).default([]),
      height: z.number().int().min(240).default(420).describe('Map height in px'),
    })
    .refine((p) => p.links.every((l) => p.nodes.some((n) => n.id === l.from) && p.nodes.some((n) => n.id === l.to)), { message: 'every link from/to must be a node id', path: ['links'] }),
  snippet: {
    title: 'How an ecosystem fits together',
    nodes: [{ id: 'sun', label: 'Sunlight', x: 20, y: 20 }, { id: 'plant', label: 'Producers', x: 50, y: 50, note: 'Make food from light.' }, { id: 'herb', label: 'Herbivores', x: 80, y: 80 }],
    links: [{ from: 'sun', to: 'plant', label: 'powers' }, { from: 'plant', to: 'herb', label: 'eaten by' }],
  },
  examples: {
    demo: {
      note: 'Seven concepts',
      props: {
        title: 'How an ecosystem fits together',
        nodes: [
          { id: 'eco', label: 'Ecosystem', x: 50, y: 14, note: 'All the living things in an area plus their physical environment.' },
          { id: 'prod', label: 'Producers', x: 18, y: 45, note: 'Make their own food from sunlight: plants, algae.' },
          { id: 'cons', label: 'Consumers', x: 50, y: 50, note: 'Get energy by eating other organisms.' },
          { id: 'dec', label: 'Decomposers', x: 82, y: 45, note: 'Break down dead matter and return nutrients to the soil.' },
          { id: 'sun', label: 'Sunlight', x: 14, y: 84 },
          { id: 'nut', label: 'Soil nutrients', x: 70, y: 84 },
          { id: 'herb', label: 'Herbivores', x: 40, y: 80 },
        ],
        links: [
          { from: 'eco', to: 'prod', label: 'includes' },
          { from: 'eco', to: 'cons', label: 'includes' },
          { from: 'eco', to: 'dec', label: 'includes' },
          { from: 'sun', to: 'prod', label: 'powers' },
          { from: 'prod', to: 'herb', label: 'eaten by' },
          { from: 'herb', to: 'cons', label: 'are' },
          { from: 'dec', to: 'nut', label: 'release' },
          { from: 'nut', to: 'prod', label: 'feed' },
        ],
      },
      wide: true,
    },
  },
});
