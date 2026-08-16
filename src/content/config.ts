import { defineCollection, z } from 'astro:content';
import type { LoaderContext } from 'astro/loaders';
import { CATEGORIES, SUBCATEGORIES, ALIGNMENTS } from '@lib/achievements/utils';
import events from '../data/events.json';
import roleplays from '../data/roleplays.json';
import bonuses from '../data/bonuses.json';
import matches2020 from '../data/matches/forest-cup-2020.json';
import matches2022 from '../data/matches/forest-cup-2022.json';
import matches2024 from '../data/matches/forest-cup-2024.json';
import matches2026 from '../data/matches/forest-cup-2026.json';
import matchesCL2027 from '../data/matches/champions-league-2027.json';
import tournamentsFCData from '../data/tournaments-fc.json';
import tournamentsCLData from '../data/tournaments-cl.json';
import membersData from '../data/members.json';
import achievementsData from '../data/achievements.json';
import sponsorsData from '../data/sponsors.json';
import stadiumsData from '../data/stadiums.json';

// Loader que expone un objeto { [id]: data } como colección de content layer.
// El id del objeto es el entry id (slug); data mantiene su propio campo id si existe.
function objectLoader(name: string, data: Record<string, Record<string, unknown>>) {
  return {
    name,
    load: async ({ store, parseData }: LoaderContext) => {
      store.clear();
      for (const [id, raw] of Object.entries(data)) {
        const parsed = await parseData({ id, data: raw });
        store.set({ id, data: parsed });
      }
    },
  };
}

// Torneos separados por competición: forest cups y champions leagues (decisión del dueño).
const tournamentsData = { ...tournamentsFCData, ...tournamentsCLData };

const tournamentsCollection = defineCollection({
  loader: objectLoader('tournaments', tournamentsData),
  schema: ({ image }) => z.object({
    id: z.number(),
    type: z.enum(["forest-cup", "forestian-champions-league"]),
    name: z.string(),
    shortName: z.string().optional(),
    host: z.string().optional(), // País anfitrión
    hostCode: z.string().optional(),
    hostId: z.number().optional(), // id global del miembro anfitrión
    final: z.string().optional(), // Sede de la final
    image: image(),
    champion: z.string().optional(),
    championCode: z.string().optional(),
    championId: z.number().optional(), // id global del miembro/club campeón
    banner: image().optional(), // Banner del torneo
    edition: z.number(),
    season: z.number(), // Año de la temporada (fuente de verdad para ranking/decay)
    loadingType: z.enum(["eager", "lazy"]).optional(), // Carga de imágenes
    /* participants: z.array(z.string()).optional(), */ // Referencia a members
    pots: z.array(
      z.object({
        pot: z.number(), // Número de bombo (1, 2, 3, 4)
        teams: z.array(z.string()), // Referencias a members (display)
        teamCodes: z.array(z.string()).optional(),
        teamIds: z.array(z.number()).optional(), // ids globales de miembros/clubes
      })
    ).optional(),
    heroImg: image().optional(), // Imágen para Tournament Hero
    cardImg: image().optional(), // Imágen para Tournament Card
    prizes: z.object({ // Estructura más detallada para premios
      topScorer: z.array(z.object({ player: z.string(), team: z.string(), goals: z.number(), teamId: z.number().optional(), playerId: z.number().optional() })).optional(),
      bestPlayer: z.object({ player: z.string(), team: z.string(), teamId: z.number().optional(), playerId: z.number().optional() }).optional(),
      bestGoalkeeper: z.object({ player: z.string(), team: z.string(), teamId: z.number().optional(), playerId: z.number().optional() }).optional(),
      bestGoal: z.object({ player: z.string(), team: z.string(), teamId: z.number().optional(), playerId: z.number().optional() }).optional(),
    }).optional(),
  }),
});

