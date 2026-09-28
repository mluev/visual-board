import { z } from 'zod';
import { defineContract, named } from '@/kit/contract';

export const Spot = named(
  'Spot',
  z.object({
    x: z.number().min(0).max(100).describe('% from the left'),
    y: z.number().min(0).max(100).describe('% from the top'),
    title: z.string(),
    body: z.string().describe('Explanation shown when selected'),
  }),
);

export const hotspots = defineContract({
  type: 'Hotspots',
  category: 'visual',
  tone: 'teal',
  pill: 'Explore',
  purpose: 'Numbered points on an image; tap one (or use the arrows for a guided tour) to read about that part. Tracks how many have been explored.',
  whenToUse: 'Exploring a picture: layers of the Earth, a painting, a machine, a map, anatomy, a UI. 3–8 spots. Use LabelDiagram instead when the learner should name the parts.',
  notes: ['Give `image` (a URL or a file in public/, e.g. "/kit/earth-layers.svg") or a `slotId` for a drop-your-own-image slot.'],
  schema: z.object({
    title: z.string().default(''),
    image: z.string().optional(),
    slotId: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/i).optional(),
    placeholder: z.string().optional(),
    spots: z.array(Spot).min(1),
    aspect: z.string().default('16 / 9'),
  }),
  snippet: { title: 'Layers of the Earth', image: '/kit/earth-layers.svg', spots: [{ x: 35.7, y: 14.2, title: 'Crust', body: 'The thin rocky outer layer.' }, { x: 66.2, y: 86.7, title: 'Inner core', body: 'Solid iron at ~5,400 °C.' }] },
  examples: {
    demo: {
      note: 'Image in public/',
      props: {
        title: 'Layers of the Earth',
        image: '/kit/earth-layers.svg',
        spots: [
          { x: 35.7, y: 14.2, title: 'Crust', body: 'The thin rocky outer layer: 5–70 km thick. All life lives on it.' },
          { x: 43.9, y: 33.8, title: 'Mantle', body: 'Hot, slowly flowing rock about 2,900 km thick. Convection here moves the tectonic plates.' },
          { x: 55.8, y: 61.8, title: 'Outer core', body: 'Liquid iron and nickel. Its flow generates Earth’s magnetic field.' },
          { x: 66.2, y: 86.7, title: 'Inner core', body: 'Solid iron at about 5,400 °C. The pressure is so high it can’t melt.' },
        ],
      },
      wide: true,
    },
  },
});
