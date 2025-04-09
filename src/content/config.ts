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
    tournament_id: z.number(), // Referencia al torneo
    stage: z.string().optional(), // Group Stage, Knockout Stage, etc.
    group: z.string().optional(), // Referencia al grupo
    fixture: z.string(), // Fixture del partido (ej: "MatchDay 1" o "Semi-Final")
    team1: z.string(),
    team2: z.string(),
    status: z.enum(["scheduled", "played", "canceled"]).default("scheduled"),
    link: z.string().url().optional(), // Enlace al video del partido
    goals: z.array(
      z.object({
        team: z.string(),
        player: z.string(),
        minute: z.number(),
        aggregate: z.number().optional(),
        penalty: z.boolean(),
      })
    ).optional(),
    penalties: z.array(
      z.object({
        order: z.number(), // Orden de ejecución
        team: z.string(),
        player: z.string(),
        scored: z.boolean(), // true si convirtió
      })
    ).optional(),
  }),
});

const membersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string(),
    nslink: z.string().url(),
    flagPath: z.string().optional(),
    federation: z.string().optional(),
    logoPath: z.string().optional(),
    feddispatch: z.string().url().optional(),
    region: z.string(),
    founded: z.number().optional(),
    affiliation: z.number().optional(),
    verified: z.boolean().default(false),
    score: z.number().default(0),
    additionalPoints: z.number().optional().default(0),
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