import { defineCollection, z } from 'astro:content';
import { CATEGORIES, SUBCATEGORIES, ALIGNMENTS } from '@lib/achievements/utils';
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
  schema: ({ image }) => z.object({
    id: z.number(),
    type: z.enum(["forest-cup", "forestian-champions-league"]),
    name: z.string(),
    host: z.string().optional(), // País anfitrión
    final: z.string().optional(), // Sede de la final
    image: image(),
    champion: z.string().optional(),
    banner: image().optional(), // Banner del torneo
    edition: z.number(),
    loadingType: z.enum(["eager", "lazy"]).optional(), // Carga de imágenes
    participants: z.array(z.string()).optional(), // Referencia a members
    heroImg: image().optional(), // Imágen para Tournament Hero
    cardImg: image().optional(), // Imágen para Tournament Card
    prizes: z.object({ // Estructura más detallada para premios
      topScorer: z.array(z.object({ player: z.string(), team: z.string(), goals: z.number() })).optional(),
      bestPlayer: z.object({ player: z.string(), team: z.string() }).optional(),
      bestGoalkeeper: z.object({ player: z.string(), team: z.string() }).optional(),
      bestGoal: z.object({ player: z.string(), team: z.string() }).optional(),
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
        minute: z.number().optional(),
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
        player: z.string().optional(),
        scored: z.boolean(), // true si convirtió
      })
    ).optional(),
    cards: z.array(
      z.object({
        team: z.string(),
        player: z.string().optional(),
        minute: z.number(),
        type: z.enum(["yellow", "red"])
      })
    ).optional(),
    lineup: z.object({
      team1: z.object({
        coach: z.string().optional().describe("Coach for team1"),
        formation: z.string().optional().describe("Team 1 formation"),
        players: z.array(
          z.object({
            number: z.number().describe("Jersey number"),
            name: z.string().describe("Player name"),
            position: z.string().describe("Field position"),
          }).passthrough()
        ).optional(),
      }).optional(),

      team2: z.object({
        coach: z.string().optional().describe("Coach for team2"),
        formation: z.string().optional().describe("Team 2 formation"),
        players: z.array(
          z.object({
            number: z.number().describe("Jersey number"),
            name: z.string().describe("Player name"),
            position: z.string().describe("Field position"),
          }).passthrough()
        ).optional(),
      }).optional(),
    }).optional().describe("Lineups by team"),
  }),
});

const membersCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.number(),
    code: z.string().optional(),
    name: z.string(),
    nslink: z.string().url(),
    flagPath: image().optional(),
    federation: z.string().optional(),
    logoPath: image().optional(),
    feddispatch: z.string().url().optional(),
    region: z.string(),
    founded: z.number().optional(),
    affiliation: z.number().optional(),
    verified: z.boolean().default(false),
    founder: z.boolean().default(false),
    squad: z.object({
      coach: z.string().optional().describe("Head coach name"),
      formation: z.string().optional().describe("Preferred team formation, e.g. 4-3-3"),
      players: z.array(
        z.object({
          number: z.number().describe("Jersey number"),
          name: z.string().describe("Player name"),
          position: z.string().describe("Position on the field"),
        }).passthrough() 
      ).optional().describe("List of squad members"),
    }).optional().describe("Squad configuration"),
    manualAchievements: z.array(z.string()).optional(),
    tierHistory: z.array(
      z.object({
        tier: z.string(),
        edition: z.number(),
      })
    ).optional(),
  }),
});

const articlesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date().default(() => new Date()),
    author: z.string().default('Bolbon'),
    nation: z.string().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
    image: image().default('/src/assets/images/FFC Banner simple.png'),
  }),
});

const achievementsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.string().optional(),
    name: z.string(),
    icon: image(),
    description: z.string(),
    rarity: z.number().int().min(0).default(0),
    stars: z.number().min(0).default(0),
    enabled: z.boolean().default(true),
    category: z.enum([...CATEGORIES]).default("Basic"),
    subcategory: z.enum([...SUBCATEGORIES]).default("Basic"),
    alignment: z.enum([...ALIGNMENTS]).default("Neutral"),
    unique: z.boolean().default(false),
    visible: z.boolean().default(true),
    cardStyle: z.string().optional(),
  }),
});

const sponsorCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    image: image(),
    member: z.string().optional(),
    // class: z.string().optional(),
    backgroundColor: z.string().default('#ffffff'),
    tier: z.enum(['global', 'supplier', 'national']).default('global'),
    description: z.string().optional(),
    type: z.string().optional(),
  }),
});

export const collections = {
  'tournaments': tournamentsCollection,
  'matches': matchesCollection,
  'members': membersCollection,
  'articles': articlesCollection,
  'achievements': achievementsCollection,
  'sponsors': sponsorCollection
};