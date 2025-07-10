import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Rarity, type Category, CATEGORIES } from '../utils';
import type { CollectionEntry } from 'astro:content';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;

const thisCategory = CATEGORIES[0];

type PrizeType = 'topScorer' | 'bestPlayer' | 'bestGoalkeeper' | 'bestGoal';

const prizeCheckers: Record<PrizeType, (t: any, memberName: string) => boolean> = {
  topScorer:       (t, name) => (t.data.prizes?.topScorer ?? []).some(p => p.team === name),
  bestPlayer:      (t, name) => t.data.prizes?.bestPlayer?.team === name,
  bestGoalkeeper:  (t, name) => t.data.prizes?.bestGoalkeeper?.team === name,
  bestGoal:        (t, name) => t.data.prizes?.bestGoal?.team === name,
};

const baseAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  category: Category;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'host',
    rarity: 'Uncommon',
    name: 'Host',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const h = tournaments.find(t => t.data.host === member.data.name);
      const { evaluate, ...base } = this;
      return h ? {
        ...base,
        description: `Hosted the Forest Cup ${h.data.edition}.`
      } : null;
    }
  },
  {
    id: 'champion',
    rarity: 'Rare',
    name: 'Champion',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: false,
    evaluate: function (matches, tournaments, member) {
      const won = tournaments.find(t => t.data.champion === member.data.name);
      const { evaluate, ...base } = this;
      return won ? {
        ...base,
        description: `Won the Forest Cup ${won.data.edition}.`
      } : null;
    }
  },
  {
    id: 'double-champion',
    rarity: 'Legendary',
    name: 'Dynasty',
    icon: Trophy,
    description: 'Awarded for winning two Forest Cups.',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length !== 2) return null;
      const editions = won
        .map(t => t.data.edition)
        .sort((a, b) => a - b);
      const desc = `Won Forest Cup ${editions[0]} and ${editions[1]}.`;
      const { evaluate, ...base } = this;
      return { ...base, description: desc };
    }
  },
  {
    id: 'triple-champion',
    rarity: 'Ultra',
    name: 'Overlord',
    icon: Trophy,
    description: 'Awarded for winning three Forest Cups.',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length !== 3) return null;
      const editions = won
        .map(t => t.data.edition)
        .sort((a, b) => a - b);
      const desc = `Won Forest Cup ${editions[0]}, ${editions[1]}, and ${editions[2]}.`;
      const { evaluate, ...base } = this;
      return { ...base, description: desc };
    }
  },
  {
    id: 'unbeaten-champion',
    rarity: 'Epic',
    name: 'Invictus',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup without losing a single match.',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      const { evaluate, ...base } = this;
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const lost = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf < ga;
        }).length;
        if (lost === 0 && played.length > 0)
          return {
            ...base,
            description: `Won Forest Cup ${t.data.edition} without losing a match.`
          };
      }
      return null;
    }
  },
  {
    id: 'perfect-champion',
    rarity: 'Legendary',
    name: 'Flawless',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record (all wins).',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member)  {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      const { evaluate, ...base } = this;
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const wins = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf > ga;
        }).length;
        if (wins === played.length && played.length > 0)
          return {
            ...base,
            description: `Won Forest Cup ${t.data.edition} with a perfect record (${wins}-0).`
          };
      }
      return null;
    }
  },
  {
    id: 'ultimate-champion',
    rarity: 'Ultra',
    name: 'Superb',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record and getting all awards.',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      const { evaluate, ...base } = this;
      if (won.length === 0) return null;
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

        if (wins === played.length && played.length > 0 && awardsCount === 4)
          return {
            ...base,
            description: `Won Forest Cup ${t.data.edition} with a perfect record and got all awards.`
          };
      }
      return null;
    }
  },
];
/* MULTI CHAMPION */
/* function evaluateMultiChampionAchievements(
  matches: Match[],
  tournaments: Tournament[],
  member: Member
) {
  const memberName = member.data.name;
  const won = tournaments.filter(t => t.data.champion === memberName);

  const editions = won.map(t => t.data.edition).sort((a, b) => a - b);

  if (won.length >= 3) {
    const desc = `Won Forest Cup ${editions[0]}, ${editions[1]}, and ${editions[2]}.`;
    return {
      id: 'triple-champion',
      rarity: 'Ultra',
      name: 'Overlord',
      icon: Trophy,
      description: desc,
      category: 'Tournament',
      visible: false,
      unique: false,
      enabled: true,
    };
  }
  if (won.length === 2) {
    const desc = `Won Forest Cup ${editions[0]} and ${editions[1]}.`;
    return {
      id: 'double-champion',
      rarity: 'Legendary',
      name: 'Dynasty',
      icon: Trophy,
      description: desc,
      category: 'Tournament',
      visible: false,
      unique: false,
      enabled: true,
    };
  }
  if (won.length === 1) {
    const desc = `Won the Forest Cup ${editions[0]}.`;
    return {
      id: 'champion',
      rarity: 'Rare',
      name: 'Champion',
      icon: Trophy,
      description: desc,
      category: 'Tournament',
      visible: true,
      unique: false,
      enabled: true,
    };
  }
  return null;
}

const multiChampionAchievements = [
  {
    id: 'multi-champion',
    rarity: 'Rare', 
    name: 'Multi Champion',
    icon: Trophy,
    description: 'Awarded for winning one or more Forest Cups.',
    category: 'Tournament',
    visible: true,
    unique: false,
    enabled: false,
    evaluate: evaluateMultiChampionAchievements,
  },
];
 */
