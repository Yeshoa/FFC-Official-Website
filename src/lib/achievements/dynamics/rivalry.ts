import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import { lockedResult } from '../types';
import { type Category, CATEGORIES, ALIGNMENTS, type Subcategory, type Alignment } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getMemberById } from 'src/utils/memberUtils';
import { getGoalsByTeam, getMatchGoals, getMatchWinnerIncludingPenaltiesId } from 'src/utils/matchUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

const thisCategory = CATEGORIES[3];

function memberNameById(id: number | undefined | null): string {
  if (id === undefined || id === null) return '';
  return getMemberById(id)?.data.name ?? `#${id}`;
}

export const baseAchievements: AchievementDefinition[] = [
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
    evaluate: function (context) {
      const { matches, members, member } = context;
      if (!member.data.verified) return null;
      const memberId = member.data.id;
      // 1) Verified matches
      const verifiedMatches = matches.filter(m => {
        const t1 = getMemberById(m.data.team1Id, members)?.data.verified;
        const t2 = getMemberById(m.data.team2Id, members)?.data.verified;
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
        const diffs: Array<{ winner: number; loser: number; goals: [number,number] }> = [];
        if (team1 - team2 === maxDiff) diffs.push({ winner: m.data.team1Id!, loser: m.data.team2Id!, goals: [team1, team2] });
        if (team2 - team1 === maxDiff) diffs.push({ winner: m.data.team2Id!, loser: m.data.team1Id!, goals: [team2, team1] });
        return diffs.filter(d => getMemberById(d.winner, members)?.data.verified);
      });

      // 4) Si el miembro ganó una de ellas
      let memberBest = 0;
      for (const m of verifiedMatches) {
        if (m.data.team1Id !== memberId && m.data.team2Id !== memberId) continue;
        const { team1, team2 } = getGoalsByTeam(m.data);
        const gf = m.data.team1Id === memberId ? team1 : team2;
        const ga = m.data.team1Id === memberId ? team2 : team1;
        memberBest = Math.max(memberBest, gf - ga);
      }
      if (!biggestWins.some(w => w.winner === memberId)) return lockedResult(this, memberBest, maxDiff);

      const win = biggestWins.find(w => w.winner === memberId)!;
      const opponent = getMemberById(win.loser, members)?.data.name ?? `#${win.loser}`;
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
      return achieved(this, {
        description: `Biggest victory: ${scW}–${scL} vs ${opponent}.`,
        name: newName,
        stars: maxDiff,
        rarity: newRarity,
        current: maxDiff,
        target: maxDiff,
        progress: 100,
        suppresses: [
        '3-goal-difference',
        '5-goal-difference',
        '6-goal-difference',
        '7-goal-difference',
        '8-goal-difference',
        '9-goal-difference',
        /* '10-goal-difference' */]
      });
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
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description,
  category: thisCategory,
  subcategory: "Head-to-Head Played" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (context) {
    const { matches, member } = context;
    const memberId = member.data.id;
    const counts = new Map<number,number>();
      for (const m of matches) {
        if (m.data.team1Id === memberId) counts.set(m.data.team2Id!, (counts.get(m.data.team2Id!)||0)+1);
        if (m.data.team2Id === memberId) counts.set(m.data.team1Id!, (counts.get(m.data.team1Id!)||0)+1);
      }
      const rivalIds = [...counts.entries()].filter(([,c]) => c>=minMatches).map(([r])=>r);
      const rivals = rivalIds.map(memberNameById);
      const newStars = rivals.length;
      const maxCount = counts.size ? Math.max(...counts.values()) : 0;
      const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
      return rivals.length
        ? achieved(this, {
            stars: newStars,
            description: `Played ${minMatches}+ matches against: ${list}.`,
            current: rivals.length,
            target: 1,
            progress: 100,
          })
        : lockedResult(this, maxCount, minMatches);
  }
});

const makeWinAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  description: string,
  minWins: number
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description,
  category: thisCategory,
  subcategory: "Head-to-Head Won" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (context) {
    const { matches, member } = context;
    const memberId = member.data.id;
    const counts = new Map<number,number>();
    const wonMatches = matches.filter(m => {
      const isTeam1 = m.data.team1Id === memberId;
      const isTeam2 = m.data.team2Id === memberId;
      if (!isTeam1 && !isTeam2) return false;
      const { gf, ga } = getMatchGoals(m, memberId);
      return gf > ga;
    })
    for (const m of wonMatches) {
      if (m.data.team1Id === memberId) counts.set(m.data.team2Id!, (counts.get(m.data.team2Id!)||0)+1);
      if (m.data.team2Id === memberId) counts.set(m.data.team1Id!, (counts.get(m.data.team1Id!)||0)+1);
    }
    const rivalIds = [...counts.entries()].filter(([,c]) => c>=minWins).map(([r])=>r);
    const rivals = rivalIds.map(memberNameById);

    const newStars = rivals.length;
    const maxCount = counts.size ? Math.max(...counts.values()) : 0;

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? achieved(this, {
          stars: newStars,
          description: `Won ${minWins}+ matches against: ${list}.`,
          current: rivals.length,
          target: 1,
          progress: 100,
        })
      : lockedResult(this, maxCount, minWins);
  }
});

const makeLossAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  description: string,
  minLosses: number
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description,
  category: thisCategory,
  subcategory: "Head-to-Head Lost" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (context) {
    const { matches, member } = context;
    const memberId = member.data.id;
    const counts = new Map<number,number>();
    const lostMatches = matches.filter(m => {
      const isTeam1 = m.data.team1Id === memberId;
      const isTeam2 = m.data.team2Id === memberId;
      if (!isTeam1 && !isTeam2) return false;
      const { gf, ga } = getMatchGoals(m, memberId);
      return gf < ga;
    })
    for (const m of lostMatches) {
      if (m.data.team1Id === memberId) counts.set(m.data.team2Id!, (counts.get(m.data.team2Id!)||0)+1);
      if (m.data.team2Id === memberId) counts.set(m.data.team1Id!, (counts.get(m.data.team1Id!)||0)+1);
    }
    const rivalIds = [...counts.entries()].filter(([,c]) => c>=minLosses).map(([r])=>r);
    const rivals = rivalIds.map(memberNameById);
    const newStars = rivals.length;
    const maxCount = counts.size ? Math.max(...counts.values()) : 0;

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? achieved(this, {
          stars: newStars,
          description: `Lost ${minLosses}+ matches against: ${list}.`,
          current: rivals.length,
          target: 1,
          progress: 100,
        })
      : lockedResult(this, maxCount, minLosses);
  }
});

const makeDifAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  description: string,
  minDif: number
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description,
  category: thisCategory,
  subcategory: "Head-to-Head Goal Difference" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (context) {
    const { matches, member } = context;
    const memberId = member.data.id;
    const counts = new Map<number,number>();
    const wonMatchesByDif = matches.filter(m => {
      const isTeam1 = m.data.team1Id === memberId;
      const isTeam2 = m.data.team2Id === memberId;
      if (!isTeam1 && !isTeam2) return false;
      const { gf, ga } = getMatchGoals(m, memberId);
      return gf - ga >= minDif;
    })
    let maxDifScored = 0;
    for (const m of matches) {
      if (m.data.team1Id !== memberId && m.data.team2Id !== memberId) continue;
      const { gf, ga } = getMatchGoals(m, memberId);
      maxDifScored = Math.max(maxDifScored, gf - ga);
    }
    if (wonMatchesByDif.length === 0) return lockedResult(this, maxDifScored, minDif);
    for (const m of wonMatchesByDif) {
      if (m.data.team1Id === memberId) counts.set(m.data.team2Id!, (counts.get(m.data.team2Id!)||0)+1);
      if (m.data.team2Id === memberId) counts.set(m.data.team1Id!, (counts.get(m.data.team1Id!)||0)+1);
    }
    const rivalIds = [...counts.entries()].map(([r])=>r);
    const rivals = rivalIds.map(memberNameById);
    const newStars = rivals.length;

    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return rivals.length
      ? achieved(this, {
          stars: newStars,
          description: `Won by ${minDif}${minDif===3 || minDif===10?'+':''} goals against: ${list}.`,
          current: rivals.length,
          target: 1,
          progress: 100,
        })
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
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description,
  category: thisCategory,
  subcategory: "Head-to-Head Eliminations" as Subcategory,
  alignment: ALIGNMENTS[1],
  unique: false,
  visible: true,
  enabled: true,
stars: 1,
  evaluate: function (context) {
    const { matches, member } = context;
    const memberId = member.data.id;
    const eliminations: Record<number, number> = {};
    for (const m of matches) {
      if (m.data.stage !== 'knockout') continue;
      if (m.data.status !== 'played') continue;

      const winnerId = getMatchWinnerIncludingPenaltiesId(m.data);
      if (winnerId === null) continue;
      const loserId = winnerId === m.data.team1Id ? m.data.team2Id : m.data.team1Id;

      if (loserId === memberId) {
        eliminations[winnerId] = (eliminations[winnerId] ?? 0) + 1;
      }
    }

    const rivalIds = Object.keys(eliminations).map(Number).filter(id => eliminations[id] >= minEliminations);
    const rivals = rivalIds.map(memberNameById);
    const newStars = rivals.length;
    const maxCount = Object.values(eliminations).length ? Math.max(...Object.values(eliminations)) : 0;
    if (!rivals.length) return lockedResult(this, maxCount, minEliminations);
    const list = rivals.map((r, i, arr) => i === arr.length - 1 && rivals.length > 1 ? ` and ${r}` : r).join(', ');
    return achieved(this, {
      stars: newStars,
      description: `Eliminated ${minEliminations}+ times by: ${list}.`,
      current: rivals.length,
      target: 1,
      progress: 100,
    });
  }
});

