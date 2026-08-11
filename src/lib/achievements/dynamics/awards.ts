import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import type { Category } from '../utils';
import { ALIGNMENTS, type Subcategory } from '../utils';
import type { CollectionEntry } from 'astro:content';

type Tournament = CollectionEntry<'tournaments'>;

type ObjectPrize = { team: string; teamId?: number };

const thisCategory = 'Awards';

function objectPrizeMatches(prize: ObjectPrize, memberId: number, memberName: string): boolean {
  return prize.teamId !== undefined && prize.teamId !== null
    ? prize.teamId === memberId
    : prize.team === memberName;
}

function topScorerMatches(t: Tournament, memberId: number, memberName: string): boolean {
  return (t.data.prizes?.topScorer ?? []).some(p => objectPrizeMatches(p, memberId, memberName));
}

function championMatches(t: Tournament, memberId: number, memberName: string): boolean {
  return t.data.championId !== undefined && t.data.championId !== null
    ? t.data.championId === memberId
    : t.data.champion === memberName;
}

export const awardAchievements: AchievementDefinition[] = [
  {
    id: 'mvp',
    rarity: 2,
    name: 'MVP',
    icon: Trophy,
    description: 'Awarded for winning the Golden Ball in a Forest Cup.',
    category: thisCategory as Category,
    subcategory: "Prizes" as Subcategory,
    alignment: ALIGNMENTS[0],
    unique: false,
    visible: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const tour = tournaments.find(t => t.data.prizes?.bestPlayer && objectPrizeMatches(t.data.prizes.bestPlayer, member.data.id, member.data.name));
      if (!tour) return null;
      const player = tour.data.prizes!.bestPlayer!.player;
      return achieved(this, {
        description: `Player ${player} won the Golden Ball in FC ${tour.data.edition}.`
      });
    }
  },
  {
    id: 'wall',
    rarity: 2,
    name: 'Wall',
    icon: Trophy,
    description: 'Awarded for winning the Golden Glove in a Forest Cup.',
    category: thisCategory as Category,
    subcategory: "Prizes" as Subcategory,
    alignment: ALIGNMENTS[0],
    unique: false,
    visible: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const tour = tournaments.find(t => t.data.prizes?.bestGoalkeeper && objectPrizeMatches(t.data.prizes.bestGoalkeeper, member.data.id, member.data.name));
      if (!tour) return null;
      const player = tour.data.prizes!.bestGoalkeeper!.player;
      return achieved(this, {
        description: `Player ${player} won the Golden Glove in FC ${tour.data.edition}.`
      });
    }
  },
  {
    id: 'golden-boot',
    rarity: 2,
    name: 'Golden Boot',
    icon: Trophy,
    description: 'Awarded for winning the Golden Boot in a Forest Cup.',
    category: thisCategory as Category,
    subcategory: "Prizes" as Subcategory,
    alignment: ALIGNMENTS[0],
    unique: false,
    visible: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      const tour = tournaments.find(t => topScorerMatches(t, member.data.id, member.data.name));
      if (!tour) return null;
      const player = tour.data.prizes!.topScorer!.player;
      return achieved(this, {
        description: `Player ${player} won the Golden Boot in FC ${tour.data.edition}.`
      });
    }
  },
  {
    id: 'awarded',
    rarity: 2,
    name: 'Awarded',
    icon: Trophy,
    description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.',
    category: thisCategory as Category,
    subcategory: "Prizes" as Subcategory,
    alignment: ALIGNMENTS[0],
    unique: false,
    visible: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      // Lógica combinada: ganó copa, balón, guante y bota en cualquier edición
      const wonCup = tournaments.some(t => championMatches(t, member.data.id, member.data.name));
      const wonBall = tournaments.some(t => t.data.prizes?.bestPlayer && objectPrizeMatches(t.data.prizes.bestPlayer, member.data.id, member.data.name));
      const wonGlove = tournaments.some(t => t.data.prizes?.bestGoalkeeper && objectPrizeMatches(t.data.prizes.bestGoalkeeper, member.data.id, member.data.name));
      const wonBoot = tournaments.some(t => topScorerMatches(t, member.data.id, member.data.name));
      if (wonCup && wonBall && wonGlove && wonBoot) {
        return achieved(this, {
          description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.'
        });
      }
      return null;
    }
  },
  {
    id: 'poker',
    rarity: 5,
    name: 'Poker',
    icon: Trophy,
    description: 'Awarded for winning the Cup, Golden Ball, and Golden Boot in the same edition.',
    category: thisCategory as Category,
    subcategory: "Prizes" as Subcategory,
    alignment: ALIGNMENTS[0],
    unique: false,
    visible: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { tournaments, member } = context;
      for (const t of tournaments) {
        const isChampion = championMatches(t, member.data.id, member.data.name);
        const isBall = !!t.data.prizes?.bestPlayer && objectPrizeMatches(t.data.prizes.bestPlayer, member.data.id, member.data.name);
        const isBoot = topScorerMatches(t, member.data.id, member.data.name);
        if (isChampion && isBall && isBoot) {
          return achieved(this, {
            description: `Won Cup, Golden Ball, and Golden Boot in FC ${t.data.edition}.`
          });
        }
      }
      return null;
    }
  }
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
