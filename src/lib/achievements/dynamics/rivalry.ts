import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Category, CATEGORIES, ALIGNMENTS, type Subcategory, type Alignment } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinnerIncludingPenalties } from '@lib/matchUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;

const thisCategory = CATEGORIES[3];

export const baseAchievements: {
  id: string;
  rarity: number;
  name: string;
  icon: ImageMetadata;
  description: string;
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;
  stars?: number;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'biggest-win',
    rarity: 6,
    name: 'Judgement Day',
    icon: Trophy,
    description: 'Awarded for achieving the largest goal difference victory.',
    category: thisCategory,
    subcategory: "Head-to-Head Goal Difference" as Subcategory,
    alignment: ALIGNMENTS[1],
    visible: true,
    unique: true,
    enabled: true,
    stars: 1,
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
      if (!biggestWins.some(w => w.winner === member.data.name)) return null;

      const win = biggestWins.find(w => w.winner === member.data.name)!;
      const opponent = win.loser;
      const [scW, scL] = win.goals;

      const maxMinDif = Math.max(...difAchievements.map(ach => parseInt(ach.id.split('-')[0], 10)));
      let newRarity = this.rarity; 
      let newName = this.name; // Default a "Judgement Day"
      if (maxDiff <= maxMinDif) {
        for (const ach of difAchievements) {
          const minDif = parseInt(ach.id.split('-')[0], 10);
          if (maxDiff >= minDif) {
            newRarity = ach.rarity + 1; // Subirle la rareza del logro
            newName = ach.name; // EN ESTE CASO ESPECIFICO NO IMPORTA USAR EL MISMO
          } else {
            // newName = ach.name; // EN ESTE CASO USA EL NOMBRE DEL SIGUIENTE
            break; // Parar cuando maxDiff es menor que minDif
          }
        }
      }
      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Biggest victory: ${scW}–${scL} vs ${opponent}.`,
        name: newName,
        stars: maxDiff,
        rarity: newRarity,
        suppresses: [
        '3-goal-difference',
        '5-goal-difference',
        '6-goal-difference',
        '7-goal-difference',
        '8-goal-difference',
        '9-goal-difference',
        /* '10-goal-difference' */]
      };
    }
  },
];

const makeMatchesAchievements = (
  id: string,
  name: string,
  rarity: number,
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
  subcategory: "Head-to-Head Played" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
    const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const rivals = [...counts.entries()].filter(([,c]) => c>=minMatches).map(([r])=>r);
      const newStars = rivals.length;
      // const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas
      const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
      return rivals.length
        ? {
            ...base,
            stars: newStars,
            description: `Played ${minMatches}+ matches against: ${list}.`
          }
        : null;
  }
});

const makeWinAchievements = (
  id: string,
  name: string,
  rarity: number,
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
  subcategory: "Head-to-Head Won" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
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

    const newStars = rivals.length;
    // const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          stars: newStars,
          description: `Won ${minWins}+ matches against: ${list}.`
        }
      : null;
  }
});

const makeLossAchievements = (
  id: string,
  name: string,
  rarity: number,
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
  subcategory: "Head-to-Head Lost" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
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
    const newStars = rivals.length;
    // const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          stars: newStars,
          description: `Lost ${minLosses}+ matches against: ${list}.`
        }
      : null;
  }
});

const makeDifAchievements = (
  id: string,
  name: string,
  rarity: number,
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
  subcategory: "Head-to-Head Goal Difference" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
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
    const newStars = rivals.length;
    // const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? {
          ...base,
          stars: newStars,
          description: `Won by ${minDif}${minDif===3 || minDif===10?'+':''} goals against: ${list}.`
        }
      : null;
  }
});

const makeEliminationAchievements = (
  id: string,
  name: string,
  rarity: number,
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
  subcategory: "Head-to-Head Eliminations" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const eliminations: Record<string, number> = {};
    const { evaluate, ...base } = this;
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
    const newStars = rivals.length;
    // const displayStars = ((newStars - 1) % 8) + 1; // max 8 estrellas
    if (!rivals.length) return null;
    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r[0]}` : r[0]).join(', ');
    return {
      ...base,
      stars: newStars,
      description: `Eliminated ${minEliminations}+ times by: ${list}.`
    }
  }
});

