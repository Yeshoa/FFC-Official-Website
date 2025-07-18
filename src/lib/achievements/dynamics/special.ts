import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinner, getMatchWinnerIncludingPenalties } from '@lib/matchUtils';
import type { Category } from '../utils';

const thisCategory = 'Special';

export const specialAchievements: {
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
  {
    id: 'goal-famine',
    rarity: -4,
    name: 'Dry Spell',
    icon: Trophy,
    description: 'Never scored a single goal in Forest Cup history.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: false,
    evaluate: function (matches, tournaments, member) {
      const played = matches.filter(m =>
        [m.data.team1, m.data.team2].includes(member.data.name)
      );

      const goals = played.reduce((acc, m) => {
        return acc + (m.data.goals?.filter(g => g.team === member.data.name).length ?? 0);
      }, 0);

      if (!played.length || goals !== 0) return null;

      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Never scored a single goal in Forest Cup history.`,
      }
    }
  },
  /* {
    id: 'biggest-win',
    rarity: 2,
    name: 'Biggest Win',
    icon: Trophy,
    description: 'Awarded for achieving the largest goal difference victory in a verified match.',
    category: thisCategory,
    visible: true,
    unique: false,
    enabled: true,
    evaluate: function (matches, tournaments, member, memberCollection) {
      if (!member.data.verified) return null;

      // 1) Verified matches
      const verifiedMatches = matches.filter(m => {
        const t1 = getMemberByName(m.data.team1, memberCollection)?.data.verified;
        const t2 = getMemberByName(m.data.team2, memberCollection)?.data.verified;
        return t1 || t2;
      });
      if (!verifiedMatches.length) return null;

      // 2) Max goal difference
      let maxDiff = 0;
      for (const m of verifiedMatches) {
        const { team1, team2 } = getGoalsByTeam(m.data);
        maxDiff = Math.max(maxDiff, team1 - team2, team2 - team1);
      }
      if (maxDiff <= 0) return null;

      // 3) Filter the ones where winner is verified
      const biggestWins = verifiedMatches.flatMap(m => {
        const { team1, team2 } = getGoalsByTeam(m.data);
        const diffs: Array<{ winner: string; loser: string; goals: [number,number] }> = [];
        if (team1 - team2 === maxDiff) diffs.push({ winner: m.data.team1, loser: m.data.team2, goals: [team1, team2] });
        if (team2 - team1 === maxDiff) diffs.push({ winner: m.data.team2, loser: m.data.team1, goals: [team2, team1] });
        return diffs.filter(d => getMemberByName(d.winner, memberCollection)?.data.verified);
      });

      // 4) If the member won one of them
      if (biggestWins.some(w => w.winner === member.data.name)) {
        const win = biggestWins.find(w => w.winner === member.data.name)!;
        const opponent = win.loser;
        const [scW, scL] = win.goals;

        const { evaluate, ...base } = this;
        return {
          ...base,
          description: `Biggest victory: ${scW}–${scL} vs ${opponent}.`
        };
      }

      return null;
    }
  }, */
  {
    id: 'enemy',
    rarity: -1,
    name: 'Enemy',
    icon: Trophy,
    description: 'Eliminated 2+ times by the same rival.',
    category: thisCategory,
    visible: false,
    unique: false,
    enabled: false,
    evaluate: function (matches, tournaments, member) {
      const eliminations: Record<string, number> = {};

      for (const m of matches) {
        if (m.data.stage !== 'knockout') continue;
        if (m.data.status !== 'played') continue;

        let winner = getMatchWinnerIncludingPenalties(m.data);
        const loser = winner === m.data.team1 ? m.data.team2 : m.data.team1;

        if (loser === member.data.name) {
          eliminations[winner] = (eliminations[winner] ?? 0) + 1;
        }
      }

      const rivals = Object.entries(eliminations).filter(([, count]) => count >= 2);
      if (!rivals.length) return null;

      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Eliminated 2+ times by: ${rivals.map(([r]) => r).join(', ')}.`
      }
    }
  }
];