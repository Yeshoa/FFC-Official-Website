import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Rarity, type Category, CATEGORIES } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinnerIncludingPenalties } from '@lib/matchUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;

const thisCategory = CATEGORIES[3];

export const baseAchievements: {
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
  /* {
    id: 'rivalry',
    rarity: 'Common',
    name: 'Rivalry',
    icon: Trophy,
    description: 'Awarded for playing 3+ matches against the same rival.',
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
      const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const rivals = [...counts.entries()].filter(([,c]) => c>=3).map(([r])=>r);
      return rivals.length
        ? {
            ...base,
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
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
      const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const nem = [...counts.entries()].filter(([,c]) => c>=7).map(([r])=>r);
      return nem.length
        ? {
            ...base,
            description: `Played 7+ matches against: ${nem.join(', ')}.`
          }
        : null;
    }
  }, */
  /* {
    id: 'dominator',
    rarity: 'Uncommon',
    name: 'Dominator',
    icon: Trophy,
    description: 'Awarded for winning 3+ matches against the same rival.',
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
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
            ...base,
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
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
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
            ...base,
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
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
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
            ...base,
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
    category: thisCategory,
    unique: false,
    visible: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      const { evaluate, ...base } = this;
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
            ...base,
            description: `Has a -5 record against: ${badRivals.join(', ')}.`
          }
        : null;
    }
  }, */
  {
    id: 'biggest-win',
    rarity: 'Ravaged',
    name: '',
    icon: Trophy,
    description: 'Awarded for achieving the largest goal difference victory.',
    category: thisCategory,
    visible: true,
    unique: true,
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
  },
];

const makeMatchesAchievements = (
  id: string,
  name: string,
  rarity: Rarity,
  icon: ImageMetadata,
  description: string,
  minMatches: number
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: thisCategory,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
    const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const rivals = [...counts.entries()].filter(([,c]) => c>=minMatches).map(([r])=>r);

      const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
      return rivals.length
        ? {
            ...base,
            description: `Played ${minMatches}+ matches against: ${list}.`
          }
        : null;
  }
});

const makeWinAchievements = (
  id: string,
  name: string,
  rarity: Rarity,
  icon: ImageMetadata,
  description: string,
  minWins: number
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: thisCategory,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
    const counts = new Map<string,number>();
    const wonMatches = matches.filter(m => {
      const { team1, team2, goals } = m.data;
      const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
      const gf2 = goals?.filter(g => g.team === team2).length ?? 0;
      return team1 === member.data.name && gf1 > gf2 || team2 === member.data.name && gf2 > gf1;
    })
    for (const m of wonMatches) {
      if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
      if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
    }
    const rivals = [...counts.entries()].filter(([,c]) => c>=minWins).map(([r])=>r);

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          description: `Won ${minWins}+ matches against: ${list}.`
        }
      : null;
  }
});

const makeLossAchievements = (
  id: string,
  name: string,
  rarity: Rarity,
  icon: ImageMetadata,
  description: string,
  minLosses: number
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: thisCategory,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
    const counts = new Map<string,number>();
    const lostMatches = matches.filter(m => {
      const { team1, team2, goals } = m.data;
      const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
      const gf2 = goals?.filter(g => g.team === team2).length ?? 0;
      return team1 === member.data.name && gf1 < gf2 || team2 === member.data.name && gf2 < gf1;
    })
    for (const m of lostMatches) {
      if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
      if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
    }
    const rivals = [...counts.entries()].filter(([,c]) => c>=minLosses).map(([r])=>r);

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          description: `Lost ${minLosses}+ matches against: ${list}.`
        }
      : null;
  }
});

const makeDifAchievements = (
  id: string,
  name: string,
  rarity: Rarity,
  icon: ImageMetadata,
  description: string,
  minDif: number
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: thisCategory,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
    const counts = new Map<string,number>();
    const wonMatchesByDif = matches.filter(m => {
      const { team1, team2, goals } = m.data;
      const gf1 = goals?.filter(g => g.team === team1).length ?? 0;
      const gf2 = goals?.filter(g => g.team === team2).length ?? 0;
      return team1 === member.data.name && gf1-gf2 >= minDif || team2 === member.data.name && gf2-gf1 >= minDif;
    })
    if (wonMatchesByDif.length === 0) return null;
    for (const m of wonMatchesByDif) {
      if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
      if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
    }
    const rivals = [...counts.entries()].map(([r])=>r);
    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          description: `Scored ${minDif}${minDif===3 || minDif===10?'+':''} goals against: ${list}.`
        }
      : null;
  }
});