const matchesCollection = defineCollection({
  loader: () =>
    [...matches2020, ...matches2022, ...matches2024, ...matches2026, ...matchesCL2027].map((match, index) => ({
      id: `match-${match.tournament_id}-${match.match_id ?? index + 1}`,
      ...match,
    })),
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
    team1Code: z.string().optional(),
    team2Code: z.string().optional(),
    team1Id: z.number().optional(), // id global de miembro o club (fuente de verdad)
    team2Id: z.number().optional(), // id global de miembro o club (fuente de verdad)
    team1Type: z.enum(["national", "club"]).default("national"),
    team2Type: z.enum(["national", "club"]).default("national"),
    stadium_id: z.number().optional(),
    neutralVenue: z.boolean().default(true),
    // Status and date
    status: z.enum(["scheduled", "played", "canceled"]).default("scheduled"),
    date: z.coerce.date(),

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
        playerId: z.string().optional(),
        player: z.string().optional(),
        minute: z.number().optional(),
        aggregate: z.number().optional(),
        penalty: z.boolean().default(false).optional(),
        ownGoal: z.boolean().default(false).optional(),
        assist: z.string().optional(),
        assistId: z.string().optional(),
      })
    ).optional(),

    penalties: z.array(
      z.object({
        order: z.number(), // Orden de ejecución
        team: z.string(),
        playerId: z.string().optional(),
        player: z.string().optional(),
        scored: z.boolean(), // true si convirtió
      })
    ).optional(),

    cards: z.array(
      z.object({
        team: z.string(),
        playerId: z.string().optional(),
        player: z.string().optional(),
        minute: z.number(),
        aggregate: z.number().optional(),
        type: z.enum(["yellow", "red", "second-yellow"]),
      })
    ).optional(),

    substitutions: z.array(
      z.object({
        team: z.string(),
        playerOutId: z.string().optional(),
        playerOut: z.string(),
        playerInId: z.string().optional(),
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
            playerId: z.string().optional(),
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
            playerId: z.string().optional(),
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
  loader: objectLoader('members', membersData),
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

    // Mercado FCL: si los jugadores de esta federación pueden ser fichados por clubes extranjeros.
    // false = solo clubes de su misma federación pueden ficharlos (default). true = abiertos al mercado externo.
    allowsForeignMarket: z.boolean().default(false),

    // Links
    nslink: z.string().url(),
    feddispatch: z.string().url().optional(),

    score: z
        .object({
          // 1️⃣ ROLEPLAY CATEGORY - ESTRUCTURA DINÁMICA POR SEASON (año, ej: "2024", "2026")
          rp: z
            .record(
              z.string(), // Season como string (ej: "2024", "2026")
              z.record(
                z.string(), // RP name (dinámico: "updated roster", "menciones en dispatches actualizadas", etc.) or Host/Extra
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic roleplay by season: { season: { activity: points } }"),

          // 2️⃣ EVENTS CATEGORY - ESTRUCTURA DINÁMICA POR SEASON (año)
          events: z
            .record(
              z.string(), // Season como string (ej: "2024", "2026")
              z.record(
                z.string(), // Event name (dinámico: "poetry", "quiz", "memories", etc.) or Host/Extra
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic events by season: { season: { eventName: points } }"),

          // 3️⃣ BONUS - ESTRUCTURA DINÁMICA POR SEASON (igual que events)
          bonus: z
            .record(
              z.string(), // Season como string (ej: "2024", "2026")
              z.record(
                z.string(), // Bonus name (ej: "host", "extra", etc.)
                z.number(), // Points earned
              ),
            )
            .default({})
            .describe("Dynamic bonus by season: { season: { bonusName: points } }"),
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
  loader: objectLoader('achievements', achievementsData),
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
  loader: objectLoader('sponsors', sponsorsData),
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
  loader: objectLoader('stadiums', stadiumsData),
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

const eventsCollection = defineCollection({
  loader: () => events,
  schema: z.object({
    id: z.string(),
    enabled: z.boolean().default(true),
    name: z.string(),
    description: z.string().optional(),
    edition: z.number().int(),
    code: z.string(),
    type: z.string(),
    weight: z.number().optional(),
    maxScore: z.number(),
    participants: z.record(z.string(), z.number()),
    link: z.string().optional(),
  }),
});

const roleplaysCollection = defineCollection({
  loader: () => roleplays,
  schema: z.object({
    id: z.string(),
    enabled: z.boolean().default(true),
    name: z.string(),
    description: z.string().optional(),
    edition: z.number().int(),
    code: z.string(),
    type: z.string(),
    weight: z.number().optional(),
    maxScore: z.number(),
    participants: z.record(z.string(), z.number()),
  }),
});

const bonusesCollection = defineCollection({
  loader: () => bonuses,
  schema: z.object({
    id: z.string(),
    enabled: z.boolean().default(true),
    name: z.string(),
    description: z.string().optional(),
    edition: z.number().int(),
    code: z.string(),
    type: z.string(),
    weight: z.number().optional(),
    maxScore: z.union([z.number(), z.string()]).optional(),
    participants: z.record(z.string(), z.number()),
  }),
});

export const collections = {
  'tournaments': tournamentsCollection,
  'matches': matchesCollection,
  'members': membersCollection,
  'articles': articlesCollection,
  'achievements': achievementsCollection,
  'sponsors': sponsorCollection,
  'stadiums': stadiumsCollection,
  'events': eventsCollection,
  'roleplays': roleplaysCollection,
  'bonuses': bonusesCollection,
};