/* CHAMPIONS */
/* function evaluateChampionAchievements(
  matches: Match[],
  tournaments: Tournament[],
  member: Member
) {
  const memberName = member.data.name;
  const wonTournaments = tournaments.filter(t => t.data.champion === memberName);
  for (const tournament of wonTournaments) {
    const played = matches.filter(
      m => m.data.tournament_id === tournament.data.id && [m.data.team1, m.data.team2].includes(memberName)
    );
    if (played.length === 0) continue;

    // Calcular victorias y derrotas
    const wins = played.filter(m => {
      const gf = m.data.goals?.filter(g => g.team === memberName).length ?? 0;
      const ga = m.data.goals?.filter(g => g.team !== memberName).length ?? 0;
      return gf > ga;
    }).length;
    const losses = played.filter(m => {
      const gf = m.data.goals?.filter(g => g.team === memberName).length ?? 0;
      const ga = m.data.goals?.filter(g => g.team !== memberName).length ?? 0;
      return gf < ga;
    }).length;

    // Contar premios (corrigiendo el cálculo de awards)
    const awardsCount = Object.values(prizeCheckers).filter(checker =>
      checker(tournament, memberName)
    ).length;

    // Evaluar de más estricto a menos estricto
    if (wins === played.length && awardsCount === 4) {
      return {
        id: 'ultimate-champion',
        rarity: 'Ultra',
        name: 'Superb',
        icon: Trophy,
        description: `Won Forest Cup ${tournament.data.edition} with a perfect record and got all awards.`,
        category: 'Tournament',
        visible: false,
        unique: false,
        enabled: true,
      };
    }
    if (wins === played.length) {
      return {
        id: 'perfect-champion',
        rarity: 'Legendary',
        name: 'Flawless',
        icon: Trophy,
        description: `Won Forest Cup ${tournament.data.edition} with a perfect record (${wins}-0).`,
        category: 'Tournament',
        visible: false,
        unique: false,
        enabled: true,
      };
    }
    if (losses === 0) {
      return {
        id: 'unbeaten-champion',
        rarity: 'Epic',
        name: 'Invictus',
        icon: Trophy,
        description: `Won Forest Cup ${tournament.data.edition} without losing a match.`,
        category: 'Tournament',
        visible: false,
        unique: false,
        enabled: true,
      };
    }
  }
  return null;
}

const championAchievements = [
  {
    id: 'champion-achievements', 
    rarity: 'Epic', 
    name: 'Champion Achievements',
    icon: Trophy,
    description: 'Awarded for exceptional performance in winning a Forest Cup.',
    category: 'Tournament',
    visible: false,
    unique: false,
    enabled: false,
    evaluate: evaluateChampionAchievements,
  },
]; */
/* PRIZES */
const makePrizeAchievement = (
  id: string,
  name: string,
  description: string,
  icon: ImageMetadata,
  rarity: Rarity,
  minTypes: number,
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: CATEGORIES[0],
  unique: false,
  visible: false,
  enabled: true,

  evaluate: function (_matches: any[], tournaments: any[], member: any) {
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
    const { evaluate, ...base } = this;
    return {
      ...base,
      description: `Won ${list}.`,
    } as Achievement;
  }
});

const prizeAchievements: Achievement[] = [
  makePrizeAchievement('prize-winner-1', 'Awarded', 'Won one type of prize', Trophy, 'Rare', 1),
  makePrizeAchievement('prize-winner-2', 'Double Prize Winner', 'Won two type of prizes', Trophy, 'Ultra Rare', 2),
  makePrizeAchievement('prize-winner-3', 'Triple Prize Winner', 'Won three type of prizes', Trophy, 'Epic', 3),
  makePrizeAchievement('prize-winner-4', 'Poker', 'Won all types of prizes',  Trophy, 'Legendary', 4),
];

/* Export */
export const tournamentAchievements = [
  ...baseAchievements,
  // ...championAchievements, 
  ...prizeAchievements, 
  // ...multiChampionAchievements
];