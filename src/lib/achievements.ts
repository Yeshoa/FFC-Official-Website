import { getCollection } from 'astro:content';
import type { InferEntrySchema, CollectionEntry } from 'astro:content';
import Trophy from '@images/achievements/king.webp';
import type { ImageMetadata } from 'astro';
import { getGoalsByTeam } from './matchUtils';
import { getMemberByName } from './memberUtils';

type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type StaticAch = CollectionEntry<'achievements'>;
/* type Match = InferEntrySchema<'matches'>;
type Tournament = InferEntrySchema<'tournaments'>;
type Member = InferEntrySchema<'members'>;
type StaticAch = InferEntrySchema<'achievements'>; */
const memberCollection = await getCollection('members');

export interface Achievement {
  id: string;
  name: string;
  icon: ImageMetadata;
  description: string;
  rarity: 'Common'|'Uncommon'|'Rare'|'Ultra Rare'|'Epic'|'Legendary';
}

/** Dynamic achievement definitions */
export const dynamicDefs: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  evaluate: (allMatches: Match[], allTournaments: Tournament[], member: Member, members: Member[]) => Achievement | null;
}[] = [
  {
    id: 'champion',
    rarity: 'Ultra Rare',
    name: 'Champion',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.find(t => t.data.champion === member.data.name);
      return won
        ? {
            id: 'champion',
            name: 'Champion',
            icon: Trophy,
            rarity: 'Ultra Rare',
            description: `Won the Forest Cup ${won.data.edition}.`
          }
        : null;
    }
  },
  {
    id: 'host',
    rarity: 'Rare',
    name: 'Host',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const h = tournaments.find(t => t.data.host === member.data.name);
      return h
        ? {
            id: 'host',
            name: 'Host',
            icon: Trophy,
            rarity: 'Rare',
            description: `Hosted the Forest Cup ${h.data.edition}.`
          }
        : null;
    }
  },
  {
    id: 'all-time-scorer',
    rarity: 'Ultra Rare',
    name: 'All‑Time Scorer',
    icon: Trophy,
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
    id: 'mvp',
    rarity: 'Rare',
    name: 'MVP',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t => t.data.prizes?.bestPlayer?.team === member.data.code);
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
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t => t.data.prizes?.bestGoalkeeper?.team === member.data.code);
      if (!tour) return null;
      const keeper = tour.data.prizes!.bestGoalkeeper!.player;
      return {
        id: 'wall',
        name: 'Wall',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${keeper} won the Golden Glove in FC ${tour.data.edition}.`
      };
    }
  },
  {
    id: 'rivalry',
    rarity: 'Common',
    name: 'Rivalry',
    icon: Trophy,
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
    id: 'nemesis',
    rarity: 'Uncommon',
    name: 'Nemesis',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const counts = new Map<string,number>();
      for (const m of matches) {
        if (m.data.team1 === member.data.name) counts.set(m.data.team2, (counts.get(m.data.team2)||0)+1);
        if (m.data.team2 === member.data.name) counts.set(m.data.team1, (counts.get(m.data.team1)||0)+1);
      }
      const nem = [...counts.entries()].filter(([,c]) => c>=7).map(([r])=>r);
      return nem.length
        ? {
            id: 'nemesis',
            name: 'Nemesis',
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
    rarity: 'Uncommon',
    name: 'Underdog',
    icon: Trophy,
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
            rarity: 'Common',
            description: `Lost 3+ matches against: ${underdogs.join(', ')}.`
          }
        : null;
    }
  },
  {
    id: 'invictus',
    rarity: 'Epic',
    name: 'Invictus',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion===member.data.name);
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id===t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const lost = played.some(m => {
          const goalsFor = m.data.goals?.filter(g=>g.team===member.data.name).length ??0;
          const goalsAgainst = m.data.goals?.filter(g=>g.team!==member.data.name).length ??0;
          return goalsAgainst>goalsFor;
        });
        if (!lost)
          return {
            id: 'invictus',
            name: 'Invictus',
            icon: Trophy,
            rarity: 'Epic',
            description: `Won a Forest Cup (${t.data.edition}) without losing a single match.`
          };
      }
      return null;
    }
  },
  {
    id: 'perfect-champion',
    rarity: 'Legendary',
    name: 'Flawless',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion===member.data.name);
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id===t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const wins = played.filter(m => {
          const gf = m.data.goals?.filter(g=>g.team===member.data.name).length ??0;
          const ga = m.data.goals?.filter(g=>g.team!==member.data.name).length ??0;
          return gf>ga;
        }).length;
        if (wins === played.length)
          return {
            id: 'perfect-champion',
            name: 'Flawless',
            icon: Trophy,
            rarity: 'Legendary',
            description: `Won a Forest Cup (${t.data.edition}) with a perfect record (${wins}-${played.length-wins}).`
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
    id: 'hat-trick',
    rarity: 'Ultra Rare',
    name: 'Hat‑Trick',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const edition = tournaments.find(t =>
        t.data.champion === member.data.code &&
        t.data.prizes?.bestPlayer?.team === member.data.code &&
        Array.isArray(t.data.prizes?.topScorer) &&
        t.data.prizes!.topScorer.length > 0 &&
        t.data.prizes!.topScorer.some(ts => ts.team === member.data.code)
      );
      return edition
        ? {
            id: 'hat-trick',
            name: 'Hat‑Trick',
            icon: Trophy,
            rarity: 'Ultra Rare',
            description: `Won the Cup, Golden Ball and Golden Boot in FC ${edition.data.edition}.`
          }
        : null;
    }
  },
  {
    id: 'golden-boot',
    rarity: 'Rare',
    name: 'Golden Boot',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t =>
        Array.isArray(t.data.prizes?.topScorer) &&
        t.data.prizes!.topScorer.some(ts => ts.team === member.data.code)
      );
      if (!tour) return null;

      const winner = tour.data.prizes!.topScorer.find(ts => ts.team === member.data.code)!;
      return {
        id: 'golden-boot',
        name: 'Golden Boot',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${winner.player} won the Golden Boot in FC ${tour.data.edition}.`
      };
    }
  },
];

