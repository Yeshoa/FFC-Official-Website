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

const tournamentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    type: z.enum(["forest-cup", "forestian-champions-league"]),
    name: z.string(),
    host: z.string().optional(), // País anfitrión
    final: z.string().optional(), // Sede de la final
    image: z.string(),
    banner: z.string().optional(), // Banner del torneo
    edition: z.number(),
    participants: z.array(z.string()), // Referencia a members
    images: z.array(
      z.object({
        src: z.string(),
        type: z.enum(['champion', 'gallery', 'video-thumbnail', 'match', 'other']),
        title: z.string().optional(),
        videoUrl: z.string().url().optional(),
      })
    ).optional(), // Imágenes del torneo
    prizes: z.object({ // Estructura más detallada para premios
      topScorer: z.array(z.object({ player: z.string(), team: z.string(), goals: z.number() })).optional(),
      bestPlayer: z.object({ player: z.string(), team: z.string() }).optional(),
      bestGoalkeeper: z.object({ player: z.string(), team: z.string() }).optional(),
    }).optional(),
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
    date: z.date(),
    link: z.string().url().optional(), // Enlace al video del partido
    goals: z.array(
      z.object({
        team: z.string(),
        player: z.string().optional(),
        minute: z.number(),
        aggregate: z.number().optional(),
        penalty: z.boolean().default(false).optional(),
        ownGoal: z.boolean().default(false).optional(),
        assist: z.string().optional(),
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
    cards: z.array(
      z.object({
        team: z.string(),
        player: z.string(),
        minute: z.number(),
        type: z.enum(["yellow", "red"])
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


export const collections = {
  'tournaments': tournamentsCollection,
  /* 'forest-cup': forestCupCollection, */
  'matches': matchesCollection,
  'members': membersCollection,
};