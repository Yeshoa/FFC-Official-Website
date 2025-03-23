import { defineCollection, z } from 'astro:content';

import { glob, file } from 'astro/loaders';

const tournamentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    image: z.string(),
    year: z.number(),
    winner: z.string(),
    runner_up: z.string(),
    top_scorer: z.string().optional(),
  }),
});

export const collections = {
  'tournaments': tournamentsCollection,
};