/**
 * Returns both manual (static) and dynamic achievements for a given member name.
 */
export async function getAchievementsForMember(name: string): Promise<Achievement[]> {
  const [staticAch, matches, tournaments, members] = await Promise.all([
    getCollection('achievements'),
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('members'),
  ]);

  const member = members.find(m => m.data.name === name);
  if (!member) return [];

  // 1) Dynamic
  const dynamic = dynamicDefs
    .map(def => def.evaluate(matches, tournaments, member, members))
    .filter((a): a is Achievement => !!a);

  // 2) Manual – suppose you have a field `member.data.manualAchievements: string[]`
  const manualIds: string[] = (member.data as any).manualAchievements || [];
  const manual = staticAch
    .filter(a => manualIds.includes(a.data.id))
    .map(a => ({
      id: a.id,
      name: a.data.name,
      icon: a.data.icon,
      description: a.data.description,
      rarity: a.data.rarity as Achievement['rarity'],
    }));
  // Merge and return
  return [...manual, ...dynamic];
}

/**
 * Obtiene todos los miembros que tienen un logro específico dado su ID.
 * @param achievementId - El ID del logro a buscar.
 * @returns Una promesa que resuelve en una lista de miembros con el logro especificado.
 */
export async function getMembersWithAchievement(achievementId: string): Promise<Member[]> {
  // Obtener todas las colecciones necesarias
  const [members, matches, tournaments, staticAch] = await Promise.all([
    getCollection('members'),
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('achievements'),
  ]);

  const membersWithAchievement: Member[] = [];

  // Iterar sobre cada miembro
  for (const member of members) {
    // Evaluar logros dinámicos
    const dynamicAchievements = dynamicDefs
      .map(def => def.evaluate(matches, tournaments, member, members))
      .filter((a): a is Achievement => !!a);

    // Obtener logros manuales
    const manualIds: string[] = (member.data as any).manualAchievements || [];
    const manualAchievements = staticAch
      .filter(a => manualIds.includes(a.data.id))
      .map(a => ({
        id: a.data.id,
        name: a.data.name,
        icon: a.data.icon,
        description: a.data.description,
        rarity: a.data.rarity as Achievement['rarity'],
      }));

    // Combinar ambos tipos de logros
    const allAchievements = [...manualAchievements, ...dynamicAchievements];

    // Verificar si el logro específico está presente
    if (allAchievements.some(ach => ach.id === achievementId)) {
      membersWithAchievement.push(member);
    }
  }

  return membersWithAchievement;
}
