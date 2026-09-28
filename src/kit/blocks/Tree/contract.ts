import { z } from 'zod';
import { defineContract } from '@/kit/contract';

export type TreeNodeT = { label: string; note?: string; children?: TreeNodeT[] };
const TreeNode: z.ZodType<TreeNodeT> = z
  .lazy(() =>
    z.object({
      label: z.string(),
      note: z.string().optional(),
      children: z.array(TreeNode).optional(),
    }),
  )
  .meta({ signature: 'TreeNode' });

export const tree = defineContract({
  type: 'Tree',
  category: 'visual',
  tone: 'teal',
  pill: 'Tree',
  purpose: 'A collapsible hierarchy with a details panel: click a branch to open it and read its note and breadcrumb path.',
  whenToUse: 'Taxonomies and hierarchies: tree of life, file systems, org charts, class inheritance, topic outlines, family trees.',
  schema: z.object({
    title: z.string().default(''),
    root: TreeNode.describe('TreeNode = { label: string; note?: string; children?: TreeNode[] }'),
    open: z.array(z.string()).default(['0']).describe('Paths open at start: "0" = root, "0.2" = its third child'),
  }),
  snippet: { title: 'The tree of life', root: { label: 'Life', note: 'All living things.', children: [{ label: 'Bacteria' }, { label: 'Eukarya', children: [{ label: 'Animals' }, { label: 'Plants' }] }] } },
  examples: {
    demo: {
      note: 'Three levels, partly open',
      props: {
        title: 'The tree of life',
        open: ['0', '0.2'],
        root: {
          label: 'Life',
          note: 'Every living thing, sorted by shared ancestry.',
          children: [
            { label: 'Bacteria', note: 'Single cells with no nucleus. They are everywhere, including your gut.', children: [{ label: 'E. coli' }, { label: 'Streptococcus' }] },
            { label: 'Archaea', note: 'No nucleus either, but chemically closer to us than to bacteria. Many live in extreme places.' },
            {
              label: 'Eukarya',
              note: 'Cells with a nucleus.',
              children: [
                { label: 'Animals', note: 'Multicellular organisms that eat other organisms and can usually move.', children: [{ label: 'Mammals', note: 'Hair, and milk for their young.' }, { label: 'Birds' }, { label: 'Insects' }] },
                { label: 'Plants', note: 'Make their own food by photosynthesis. Cell walls are made of cellulose.', children: [{ label: 'Flowering plants' }, { label: 'Ferns' }] },
                { label: 'Fungi', note: 'Absorb food from their surroundings. Cell walls are made of chitin. More closely related to animals than to plants.' },
              ],
            },
          ],
        },
      },
      wide: true,
    },
  },
});