const matchesAchievements: AchievementDefinition[] = [
  makeMatchesAchievements('3-matches', 'Acquaintances', 0, Trophy, 'Awarded for playing 3+ matches against the same rival.', 3),
  makeMatchesAchievements('5-matches', 'Friends', 1, Trophy, 'Awarded for playing 5+ matches against the same rival.', 5),
  makeMatchesAchievements('7-matches', 'Mates', 2, Trophy, 'Awarded for playing 7+ matches against the same rival.', 7),
  makeMatchesAchievements('10-matches', 'Lovers', 3, Trophy, 'Awarded for playing 10+ matches against the same rival.', 10),
  makeMatchesAchievements('15-matches', 'Twin Flames', 4, Trophy, 'Awarded for playing 15+ matches against the same rival.', 15),
];

const winAchievements: AchievementDefinition[] = [
  makeWinAchievements('3-wins', 'Edge', 1, Trophy, 'Awarded for winning 3+ matches against the same rival.', 3),
  makeWinAchievements('5-wins', 'Dominant', 2, Trophy, 'Awarded for winning 5+ matches against the same rival.', 5),
  makeWinAchievements('7-wins', 'Superior', 3, Trophy, 'Awarded for winning 7+ matches against the same rival.', 7),
  makeWinAchievements('10-wins', 'Overlord', 4, Trophy, 'Awarded for winning 10+ matches against the same rival.', 10),
  makeWinAchievements('15-wins', 'Nemesis', 5, Trophy, 'Awarded for winning 15+ matches against the same rival.', 15),
];

const lossAchievements: AchievementDefinition[] = [
  makeLossAchievements('3-losses', 'Defeated', 1, Trophy, 'Awarded for losing 3+ matches against the same rival.', 3),
  makeLossAchievements('5-losses', 'Outclassed', 2, Trophy, 'Awarded for losing 5+ matches against the same rival.', 5),
  makeLossAchievements('7-losses', 'Yielded', 3, Trophy, 'Awarded for losing 7+ matches against the same rival.', 7),
  makeLossAchievements('10-losses', 'Crushed', 4, Trophy, 'Awarded for losing 10+ matches against the same rival.', 10),
  makeLossAchievements('15-losses', 'Destroyed', 5, Trophy, 'Awarded for losing 15+ matches against the same rival.', 15),
];

const difAchievements: AchievementDefinition[] = [
  makeDifAchievements('3-goal-difference', 'Beater', 0, Trophy, 'Awarded for winning by a goal difference of 3+.', 3),
  makeDifAchievements('5-goal-difference', 'Stomper', 1, Trophy, 'Awarded for winning by a goal difference of 5+.', 5),
  makeDifAchievements('6-goal-difference', 'Merciless', 2, Trophy, 'Awarded for winning by a goal difference of 6+.', 6),
  makeDifAchievements('7-goal-difference', 'Killer', 3, Trophy, 'Awarded for winning by a goal difference of 7+.', 7),
  makeDifAchievements('8-goal-difference', 'Slayer', 4, Trophy, 'Awarded for winning by a goal difference of 8+.', 8),
  makeDifAchievements('9-goal-difference', 'Annihilator', 5, Trophy, 'Awarded for winning by a goal difference of 9+.', 9),
  // makeDifAchievements('10-goal-difference', 'Exterminator', 6, Trophy, 'Awarded for winning by a goal difference of 10+.', 10),
];

const eliminationAchievements: AchievementDefinition[] = [
  makeEliminationAchievements('3-eliminations', 'Comeback Spark', 1, Trophy, 'Awarded for being eliminated 3 times by the same team.', 3),
  makeEliminationAchievements('5-eliminations', 'Rally Cry', 3, Trophy, 'Awarded for being eliminated 5 times by the same team.', 5),
  makeEliminationAchievements('7-eliminations', 'Last Stand', 5, Trophy, 'Awarded for being eliminated 7 times by the same team.', 7),
  makeEliminationAchievements('10-eliminations', 'No Return', 6, Trophy, 'Awarded for being eliminated 10 times by the same team.', 10),
];

export const rivalryAchievements: AchievementDefinition[] = [
  ...baseAchievements,
  ...matchesAchievements,
  ...winAchievements,
  ...difAchievements,
  ...lossAchievements,
  ...eliminationAchievements
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
