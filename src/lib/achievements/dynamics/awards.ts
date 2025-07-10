import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import type { CollectionEntry } from 'astro:content';
import type { Rarity, Category } from '../utils';

const thisCategory = 'Awards';

type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

export const awardAchievements: {
  id: string;
  rarity: number;
  name: string;
  icon: ImageMetadata;
  description: string;
  category: Category;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (allMatches: Match[], allTournaments: Tournament[], member: Member, members: Member[]) => Achievement | null;
  
}[] = [
  {
    id: 'mvp',
    rarity: 2,
    name: 'MVP',
    icon: Trophy,
    description: 'Awarded for winning the Golden Ball in a Forest Cup.',
    category: thisCategory,
    unique: false,
    visible: false,
    enabled: false,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
      const tour = tournaments.find(t => t.data.prizes?.bestPlayer?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.bestPlayer!.player;
      return {
        ...base,
        description: `Player ${player} won the Golden Ball in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'wall',
    rarity: 2,
    name: 'Wall',
    icon: Trophy,
    description: 'Awarded for winning the Golden Glove in a Forest Cup.',
    category: thisCategory,
    unique: false,
    visible: false,
    enabled: false,
    evaluate: function (matches, tournaments, member)  {
      const { evaluate, ...base } = this;
      const tour = tournaments.find(t => t.data.prizes?.bestGoalkeeper?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.bestGoalkeeper!.player;
      return {
        ...base,
        description: `Player ${player} won the Golden Glove in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'golden-boot',
    rarity: 2,
    name: 'Golden Boot',
    icon: Trophy,
    description: 'Awarded for winning the Golden Boot in a Forest Cup.',
    category: thisCategory,
    unique: false,
    visible: false,
    enabled: false,
    evaluate: function (matches, tournaments, member)   {
      const { evaluate, ...base } = this;
      const tour = tournaments.find(t => t.data.prizes?.topScorer?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.topScorer!.player;
      return {
        ...base,
        description: `Player ${player} won the Golden Boot in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'awarded',
    rarity: 2,
    name: 'Awarded',
    icon: Trophy,
    description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.',
    category: thisCategory,
    unique: false,
    visible: false,
    enabled: false,
    evaluate: function (matches, tournaments, member)   {
      const { evaluate, ...base } = this;
      // Lógica combinada: ganó copa, balón, guante y bota en cualquier edición
      const wonCup = tournaments.some(t => t.data.champion === member.data.name);
      const wonBall = tournaments.some(t => t.data.prizes?.bestPlayer?.team === member.data.name);
      const wonGlove = tournaments.some(t => t.data.prizes?.bestGoalkeeper?.team === member.data.name);
      const wonBoot = tournaments.some(t => t.data.prizes?.topScorer?.team === member.data.name);
      if (wonCup && wonBall && wonGlove && wonBoot) {
        return {
          ...base,
          description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.'
        };
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
    category: thisCategory,
    unique: false,
    visible: false,
    enabled: false,
    evaluate: function (matches, tournaments, member)  {
      const { evaluate, ...base } = this;
      for (const t of tournaments) {
        const isChampion = t.data.champion === member.data.name;
        const isBall = t.data.prizes?.bestPlayer?.team === member.data.name;
        const isBoot = t.data.prizes?.topScorer?.team === member.data.name;
        if (isChampion && isBall && isBoot) {
          return {
            ...base,
            description: `Won Cup, Golden Ball, and Golden Boot in FC ${t.data.edition}.`
          };
        }
      }
      return null;
    }
  }
];