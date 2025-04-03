import { defineCollection, z } from 'astro:content';

/* const tournamentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    image: z.string(),
    year: z.number(),
    winner: z.string(),
    runner_up: z.string(),
    top_scorer: z.string().optional(),
  }),
}); */

const forestCupCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    host: z.string(),
    image: z.string(),
    banner: z.string(),
    year: z.number(),
    participants: z.array(z.string()), // Referencia a members
    winner: z.string().optional(),
    runner_up: z.string().optional(),
    flags: z.array(z.string()).optional(), // Referencia a las imágenes de banderas de ese año
    stages: z.array(
      z.object({
        type: z.enum(["group", "knockout"]),
        name: z.string(),
        groups: z.array(
          z.object({
            name: z.string(),
            table: z.array(
              z.object({
                position: z.number(),
                team: z.string(),
                wins: z.number(),
                draws: z.number(),
                losses: z.number(),
                goals_for: z.number(),
                goals_against: z.number(),
              })
            ),
          })
        ).optional(),
      })
    ).optional(),
  }),
});

const matchesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    match_id: z.number(),
    tournament_id: z.number(), // Referencia al torneo
    stage: z.string(),
    team1: z.string(),
    team2: z.string(),
    played: z.boolean(),
    score: z.object({
      team1_goals: z.number(),
      team2_goals: z.number(),
      team1_extra_time: z.number().optional(),
      team2_extra_time: z.number().optional(),
      team1_penalty: z.number().optional(),
      team2_penalty: z.number().optional(),
    }).optional(),
    goals: z.array(
      z.object({
        team: z.string(),
        player: z.string(),
        minute: z.number(),
        penalty: z.boolean(),
      })
    ).optional(),
  }),
});

const membersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    nslink: z.string().url(),
    flagPath: z.string(),
    federation: z.string().optional(),
    logoPath: z.string().optional(),
    feddispatch: z.string().url().optional(),
    region: z.string(),
    founded: z.number().optional(),
    affiliation: z.number().optional(),
    verified: z.boolean(),
    score: z.number(),
    records: z.object({
      tournamentsPlayed: z.number(),
      tournamentsWon: z.number(),
      totalPoints: z.number(),
      matches: z.number(),
      wins: z.number(),
      draws: z.number(),
      losses: z.number(),
      goalsFor: z.number(),
      goalsAgainst: z.number(),
    }),
  }),
});

const flagsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    team: z.string(), // Nombre del país
    year: z.number(),
    flagPath: z.string(), // Imagen de la bandera en ese año
  }),
});

export const collections = {
  /* 'tournaments': tournamentsCollection, */
  /* 'forest-cup': forestCupCollection, */
  'matches': matchesCollection,
  'members': membersCollection,
  'flags': flagsCollection,
};