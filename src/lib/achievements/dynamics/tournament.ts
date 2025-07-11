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
  rarity: number;
  name: string;
  icon: ImageMetadata;
  description: string;
  category: Category;
  stars?: number;
  skulls?: number;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  /* {
    id: 'host',
    rarity: 1,
    name: 'Host',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const h = tournaments.filter(t => t.data.host === member.data.name);
      if (h.length < 1) return null;
      const { evaluate, ...base } = this;

      const newStars = h.length;
      const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas

      const list = h.map((t, i, arr) => i === arr.length - 1 && arr.length > 1 ? ` and ${t.data.edition}` : t.data.edition).join(', ');
      const newDescription = newStars === 1 ? "Hosted the Forest Cup in " + list + "." : "Hosted the Forest Cup " + newStars + " times (" + list + ").";
      return {
        ...base,
        stars: displayStars,
        description: newDescription
      };
    }
  }, */
  {
    id: 'host',
    rarity: 1,
    name: 'Host',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const h = tournaments.filter(t => t.data.host === member.data.name);
      const { evaluate, ...base } = this;
      
      const editions = h.map(t => t.data.edition);
      
      return createAchievementResult(base, editions, {
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
    rarity: 5,
    name: 'Dynasty',
    icon: Trophy,
    description: 'Awarded for winning two Forest Cups.',
    category: thisCategory,
    stars: 2,
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
    rarity: 6,
    name: 'Emperor',
    icon: Trophy,
    description: 'Awarded for winning three Forest Cups.',
    category: thisCategory,
    stars: 3,
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
    rarity: 4,
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
      return createAchievementResult(base, unbeatenEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " without losing a match",
        pluralSuffix: " times without losing a match",
        enableRarityBonus: false // Deshabilitado explícitamente
      });
      /* if (unbeatenEditions.length === 0) return null;
      const list = unbeatenEditions.map((e, i, arr) => i === arr.length - 1 && unbeatenEditions.length > 1 ? ` and ${e}` : e).join(', ');
      const newDescription = unbeatenEditions.length < 9 ? `Won Forest Cup ${list} without losing a match.` : `Won Forest Cup ${unbeatenEditions.length} times without losing a match.`;
      const newStars = unbeatenEditions.length;
      const displayStars = ((newStars - 1) % 8) + 1; // Cycle 1-8 every 8 stars
      // const bonus = Math.floor((newStars - 1) / 8); // 1 extra rarity at 9, 17, 25, etc.
      // const newRarity = rarity + bonus; 
      return {
        ...base,
        stars: displayStars,
        description: newDescription
      }; */
    }
  },
  {
    id: 'perfect-champion',
    rarity: 5,
    name: 'Flawless',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record (all wins).',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member)  {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length !== 1) return null;
      const { evaluate, ...base } = this;
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
      return createAchievementResult(base, perfectEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " with a perfect record",
        pluralSuffix: " with a perfect record",
        enableRarityBonus: false
      });
      /* if (perfectEditions.length === 0) return null;
      const list = perfectEditions.map((e, i, arr) => i === arr.length - 1 && perfectEditions.length > 1 ? ` and ${e}` : e).join(', ');
      const newDescription = perfectEditions.length < 9 ? `Won Forest Cup ${list} with a perfect record and got all awards.` : `Won Forest Cup ${perfectEditions.length} with a perfect record and got all awards.`;

      const newStars = perfectEditions.length;
      const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas
      // const bonus = Math.floor((newStars - 1) / 8); // 1 extra rarity por cada 8 estrellas
      // const newRarity = rarity + bonus; 
      return {
        ...base,
        stars: displayStars,
        description: newDescription
      }; */
    }
  },
  {
    id: 'ultimate-champion',
    rarity: 6,
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
      return createAchievementResult(base, ultimateEditions, {
        singularText: "Won Forest Cup",
        pluralText: "Won Forest Cup",
        singularSuffix: " with a perfect record and got all awards",
        pluralSuffix: " with a perfect record and got all awards",
        enableRarityBonus: false
      });
      /* if (ultimateEditions.length === 0) return null;
      const list = ultimateEditions.map((e, i, arr) => i === arr.length - 1 && ultimateEditions.length > 1 ? ` and ${e}` : e).join(', ');
      const newDescription = ultimateEditions.length < 9 ? `Won Forest Cup ${list} with a perfect record and got all awards.` : `Won Forest Cup ${ultimateEditions.length} with a perfect record and got all awards.`;

      const newStars = ultimateEditions.length;
      const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas
      // const bonus = Math.floor((newStars - 1) / 8); // 1 extra rarity por cada 8 estrellas
      // const newRarity = rarity + bonus; 
      return {
        ...base,
        stars: displayStars,
        description: newDescription
      }; */
    }
  },
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
) => ({
  id,
  name,
  icon: icon,
  rarity,
  stars,
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
      description: `Won ${wonTypes.length} prize${wonTypes.length > 1 ? 's' : ''}: ${list}.`,
    } as Achievement;
  }
});

const prizeAchievements: Achievement[] = [
  makePrizeAchievement('prize-winner-1', 'Awarded', 'Won one type of prize', Trophy, 2, 1, 1),
  makePrizeAchievement('prize-winner-2', 'Honored', 'Won two type of prizes', Trophy, 3, 2, 2),
  makePrizeAchievement('prize-winner-3', 'Exalted', 'Won three type of prizes', Trophy, 4, 3, 3),
  makePrizeAchievement('prize-winner-4', 'Glorified', 'Won all types of prizes',  Trophy, 5, 4, 4),
];

/* Export */
export const tournamentAchievements = [
  ...baseAchievements,
  // ...championAchievements, 
  ...prizeAchievements, 
  // ...multiChampionAchievements
];

function createAchievementResult(base, editions, options = {}) {
  const {
    singularText = "Won Forest Cup",
    pluralText = "Won Forest Cup",
    singularSuffix = "",
    pluralSuffix = "",
    maxStarsBeforeCompact = 8, // Después de cuántas ediciones usar descripción compacta
    enableRarityBonus = false,
    customDescriptionBuilder = null
  } = options;

  if (editions.length === 0) return null;

  const newStars = editions.length;
  const displayStars = ((newStars - 1) % 8) + 1;

  // Calcular bonus de rareza si está habilitado
  const rarityBonus = enableRarityBonus ? Math.floor((newStars - 1) / 8) : 0;
  const newRarity = base.rarity + rarityBonus;

  // Crear lista de ediciones
  const list = editions.map((e, i, arr) => 
    i === arr.length - 1 && arr.length > 1 ? ` and ${e}` : e
  ).join(', ');

  // Construir descripción
  let newDescription;
  if (customDescriptionBuilder) {
    newDescription = customDescriptionBuilder(editions, list);
  } else if (editions.length < maxStarsBeforeCompact) {
    // Descripción detallada
    if (editions.length === 1) {
      newDescription = `${singularText} ${list}${singularSuffix}.`;
    } else {
      newDescription = `${pluralText} ${list}${pluralSuffix}.`;
    }
  } else {
    // Descripción compacta para muchas ediciones
    newDescription = `${pluralText} ${editions.length} times${pluralSuffix}.`;
  }

  return {
    ...base,
    stars: displayStars,
    description: newDescription,
    ...(enableRarityBonus && { rarity: newRarity })
  };
}