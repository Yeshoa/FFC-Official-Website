import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';

export const rivalryAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'rivalry',
    rarity: 'Common',
    name: 'Rivalry',
    icon: Trophy,
    description: 'Awarded for playing 3+ matches against the same rival.',
    evaluate: (matches, tournaments, member) => {
      const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const rivals = [...counts.entries()].filter(([,c]) => c>=3).map(([r])=>r);
      return rivals.length
        ? {
            id: 'rivalry',
            name: 'Rivalry',
            icon: Trophy,
            rarity: 'Common',
            description: `Played 3+ matches against: ${rivals.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'classic',
    rarity: 'Uncommon',
    name: 'Classic',
    icon: Trophy,
    description: 'Awarded for playing 7+ matches against the same rival.',
    evaluate: (matches, tournaments, member) => {
      const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const nem = [...counts.entries()].filter(([,c]) => c>=7).map(([r])=>r);
      return nem.length
        ? {
            id: 'classic',
            name: 'Classic',
            icon: Trophy,
            rarity: 'Uncommon',
            description: `Played 7+ matches against: ${nem.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'dominator',
    rarity: 'Uncommon',
    name: 'Dominator',
    icon: Trophy,
    description: 'Awarded for winning 3+ matches against the same rival.',
    evaluate: (matches, tournaments, member) => {
      // Count wins vs each rival
      const winCounts = new Map<string, number>();
      for (const m of matches) {
        const { team1, team2, goals } = m.data;
        const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
        const gf2 = goals?.filter(g => g.team === team2).length ?? 0;
        if (team1 === member.data.name && gf1 > gf2) {
          winCounts.set(team2, (winCounts.get(team2) ?? 0) + 1);
        }
        if (team2 === member.data.name && gf2 > gf1) {
          winCounts.set(team1, (winCounts.get(team1) ?? 0) + 1);
        }
      }
      // Find rivals beaten at least 3 times
      const dominators = [...winCounts.entries()]
        .filter(([, wins]) => wins >= 3)
        .map(([r]) => r);

      return dominators.length > 0
        ? {
            id: 'dominator',
            name: 'Dominator',
            icon: Trophy,
            rarity: 'Uncommon',
            description: `Won 3+ matches against: ${dominators.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'underdog',
    rarity: 'Worn',
    name: 'Underdog',
    icon: Trophy,
    description: 'Awarded for losing 3+ matches against the same rival.',
    evaluate: (matches, tournaments, member) => {
      // Count losses vs each rival
      const lossCounts = new Map<string, number>();
      for (const m of matches) {
        const { team1, team2, goals } = m.data;
        const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
        const gf2 = goals?.filter(g => g.team === team2).length ?? 0;
        if (team1 === member.data.name && gf1 < gf2) {
          lossCounts.set(team2, (lossCounts.get(team2) ?? 0) + 1);
        }
        if (team2 === member.data.name && gf2 < gf1) {
          lossCounts.set(team1, (lossCounts.get(team1) ?? 0) + 1);
        }
      }
      // Find rivals beaten them at least 3 times
      const underdogs = [...lossCounts.entries()]
        .filter(([, losses]) => losses >= 3)
        .map(([r]) => r);

      return underdogs.length > 0
        ? {
            id: 'underdog',
            name: 'Underdog',
            icon: Trophy,
            rarity: 'Cursed',
            description: `Lost 3+ matches against: ${underdogs.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'nemesis',
    rarity: 'Rare',
    name: 'Nemesis',
    icon: Trophy,
    description: 'Awarded for having a +5 win/loss record against a rival.',
    evaluate: (matches, tournaments, member) => {
      const scores = new Map<string, { wins: number; losses: number }>();

      for (const m of matches) {
        const { team1, team2, goals } = m.data;
        const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
        const gf2 = goals?.filter(g => g.team === team2).length ?? 0;

        if (team1 === member.data.name) {
          const entry = scores.get(team2) || { wins: 0, losses: 0 };
          if (gf1 > gf2) entry.wins++;
          if (gf1 < gf2) entry.losses++;
          scores.set(team2, entry);
        }
        if (team2 === member.data.name) {
          const entry = scores.get(team1) || { wins: 0, losses: 0 };
          if (gf2 > gf1) entry.wins++;
          if (gf2 < gf1) entry.losses++;
          scores.set(team1, entry);
        }
      }

      const dominantRivals = [...scores.entries()]
        .filter(([, record]) => record.wins - record.losses >= 5)
        .map(([r]) => r);

      return dominantRivals.length
        ? {
            id: 'nemesis',
            name: 'Nemesis',
            icon: Trophy,
            rarity: 'Rare',
            description: `Has a +5 record against: ${dominantRivals.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'prey',
    rarity: 'Doomed',
    name: 'Prey',
    icon: Trophy,
    description: 'Awarded for having a -5 win/loss record against a rival.',
    evaluate: (matches, tournaments, member) => {
      const scores = new Map<string, { wins: number; losses: number }>();

      for (const m of matches) {
        const { team1, team2, goals } = m.data;
        const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
        const gf2 = goals?.filter(g => g.team === team2).length ?? 0;

        if (team1 === member.data.name) {
          const entry = scores.get(team2) || { wins: 0, losses: 0 };
          if (gf1 < gf2) entry.losses++;
          if (gf1 > gf2) entry.wins++;
          scores.set(team2, entry);
        }
        if (team2 === member.data.name) {
          const entry = scores.get(team1) || { wins: 0, losses: 0 };
          if (gf2 < gf1) entry.losses++;
          if (gf2 > gf1) entry.wins++;
          scores.set(team1, entry);
        }
      }

      const badRivals = [...scores.entries()]
        .filter(([, record]) => record.losses - record.wins >= 5)
        .map(([r]) => r);

      return badRivals.length
        ? {
            id: 'prey',
            name: 'Prey',
            icon: Trophy,
            rarity: 'Cursed',
            description: `Has a -5 record against: ${badRivals.join(', ')}.`
          }
        : null;
    }
  },
];