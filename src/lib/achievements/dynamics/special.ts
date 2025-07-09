import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinner } from '@lib/matchUtils';

export const specialAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'all-time-scorer',
    rarity: 'Ultra Rare',
    name: 'All‑Time Scorer',
    icon: Trophy,
    description: 'Awarded for being the top all-time scorer.',
    evaluate: (matches, tournaments, member) => {
      // Sum goals per team
      const teamGoals = new Map<string, number>();
      for (const m of matches) {
        for (const g of m.data.goals ?? []) {
          teamGoals.set(g.team, (teamGoals.get(g.team) ?? 0) + 1);
        }
      }
      // Find max
      const top = [...teamGoals.entries()].sort((a,b) => b[1]-a[1])[0];
      if (top && top[0] === member.data.name) {
        return {
          id: 'all-time-scorer',
          name: 'All‑Time Scorer',
          icon: Trophy,
          rarity: 'Ultra Rare',
          description: `Has scored the most goals ever: ${top[1]} goals.`
        };
      }
      return null;
    }
  },
  {
    id: 'goal-famine',
    rarity: 'Cursed',
    name: 'Dry Spell',
    icon: Trophy,
    description: 'Never scored a single goal in Forest Cup history.',
    evaluate: (matches, tournaments, member) => {
      const played = matches.filter(m =>
        [m.data.team1, m.data.team2].includes(member.data.name)
      );

      const goals = played.reduce((acc, m) => {
        return acc + (m.data.goals?.filter(g => g.team === member.data.name).length ?? 0);
      }, 0);

      if (played.length && goals === 0) {
        return {
          id: 'goal-famine',
          name: 'Dry Spell',
          icon: Trophy,
          rarity: 'Cursed',
          description: `Never scored a single goal in Forest Cup history.`
        };
      }

      return null;
    }
  },
  {
    id: 'biggest-win',
    rarity: 'Rare',
    name: 'Biggest Win',
    icon: Trophy,
    description: 'Awarded for achieving the largest goal difference victory in a verified match.',
    evaluate: (matches, tournaments, member, memberCollection) => {
      if (!member.data.verified) return null;
      const verifiedMatches = matches.filter(m => {
        const team1Verified = getMemberByName(m.data.team1, memberCollection)?.data.verified === true;
        const team2Verified = getMemberByName(m.data.team2, memberCollection)?.data.verified === true;
        return team1Verified || team2Verified;
      });

      if (verifiedMatches.length === 0) return null;
      // Encontrar la máxima diferencia de goles
      let maxDiff = 0;
      for (const m of verifiedMatches) {
        const goals = getGoalsByTeam(m.data);
        const diff1 = goals.team1 - goals.team2;
        const diff2 = goals.team2 - goals.team1;
        if (diff1 > maxDiff) maxDiff = diff1;
        if (diff2 > maxDiff) maxDiff = diff2;
      }
      
      // Encontrar todos los partidos con la máxima diferencia
      const biggestWins = [];
      for (const m of verifiedMatches) {
        const goals = getGoalsByTeam(m.data);
        const diff1 = goals.team1 - goals.team2;
        const diff2 = goals.team2 - goals.team1;
        // Solo pushear si el ganador está verificado
        if (diff1 === maxDiff && maxDiff > 0) {
          const winnerVerified = getMemberByName(m.data.team1, memberCollection)?.data.verified === true;
          if (winnerVerified) {
            biggestWins.push({ match: m.data, winner: m.data.team1, goals });
          }
        } else if (diff2 === maxDiff && maxDiff > 0) {
          const winnerVerified = getMemberByName(m.data.team2, memberCollection)?.data.verified === true;
          if (winnerVerified) {
            biggestWins.push({ match: m.data, winner: m.data.team2, goals });
          }
        }
      }

      // Verificar si el miembro actual es ganador en alguno de estos partidos
      for (const win of biggestWins) {
        if (win.winner === member.data.name) {
          const opponent = win.match.team1 === member.data.name ? win.match.team2 : win.match.team1;
          const goalsWinner = win.winner === win.match.team1 ? win.goals.team1 : win.goals.team2;
          const goalsLoser = win.winner === win.match.team1 ? win.goals.team2 : win.goals.team1;
          return {
            id: 'biggest-win',
            name: 'Biggest Win',
            icon: Trophy,
            rarity: 'Rare',
            description: `Biggest victory: ${goalsWinner}–${goalsLoser} vs ${opponent}.`
          };
        }
      }

      return null;
    }
  },
  {
    id: 'enemy',
    rarity: 'Mundane',
    name: 'Enemy',
    icon: Trophy,
    description: 'Awarded for being eliminated 2+ times by the same rival in knockout matches.',
    evaluate: (matches, tournaments, member) => {
      const eliminations: Record<string, number> = {};

      for (const m of matches) {
        if (m.data.stage !== 'knockout') continue;
        if (m.data.status !== 'played') continue;

        const winner = getMatchWinner(m.data);
        const loser = winner === m.data.team1 ? m.data.team2 : m.data.team1;

        if (loser === member.data.name) {
          eliminations[winner] = (eliminations[winner] ?? 0) + 1;
        }
      }

      const rivals = Object.entries(eliminations).filter(([, count]) => count >= 2);
      if (rivals.length) {
        const names = rivals.map(([r]) => r).join(', ');
        return {
          id: 'enemy',
          name: 'Enemy',
          icon: Trophy,
          rarity: 'Cursed',
          description: `Eliminated 2+ times by: ${names}.`
        };
      }

      return null;
    }
  }
];