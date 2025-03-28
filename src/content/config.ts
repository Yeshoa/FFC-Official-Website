/* import { defineCollection, z } from 'astro:content';

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

const forestCupCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    host: z.string(),
    image: z.string().url(),
    year: z.number(),
    participants: z.array(z.string()),
    matches: z.array(
      z.object({
        match_id: z.number(),
        stage: z.string(),
        team1: z.string(),
        team2: z.string(),
        score: z.object({
          team1_goals: z.number(),
          team2_goals: z.number(),
        }),
        goals: z.array(
          z.object({
            team: z.string(),
            player: z.string(),
            minute: z.number(),
          })
        ),
      })
    )
  }),
}); 

export const collections = {
  'tournaments': tournamentsCollection,
  'forest-cup': forestCupCollection
};*/