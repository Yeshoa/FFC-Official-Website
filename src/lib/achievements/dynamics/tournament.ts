import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult, AchievementContext } from '../types';
import { type Category, CATEGORIES, type Subcategory, type Alignment, ALIGNMENTS } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getTournamentsByMemberParticipation } from '@utils/tournamentUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

const thisCategory = CATEGORIES[1];

type PrizeType = 'topScorer' | 'bestPlayer' | 'bestGoalkeeper' | 'bestGoal';

const prizeCheckers: Record<PrizeType, (t: Tournament, memberName: string) => boolean> = {
  topScorer:       (t, name) => (t.data.prizes?.topScorer ?? []).some(p => p.team === name),
  bestPlayer:      (t, name) => t.data.prizes?.bestPlayer?.team === name,
  bestGoalkeeper:  (t, name) => t.data.prizes?.bestGoalkeeper?.team === name,
  bestGoal:        (t, name) => t.data.prizes?.bestGoal?.team === name,
};

const baseAchievements: AchievementDefinition[] = [
  {
    id: 'host',
    rarity: 1,
    name: 'Home sweet home.',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    category: thisCategory,
    subcategory: "Participation" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: true,
    unique: false,
    enabled: true,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const editions = tournaments
        .filter(t => t.data.host === member.data.name)
        .map(t => t.data.edition);
      return createAchievementResult(this, editions, {
        singularText: "Hosted the Forest Cup in",
        pluralText: "Hosted the Forest Cup",
        pluralSuffix: " times",
        customDescriptionBuilder: (editions, list) => {
          if (editions.length === 1) {
            return `Hosted the Forest Cup in ${list}.`;
          } else {
            return `Hosted the Forest Cup ${editions.length} times (${list}).`;
          }
        }
      });
    }
  },
  {
    id: 'champion',
    rarity: 2,
    name: 'Kingdom',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup.',
    category: thisCategory,
    subcategory: "Champion Times" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: true,
    unique: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const won = tournaments.find(t => t.data.champion === member.data.name);
      return won ? achieved(this, {
        description: `Won the Forest Cup ${won.data.edition}.`,
        current: 1,
        target: 1,
        progress: 100,
      }) : null;
    }
  },
  {
    id: 'double-champion',
    rarity: 5,
    name: 'Dynasty',
    icon: Trophy,
    description: 'Awarded for winning two Forest Cups.',
    category: thisCategory,
    subcategory: "Champion Times" as Subcategory,
    alignment: ALIGNMENTS[0],
    stars: 2,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length !== 2) return null;
      const editions = won
        .map(t => t.data.edition)
        .sort((a, b) => a - b);
      const desc = `Won Forest Cup ${editions[0]} and ${editions[1]}.`;
      return achieved(this, {
        description: desc,
        current: 2,
        target: 2,
        progress: 100,
      });
    }
  },
  {
    id: 'triple-champion',
    rarity: 6,
    name: 'Empire',
    icon: Trophy,
    description: 'Awarded for winning three Forest Cups.',
    category: thisCategory,
    subcategory: "Champion Times" as Subcategory,
    alignment: ALIGNMENTS[0],
    stars: 3,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length < 3) return null;
      const editions = won
        .map(t => t.data.edition)
        .sort((a, b) => a - b);
      const list = editions.map((e, i, arr) => i === arr.length - 1 && arr.length > 1 ? ` and ${e}` : e).join(', ');
      const newDescription = `Won the Forest Cup ${editions.length} times (${list}).`;
      return achieved(this, {
        description: newDescription,
        stars: editions.length,
        current: editions.length,
        target: 3,
        progress: 100,
      });
    }
  },
  {
    id: 'unbeaten-champion',
    rarity: 4,
    name: 'Invictus',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup without losing a single match.',
    category: thisCategory,
    subcategory: "Champion Tiers" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: false,
    unique: false,
    enabled: true,
    stars: 1,
    evaluate: function (context) {
      const { matches, tournaments, member } = context;
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      const unbeatenEditions = [];
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const lost = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf < ga;
        }).length;
        if (lost === 0 && played.length > 0) {
          unbeatenEditions.push(t.data.edition);
        }
      }
      return createAchievementResult(this, unbeatenEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " without losing a match",
        pluralSuffix: " times without losing a match",
        enableRarityBonus: false // Deshabilitado explícitamente
      });
    }
  },
  {
    id: 'perfect-champion',
    rarity: 5,
    name: 'Flawless',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record (all wins).',
    category: thisCategory,
    subcategory: "Champion Tiers" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: false,
    unique: false,
    enabled: true,
    stars: 1,
    evaluate: function (context) {
      const { matches, tournaments, member } = context;
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length !== 1) return null;
      const perfectEditions = [];
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const wins = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf > ga;
        }).length;
        if (wins === played.length && played.length > 0){
          perfectEditions.push(t.data.edition);
        }
      }
      return createAchievementResult(this, perfectEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " with a perfect record",
        pluralSuffix: " with a perfect record",
        enableRarityBonus: false
      });
    }
  },
  {
    id: 'ultimate-champion',
    rarity: 6,
    name: 'Superb',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record and getting all awards.',
    category: thisCategory,
    subcategory: "Champion Tiers" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: false,
    unique: false,
    enabled: true,
    stars: 1,
    evaluate: function (context) {
      const { matches, tournaments, member } = context;
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length === 0) return null;
      let ultimateEditions = [];
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));

        const wins = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf > ga;
        }).length;

        const awardsCount = Object.values(prizeCheckers).filter(checker =>
          checker(t, member.data.name)
        ).length;

        if (wins === played.length && played.length > 0 && awardsCount === 4) {
          ultimateEditions.push(t.data.edition);
        }
      }
      return createAchievementResult(this, ultimateEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " with a perfect record and got all awards",
        pluralSuffix: " with a perfect record and got all awards",
        enableRarityBonus: false
      });
    }
  },
  {
    id: 'veteran',
    rarity: 0,
    name: 'Veteran',
    icon: Trophy,
    description: 'Awarded for participating in multiple Forest Cups.',
    category: thisCategory,
    subcategory: "Participation" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: true,
    unique: false,
    enabled: false,
    stars: 1,

    evaluate: function (context) {
      const { tournaments, member, matches } = context;
      const participatedTournaments = getTournamentsByMemberParticipation(member, tournaments, matches);

      const participationCount = participatedTournaments.length;

      if (participationCount < 2) return null;

      const newStars = participationCount;
      const newRarity = participationCount > 8 ? 6 : participationCount - 2;
      const newDescription = `Participated in ${participationCount} Forest Cup${participationCount > 1 ? 's' : ''}.`;

      return achieved(this, {
        stars: newStars,
        rarity: newRarity,
        description: newDescription,
        current: participationCount,
        target: 2,
        progress: 100,
      });
    }
  }
];
/* PRIZES */
const makePrizeAchievement = (
  id: string,
  name: string,
  description: string,
  icon: ImageMetadata,
  rarity: number,
  stars: number,
  minTypes: number,
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  stars,
  description,
  category: thisCategory,
  subcategory: "Prizes" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,

  evaluate: function (context: AchievementContext & { member: Member }) {
    const { tournaments, member } = context;
    const memberName = member.data.name;
    const wonTypes = (Object.keys(prizeCheckers) as PrizeType[])
      .filter(type => tournaments.some(t => prizeCheckers[type](t, memberName)));
    if (wonTypes.length < minTypes) return null;
    const pretty = {
      topScorer:      'Golden Boot',
      bestPlayer:     'Golden Ball',
      bestGoalkeeper: 'Golden Glove',
      bestGoal:       'Best Goal'
    };
    const list = wonTypes.map((t, i, arr) => i === arr.length - 1 && arr.length > 1 ? ` and ${pretty[t]}` : pretty[t]).join(', ');
    return achieved(this, {
      description: `Won ${wonTypes.length} prize${wonTypes.length > 1 ? 's' : ''}: ${list}.`,
      current: wonTypes.length,
      target: minTypes,
      progress: 100,
    });
  }
});