const matchesAchievements: Achievement[] = [
  makeMatchesAchievements('3-matches', 'Acquaintances', 0, Trophy, 'Awarded for playing 3+ matches against the same rival.', 3),
  makeMatchesAchievements('5-matches', 'Friends', 1, Trophy, 'Awarded for playing 5+ matches against the same rival.', 5),
  makeMatchesAchievements('7-matches', 'Mates', 2, Trophy, 'Awarded for playing 7+ matches against the same rival.', 7),
  makeMatchesAchievements('10-matches', 'Lovers', 3, Trophy, 'Awarded for playing 10+ matches against the same rival.', 10),
  makeMatchesAchievements('15-matches', 'Twin Flames', 4, Trophy, 'Awarded for playing 15+ matches against the same rival.', 15),
];

const winAchievements: Achievement[] = [
  makeWinAchievements('3-wins', 'Edge', 1, Trophy, 'Awarded for winning 3+ matches against the same rival.', 3),
  makeWinAchievements('5-wins', 'Dominant', 2, Trophy, 'Awarded for winning 5+ matches against the same rival.', 5),
  makeWinAchievements('7-wins', 'Superior', 3, Trophy, 'Awarded for winning 7+ matches against the same rival.', 7),
  makeWinAchievements('10-wins', 'Overlord', 4, Trophy, 'Awarded for winning 10+ matches against the same rival.', 10),
  makeWinAchievements('15-wins', 'Nemesis', 5, Trophy, 'Awarded for winning 15+ matches against the same rival.', 15),
];

const lossAchievements: Achievement[] = [
  makeLossAchievements('3-losses', 'Defeated', 1, Trophy, 'Awarded for losing 3+ matches against the same rival.', 3),
  makeLossAchievements('5-losses', 'Outclassed', 2, Trophy, 'Awarded for losing 5+ matches against the same rival.', 5),
  makeLossAchievements('7-losses', 'Yielded', 3, Trophy, 'Awarded for losing 7+ matches against the same rival.', 7),
  makeLossAchievements('10-losses', 'Crushed', 4, Trophy, 'Awarded for losing 10+ matches against the same rival.', 10),
  makeLossAchievements('15-losses', 'Destroyed', 5, Trophy, 'Awarded for losing 15+ matches against the same rival.', 15),
];

const difAchievements: Achievement[] = [
  makeDifAchievements('3-goal-difference', 'Beater', 0, Trophy, 'Awarded for winning by a goal difference of 3+.', 3),
  makeDifAchievements('5-goal-difference', 'Stomper', 1, Trophy, 'Awarded for winning by a goal difference of 5+.', 5),
  makeDifAchievements('6-goal-difference', 'Merciless', 2, Trophy, 'Awarded for winning by a goal difference of 6+.', 6),
  makeDifAchievements('7-goal-difference', 'Killer', 3, Trophy, 'Awarded for winning by a goal difference of 7+.', 7),
  makeDifAchievements('8-goal-difference', 'Slayer', 4, Trophy, 'Awarded for winning by a goal difference of 8+.', 8),
  makeDifAchievements('9-goal-difference', 'Annihilator', 5, Trophy, 'Awarded for winning by a goal difference of 9+.', 9),
  // makeDifAchievements('10-goal-difference', 'Exterminator', 6, Trophy, 'Awarded for winning by a goal difference of 10+.', 10),
];

const eliminationAchievements: Achievement[] = [
  makeEliminationAchievements('3-eliminations', 'Comeback Spark', 1, Trophy, 'Awarded for being eliminated 3 times by the same team.', 3),
  makeEliminationAchievements('5-eliminations', 'Rally Cry', 3, Trophy, 'Awarded for being eliminated 5 times by the same team.', 5),
  makeEliminationAchievements('7-eliminations', 'Last Stand', 5, Trophy, 'Awarded for being eliminated 7 times by the same team.', 7),
  makeEliminationAchievements('10-eliminations', 'No Return', 6, Trophy, 'Awarded for being eliminated 10 times by the same team.', 10),
];

export const rivalryAchievements = [
  ...baseAchievements,
  ...matchesAchievements,
  ...winAchievements,
  ...difAchievements,
  ...lossAchievements,
  ...eliminationAchievements
];