import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import type { CollectionEntry } from 'astro:content';

type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

export const awardAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (allMatches: Match[], allTournaments: Tournament[], member: Member, members: Member[]) => Achievement | null;
  
}[] = [
  {
    id: 'mvp',
    rarity: 'Rare',
    name: 'MVP',
    icon: Trophy,
    description: 'Awarded for winning the Golden Ball in a Forest Cup.',
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t => t.data.prizes?.bestPlayer?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.bestPlayer!.player;
      return {
        id: 'mvp',
        name: 'MVP',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${player} won the Golden Ball in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'wall',
    rarity: 'Rare',
    name: 'Wall',
    icon: Trophy,
    description: 'Awarded for winning the Golden Glove in a Forest Cup.',
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t => t.data.prizes?.bestGoalkeeper?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.bestGoalkeeper!.player;
      return {
        id: 'wall',
        name: 'Wall',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${player} won the Golden Glove in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'golden-boot',
    rarity: 'Rare',
    name: 'Golden Boot',
    icon: Trophy,
    description: 'Awarded for winning the Golden Boot in a Forest Cup.',
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t => t.data.prizes?.topScorer?.team === member.data.name);
      if (!tour) return null;
      const player = tour.data.prizes!.topScorer!.player;
      return {
        id: 'golden-boot',
        name: 'Golden Boot',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${player} won the Golden Boot in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'awarded',
    rarity: 'Rare',
    name: 'Awarded',
    icon: Trophy,
    description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.',
    evaluate: (matches, tournaments, member) => {
      // Lógica combinada: ganó copa, balón, guante y bota en cualquier edición
      const wonCup = tournaments.some(t => t.data.champion === member.data.name);
      const wonBall = tournaments.some(t => t.data.prizes?.bestPlayer?.team === member.data.name);
      const wonGlove = tournaments.some(t => t.data.prizes?.bestGoalkeeper?.team === member.data.name);
      const wonBoot = tournaments.some(t => t.data.prizes?.topScorer?.team === member.data.name);
      if (wonCup && wonBall && wonGlove && wonBoot) {
        return {
          id: 'awarded',
          name: 'Awarded',
          icon: Trophy,
          rarity: 'Rare',
          description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.'
        };
      }
      return null;
    }
  },
  {
    id: 'poker',
    rarity: 'Legendary',
    name: 'Poker',
    icon: Trophy,
    description: 'Awarded for winning the Cup, Golden Ball, and Golden Boot in the same edition.',
    evaluate: (matches, tournaments, member) => {
      for (const t of tournaments) {
        const isChampion = t.data.champion === member.data.name;
        const isBall = t.data.prizes?.bestPlayer?.team === member.data.name;
        const isBoot = t.data.prizes?.topScorer?.team === member.data.name;
        if (isChampion && isBall && isBoot) {
          return {
            id: 'poker',
            name: 'Poker',
            icon: Trophy,
            rarity: 'Legendary',
            description: `Won Cup, Golden Ball, and Golden Boot in FC ${t.data.edition}.`
          };
        }
      }
      return null;
    }
  }
];