const prizeAchievements: AchievementDefinition[] = [
  makePrizeAchievement('prize-winner-1', 'Awarded', 'Won one type of prize', Trophy, 2, 1, 1),
  makePrizeAchievement('prize-winner-2', 'Honored', 'Won two type of prizes', Trophy, 3, 2, 2),
  makePrizeAchievement('prize-winner-3', 'Exalted', 'Won three type of prizes', Trophy, 4, 3, 3),
  makePrizeAchievement('prize-winner-4', 'Glorified', 'Won all types of prizes',  Trophy, 5, 4, 4),
];

/* Export */
export const tournamentAchievements: AchievementDefinition[] = [
  ...baseAchievements,
  // ...championAchievements,
  ...prizeAchievements,
  // ...multiChampionAchievements
];

/** Marca un resultado como logrado, preservando la visibilidad de la definición. */
function achieved(def: AchievementDefinition, overrides: Partial<AchievementResult>): AchievementResult {
  return {
    id: def.id,
    achieved: true,
    visible: def.visible,
    ...overrides,
  };
}

type EditionResultOptions = {
  singularText?: string;
  pluralText?: string;
  singularSuffix?: string;
  pluralSuffix?: string;
  maxStarsBeforeCompact?: number;
  enableRarityBonus?: boolean;
  customDescriptionBuilder?: ((editions: number[], list: string) => string) | null;
};

function createAchievementResult(
  def: AchievementDefinition,
  editions: number[],
  options: EditionResultOptions = {},
): AchievementResult | null {
  const {
    singularText = "Won Forest Cup",
    pluralText = "Won Forest Cup",
    singularSuffix = "",
    pluralSuffix = "",
    maxStarsBeforeCompact = 8,
    enableRarityBonus = false,
    customDescriptionBuilder = null,
  } = options;

  if (editions.length === 0) return null;

  const newStars = editions.length;
  const rarityBonus = enableRarityBonus ? Math.floor((newStars - 1) / 8) : 0;
  const newRarity = def.rarity + rarityBonus;

  const list = editions.map((e, i, arr) =>
    i === arr.length - 1 && arr.length > 1 ? ` and ${e}` : e
  ).join(', ');

  let newDescription;
  if (customDescriptionBuilder) {
    newDescription = customDescriptionBuilder(editions, list);
  } else if (editions.length < maxStarsBeforeCompact) {
    if (editions.length === 1) {
      newDescription = `${singularText} ${list}${singularSuffix}.`;
    } else {
      newDescription = `${pluralText} ${list}${pluralSuffix}.`;
    }
  } else {
    newDescription = `${pluralText} ${editions.length} times${pluralSuffix}.`;
  }

  return {
    id: def.id,
    achieved: true,
    visible: def.visible,
    stars: newStars,
    description: newDescription,
    current: editions.length,
    target: editions.length,
    progress: 100,
    ...(enableRarityBonus && { rarity: newRarity }),
  };
}
