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
    match_id: z.number().optional(),
    // Tournament structure
    stage: z.string().optional(), // Group Stage, Knockout Stage, etc.
    group: z.string().optional(), // Referencia al grupo
    fixture: z.string(), // Fixture del partido (ej: "MatchDay 1" o "Semi-Final")
    round: z.number().optional(),
    leg: z.enum(["1", "2", "single"]).default("single"), // 1, 2 o single
    // Teams
    team1: z.string(),
    team2: z.string(),
    stadium_id: z.number().optional(),
    neutralVenue: z.boolean().default(true),
    // Status and date
    status: z.enum(["scheduled", "played", "canceled"]).default("scheduled"),
    date: z.date(),

    attendance: z.number().optional(),
    // weather: z.string().optional(),
    // temperature: z.number().optional(), //
    // referee: z.string().optional(),
    // assistantReferees: z.array(z.string()).optional(), // 
    // fourthOfficial: z.string().optional(), // 
    // var: z.boolean().default(false), // 

    // Match info
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
        aggregate: z.number().optional(),
        type: z.enum(["yellow", "red", "second-yellow"]),
      })
    ).optional(),

    substitutions: z.array(
      z.object({
        team: z.string(),
        playerOut: z.string(),
        playerIn: z.string(),
        minute: z.number(),
        aggregate: z.number().optional(),
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
            captain: z.boolean().default(false),
            starter: z.boolean().default(true), 
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
            captain: z.boolean().default(false),
            starter: z.boolean().default(true), 
          }).passthrough()
        ).optional(),
      }).optional(),
    }).optional().describe("Lineups by team"),

    stats: z.object({
      possession: z.object({ team1: z.number(), team2: z.number() }).optional(),
      shots: z.object({ team1: z.number(), team2: z.number() }).optional(),
      shotsOnTarget: z.object({ team1: z.number(), team2: z.number() }).optional(),
      corners: z.object({ team1: z.number(), team2: z.number() }).optional(),
      fouls: z.object({ team1: z.number(), team2: z.number() }).optional(),
      offsides: z.object({ team1: z.number(), team2: z.number() }).optional(),
    }).optional(),

    // Media and links
    link: z.string().url().optional(), // Enlace al video del partido
  }),
});

const membersCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // General
    id: z.number(),
    code: z.string().optional(),
    name: z.string(),
    // Images
    flagPath: image().optional(),
    logoPath: image().optional(),
    // Info
    federation: z.string().optional(),
    region: z.string(),
    founded: z.number().optional(),
    affiliation: z.number().optional(),
    // Status
    verified: z.boolean().default(false),
    founder: z.boolean().default(false),

    // Links
    nslink: z.string().url(),
    feddispatch: z.string().url().optional(),

    score: z
        .object({
          // 1️⃣ ROLEPLAY CATEGORY - ESTRUCTURA DINÁMICA POR TOURNAMENT ID
          rp: z
            .record(
              z.string(), // Tournament ID como string (ej: "2", "3", "4")
              z.record(
                z.string(), // RP name (dinámico: "updated roster", "menciones en dispatches actualizadas", etc.) or Host/Extra
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic roleplay by tournament ID: { tournamentId: { history: points } }"),

          // 2️⃣ EVENTS CATEGORY - ESTRUCTURA DINÁMICA POR TOURNAMENT ID
          events: z
            .record(
              z.string(), // Tournament ID como string (ej: "2", "3", "4")
              z.record(
                z.string(), // Event name (dinámico: "poetry", "quiz", "memories", etc.) or Host/Extra
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic events by tournament ID: { tournamentId: { eventName: points } }"),

          // 3️⃣ BONUS - ESTRUCTURA DINÁMICA POR TOURNAMENT ID (igual que events)
          bonus: z
            .record(
              z.string(), // Tournament ID como string
              z.record(
                z.string(), // Bonus name (ej: "host", "extra", etc.)
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic bonus by tournament ID: { tournamentId: { bonusName: points } }"),
        })
        .default({
          rp: {},
          events: {},
          bonus: {},
        }),

    additionalPoints: z.number().optional().default(0),

    tierHistory: z.array(
      z.object({
        tier: z.string(),
        edition: z.number(),
      })
    ).optional(),
    
    squad: z.object({
      coach: z.string().optional().describe("Head coach name"),
      formation: z.string().optional().describe("Preferred team formation, e.g. 4-3-3"),
      captain: z.string().optional(),
      players: z.array(
        z.object({
          number: z.number().describe("Jersey number"),
          name: z.string().describe("Player name"),
          position: z.string().describe("Position on the field"),
          age: z.number().optional(),

        }).passthrough() 
      ).optional().describe("List of squad members"),
    }).optional().describe("Squad configuration"),
    manualAchievements: z.array(z.string()).optional(),
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
    status: z.enum(["draft", "published", "archived", "featured"]).default("published"),
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

const stadiumsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.number(),
    name: z.string(),
    city: z.string(),
    nation: z.string(),
    capacity: z.number().optional(),
    opened: z.number().optional(), // Year founded
    image: image().optional(),
    // surface: z.enum(['grass', 'artificial', 'hybrid']).optional(),
    // coordinates: z.object({
    //   lat: z.number(),
    //   lng: z.number(),
    // }).optional(),
    description: z.string().optional(),
    // nickname: z.string().optional(), // Apodo del estadio
    owner: z.string().optional(), // Team owner
    architect: z.string().optional(),
  }),
});

export const collections = {
  'tournaments': tournamentsCollection,
  'matches': matchesCollection,
  'members': membersCollection,
  'articles': articlesCollection,
  'achievements': achievementsCollection,
  'sponsors': sponsorCollection,
  'stadiums': stadiumsCollection
};