const makeEliminationAchievements = (
  id: string,
  name: string,
  rarity: Rarity,
  icon: ImageMetadata,
  description: string,
  minEliminations: number
) => ({
  id,
  name,
  icon: icon,
  rarity,
  description: description,
  category: thisCategory,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
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

    const rivals = Object.entries(eliminations).filter(([, count]) => count >= minEliminations);
    if (!rivals.length) return null;
    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r[0]}` : r[0]).join(', ');
    const { evaluate, ...base } = this;
    return {
      ...base,
      description: `Eliminated ${minEliminations}+ times by: ${list}.`
    }
  }
});

const matchesAchievements: Achievement[] = [
  makeMatchesAchievements('3-matches', 'Acquaintances', 'Common', Trophy, 'Awarded for playing 3+ matches against the same rival.', 3),
  makeMatchesAchievements('5-matches', 'Friends', 'Uncommon', Trophy, 'Awarded for playing 5+ matches against the same rival.', 5),
  makeMatchesAchievements('7-matches', 'Mates', 'Rare', Trophy, 'Awarded for playing 7+ matches against the same rival.', 7),
  makeMatchesAchievements('10-matches', 'Lovers', 'Ultra Rare', Trophy, 'Awarded for playing 10+ matches against the same rival.', 10),
  makeMatchesAchievements('15-matches', 'Twin Flames', 'Epic', Trophy, 'Awarded for playing 15+ matches against the same rival.', 15),
];

const winAchievements: Achievement[] = [
  makeWinAchievements('3-wins', 'Edge', 'Mundane', Trophy, 'Awarded for winning 3+ matches against the same rival.', 3),
  makeWinAchievements('5-wins', 'Dominant', 'Worn', Trophy, 'Awarded for winning 5+ matches against the same rival.', 5),
  makeWinAchievements('7-wins', 'Superior', 'Broken', Trophy, 'Awarded for winning 7+ matches against the same rival.', 7),
  makeWinAchievements('10-wins', 'Overlord', 'Cursed', Trophy, 'Awarded for winning 10+ matches against the same rival.', 10),
  makeWinAchievements('15-wins', 'Nemesis', 'Doomed', Trophy, 'Awarded for winning 15+ matches against the same rival.', 15),
];

const lossAchievements: Achievement[] = [
  makeLossAchievements('3-loses', 'Defeated', 'Mundane', Trophy, 'Awarded for losing 3+ matches against the same rival.', 3),
  makeLossAchievements('5-loses', 'Outclassed', 'Worn', Trophy, 'Awarded for losing 5+ matches against the same rival.', 5),
  makeLossAchievements('7-loses', 'Yielded', 'Broken', Trophy, 'Awarded for losing 7+ matches against the same rival.', 7),
  makeLossAchievements('10-loses', 'Crushed', 'Cursed', Trophy, 'Awarded for losing 10+ matches against the same rival.', 10),
  makeLossAchievements('15-loses', 'Destroyed', 'Doomed', Trophy, 'Awarded for losing 15+ matches against the same rival.', 15),
];

const difAchievements: Achievement[] = [
  makeDifAchievements('3-goal-difference', 'Beater', 'Common', Trophy, 'Awarded for winning by a goal difference of 3+.', 3),
  makeDifAchievements('5-goal-difference', 'Stomper', 'Mundane', Trophy, 'Awarded for winning by a goal difference of 5+.', 5),
  makeDifAchievements('6-goal-difference', 'Merciless', 'Worn', Trophy, 'Awarded for winning by a goal difference of 6+.', 6),
  makeDifAchievements('7-goal-difference', 'Killer', 'Broken', Trophy, 'Awarded for winning by a goal difference of 7+.', 7),
  makeDifAchievements('8-goal-difference', 'Slayer', 'Cursed', Trophy, 'Awarded for winning by a goal difference of 8+.', 8),
  makeDifAchievements('9-goal-difference', 'Annihilator', 'Doomed', Trophy, 'Awarded for winning by a goal difference of 9+.', 9),
  makeDifAchievements('10-goal-difference', 'Exterminator', 'Ravaged', Trophy, 'Awarded for winning by a goal difference of 10+.', 10),
];

const eliminationAchievements: Achievement[] = [
  makeEliminationAchievements('3-eliminations', 'Comeback Spark', 'Mundane', Trophy, 'Awarded for being eliminated 3 times by the same team.', 3),
  makeEliminationAchievements('5-eliminations', 'Rally Cry', 'Broken', Trophy, 'Awarded for being eliminated 5 times by the same team.', 5),
  makeEliminationAchievements('7-eliminations', 'Last Stand', 'Doomed', Trophy, 'Awarded for being eliminated 7 times by the same team.', 7),
  makeEliminationAchievements('10-eliminations', 'No Return', 'Ravaged', Trophy, 'Awarded for being eliminated 10 times by the same team.', 10),
];

export const rivalryAchievements = [
  ...baseAchievements,
  ...matchesAchievements,
  ...winAchievements,
  ...difAchievements,
  ...lossAchievements,
  ...eliminationAchievements
];