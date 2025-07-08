import { getCollection } from 'astro:content';
import type { InferEntrySchema, CollectionEntry } from 'astro:content';
import Trophy from '@images/achievements/king.webp';
import type { ImageMetadata } from 'astro';
import { getGoalsByTeam, getMatchWinner } from './matchUtils';
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
  rarity: 'Doomed'|'Cursed'|'Common'|'Uncommon'|'Rare'|'Ultra Rare'|'Epic'|'Legendary'|'Godlike';
}

/** Dynamic achievement definitions */
const _dynamicDefs: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (allMatches: Match[], allTournaments: Tournament[], member: Member, members: Member[]) => Achievement | null;
}[] = [
  /* {
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
  }, */
  {
    id: 'host',
    rarity: 'Uncommon',
    name: 'Host',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    evaluate: (matches, tournaments, member) => {
      const h = tournaments.find(t => t.data.host === member.data.name);
      return h
        ? {
            id: 'host',
            name: 'Host',
            icon: Trophy,
            rarity: 'Uncommon',
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
    rarity: 'Cursed',
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
    id: 'invictus',
    rarity: 'Epic',
    name: 'Invictus',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup without losing a single match.',
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
    description: 'Awarded for winning a Forest Cup with a perfect record (all wins).',
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
    id: 'awarded',
    rarity: 'Rare',
    name: 'Awarded',
    icon: Trophy,
    description: 'Won a Forest Cup, a Golden Ball, a Golden Glove, and a Golden Boot.',
    evaluate: (matches, tournaments, member) => {
      const hasTrick = tournaments.some(t =>
        t.data.champion === member.data.name &&
        t.data.prizes?.bestPlayer?.team === member.data.name &&
        Array.isArray(t.data.prizes?.topScorer) &&
        t.data.prizes.topScorer.some(ts => ts.team === member.data.name) && 
        t.data.prizes?.bestGoalkeeper?.team === member.data.name
      );

      if (hasTrick) {
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
      const edition = tournaments.find(t =>
        t.data.champion === member.data.name &&
        t.data.prizes?.bestPlayer?.team === member.data.name &&
        Array.isArray(t.data.prizes?.topScorer) &&
        t.data.prizes!.topScorer.length > 0 &&
        t.data.prizes!.topScorer.some(ts => ts.team === member.data.name) && 
        t.data.prizes?.bestGoalkeeper?.team === member.data.name
      );
      return edition
        ? {
            id: 'poker',
            name: 'Poker',
            icon: Trophy,
            rarity: 'Ultra Rare',
            description: `Won the Cup, Golden Ball, Golden Glove and Golden Boot in FC ${edition.data.edition}.`
          }
        : null;
    }
  },
  {
    id: 'golden-boot',
    rarity: 'Rare',
    name: 'Golden Boot',
    icon: Trophy,
    description: 'Awarded for winning the Golden Boot in a Forest Cup.',
    evaluate: (matches, tournaments, member) => {
      const tour = tournaments.find(t =>
        Array.isArray(t.data.prizes?.topScorer) &&
        t.data.prizes!.topScorer.some(ts => ts.team === member.data.name)
      );
      if (!tour) return null;

      const winner = tour.data.prizes!.topScorer.find(ts => ts.team === member.data.name)!;
      return {
        id: 'golden-boot',
        name: 'Golden Boot',
        icon: Trophy,
        rarity: 'Rare',
        description: `Player ${winner.player} won the Golden Boot in FC ${tour.data.edition}.`
      };
    }
  },
  /* {
    id: 'verified',
    rarity: 'Common',
    name: 'Verified',
    icon: Trophy,
    evaluate: (matches, tournaments, member) => {
      if (!member.data.verified) return null;
      return {
        id: 'verified',
        name: 'Verified',
        icon: Trophy,
        rarity: 'Common',
        description: `Member is verified.`
      };
    }
  }, */
  {
    id: 'double-champion',
    rarity: 'Legendary',
    name: 'Dynasty',
    icon: Trophy,
    description: 'Awarded for winning two Forest Cups.',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length === 2) {
        const years = won.map(w => w.data.edition).join(', ');
        return {
          id: 'double-champion',
          name: 'Dynasty',
          icon: Trophy,
          rarity: 'Legendary',
          description: `Won two Forest Cups (${years}).`
        };
      }
      return null;
    }
  },
  {
    id: 'triple-champion',
    rarity: 'Godlike',
    name: 'Overlord',
    icon: Trophy,
    description: 'Awarded for winning three Forest Cups.',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length === 3) {
        const years = won.map(w => w.data.edition).join(', ');
        return {
          id: 'triple-champion',
          name: 'Overlord',
          icon: Trophy,
          rarity: 'Godlike',
          description: `Won three Forest Cups (${years}).`
        };
      }
      return null;
    }
  },
  {
    id: 'winless',
    rarity: 'Cursed',
    name: 'Winless',
    icon: Trophy,
    description: 'Participated in Forest Cups but never won a match.',
    evaluate: (matches, tournaments, member) => {
      const played = matches.filter(m =>
        [m.data.team1, m.data.team2].includes(member.data.name)
      );

      const wins = played.filter(m => {
        const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
        const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
        return gf > ga;
      });

      if (played.length && wins.length === 0) {
        return {
          id: 'winless',
          name: 'Winless',
          icon: Trophy,
          rarity: 'Cursed',
          description: `Participated in Forest Cups but never won a match.`
        };
      }

      return null;
    }
  },
  {
    id: 'goal-famine',
    rarity: 'Doomed',
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
  {
    id: 'longest-win-streak',
    rarity: 'Epic',
    name: 'Unstoppable',
    icon: Trophy,
    description: 'Awarded for achieving the longest win streak among all members.',
    evaluate: (matches, _, member, members) => {
      function getWinStreak(memberName) {
        let streak = 0;
        let maxStreak = 0;
  
        const games = matches
          .filter(m => m.data.team1 === memberName|| m.data.team2 === memberName)
          .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());
  
        for (const m of games) {
          const goals = m.data.goals ?? [];
          const gf = goals.filter(g => g.team === memberName).length ?? 0;
          const ga = goals.filter(g => g.team !== memberName).length ?? 0;
  
          if (gf > ga) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
          } else {
            streak = 0;
          }
        }
        return maxStreak;
      }

      const streaks = members.map(m => ({
        name: m.data.name,
        value: getWinStreak(m.data.name)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getWinStreak(member.data.name);

      if (current === max) {
        return {
            id: 'longest-win-streak',
            name: 'Unstoppable',
            icon: Trophy,
            rarity: 'Epic',
            description: `Achieved a win streak of ${max} matches.`
          };
      }
      return null;
    }
  },
  {
    id: 'longest-unbeaten-streak',
    rarity: 'Ultra Rare',
    name: 'Invincible',
    icon: Trophy,
    description: 'Awarded for achieving the longest unbeaten streak among all members.',
    evaluate: (matches, _, member, members) => {
      function getUnbeatenStreak(memberName) {
        let streak = 0;
        let maxStreak = 0;

        const playedMatches = matches
          .filter(m => [m.data.team1, m.data.team2].includes(memberName) && m.data.status === 'played')
          .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));

        for (const match of playedMatches) {
          const { goals } = match.data;
          const gf = goals?.filter(g => g.team === memberName).length ?? 0;
          const ga = goals?.filter(g => g.team !== memberName).length ?? 0;

          const lost = gf < ga;
          if (!lost) {
            streak++;
            if (streak > maxStreak) maxStreak = streak;
          } else {
            streak = 0;
          }
        }
        return maxStreak;
      }

      const streaks = members.map(m => ({
        name: m.data.name,
        value: getUnbeatenStreak(m.data.name)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getUnbeatenStreak(member.data.name);
      if (current === max) {
        return {
            id: 'longest-unbeaten-streak',
            name: 'Invincible',
            icon: Trophy,
            rarity: 'Ultra Rare',
            description: `Stayed unbeaten for ${max} matches in a row.`
          };
      }
      return null;
    }
  },
  {
    id: 'longest-loss-streak',
    rarity: 'Doomed',
    name: 'Hopeless',
    icon: Trophy,
    description: 'Awarded for suffering the longest losing streak among all members.',
    evaluate: (matches, _, member, members) => {
      function getLossStreak(memberName) {
        let streak = 0;
        let maxStreak = 0;
  
        const playedMatches = matches
          .filter(m => [m.data.team1, m.data.team2].includes(memberName))
          .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());
  
        for (const match of playedMatches) {
          const { goals } = match.data;
          const gf = goals?.filter(g => g.team === memberName).length ?? 0;
          const ga = goals?.filter(g => g.team !== memberName).length ?? 0;

          const lost = gf < ga;
          if (lost) {
            streak++;
            if (streak > maxStreak) maxStreak = streak;
          } else {
            streak = 0;
          }
        }
        return maxStreak;
      }

      const streaks = members.map(m => ({
        name: m.data.name,
        value: getLossStreak(m.data.name)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getLossStreak(member.data.name);

      if (current === max)
        return {
          id: 'longest-loss-streak',
          name: 'Hopeless',
          icon: Trophy,
          rarity: 'Cursed',
          description: `Lost ${max} matches in a row.`
        } 
       return null;
    }
  },
  {
    id: 'enemy',
    rarity: 'Cursed',
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

// Ordenar por rareza y luego por nombre
const rarityOrder = [
  'Doomed', 'Cursed', 'Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Epic', 'Legendary', 'Godlike'
];

export const dynamicDefs = [..._dynamicDefs].sort((a, b) => {
  const rA = rarityOrder.findIndex(r => r.toLowerCase() === a.rarity.toLowerCase());
  const rB = rarityOrder.findIndex(r => r.toLowerCase() === b.rarity.toLowerCase());
  if (rA !== rB) return rA - rB;
  return a.name.localeCompare(b.name);
});

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

  // Unir y ordenar por rareza y nombre
  const all = [...manual, ...dynamic];
  const rarityOrder = [
    'Doomed', 'Cursed', 'Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Epic', 'Legendary', 'Godlike'
  ];
  all.sort((a, b) => {
    const rA = rarityOrder.findIndex(r => r.toLowerCase() === a.rarity.toLowerCase());
    const rB = rarityOrder.findIndex(r => r.toLowerCase() === b.rarity.toLowerCase());
    if (rA !== rB) return rA - rB;
    return a.name.localeCompare(b.name);
  });
  return all;
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
