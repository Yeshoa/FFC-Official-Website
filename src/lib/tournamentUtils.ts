import type { CollectionEntry } from 'astro:content';
import { getMatchResult } from './matchUtils';

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

// 🟩 Obtener estadísticas por torneo para un equipo
export function getTeamStatsInTournament(
  teamName: string,
  tournamentId: number,
  matches: MatchEntry[]
) {
  const relevantMatches = matches.filter(
    m =>
      m.data.tournament_id === tournamentId &&
      m.data.status === 'played' &&
      (m.data.team1 === teamName || m.data.team2 === teamName)
  );

  let stats = {
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };

  for (const match of relevantMatches) {
    const { team1, team2 } = match.data;
    const { team1: g1, team2: g2 } = getMatchResult(match.data);

    const isTeam1 = team1 === teamName;
    const gf = isTeam1 ? g1 : g2;
    const ga = isTeam1 ? g2 : g1;

    stats.played++;
    stats.goalsFor += gf;
    stats.goalsAgainst += ga;

    if (gf > ga) {
      stats.won++;
      stats.points += 3;
    } else if (gf === ga) {
      stats.draw++;
      stats.points += 1;
    } else {
      stats.lost++;
    }
  }

  return {
    ...stats,
    gd: stats.goalsFor - stats.goalsAgainst,
    pr: stats.played > 0 ? ((stats.points / (stats.played * 3)) * 100).toFixed(2) : '0.00',
  };
}

// 🟦 Obtener el máximo goleador del equipo en un torneo
export function getTopScorerOfTeamInTournament(
  teamName: string,
  tournamentId: number,
  matches: MatchEntry[]
): string {
  const relevantGoals = matches.flatMap(match => {
    if (
      match.data.tournament_id !== tournamentId ||
      match.data.status !== 'played' ||
      !match.data.goals
    ) return [];

    return match.data.goals.filter(goal => goal.team === teamName && goal.player);
  });

  const scorerMap: Record<string, number> = {};
  for (const goal of relevantGoals) {
    if (!goal.player) continue;
    scorerMap[goal.player] = (scorerMap[goal.player] || 0) + 1;
  }

  const top = Object.entries(scorerMap).sort((a, b) => b[1] - a[1])[0];
  return top ? `${top[0]} (${top[1]})` : '';
}

// 🟨 Obtener la posición final de un equipo en un torneo
export function getTeamPositionInTournament(
  tournament: TournamentEntry,
  matches: MatchEntry[],
  teamName: string
): number | null {
  const otherTeams = tournament.data.participants;
  const standings = otherTeams.map(name => ({
    name,
    ...getTeamStatsInTournament(name, tournament.data.id, matches)
  }));

  const sorted = standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  const index = sorted.findIndex(t => t.name === teamName);
  return index >= 0 ? index + 1 : null;
}

// 🟥 Obtener la ronda final alcanzada por el equipo
export function getTeamFinalResult(
  teamName: string,
  tournament: TournamentEntry,
  matches: MatchEntry[]
): string {
  const relevantMatches = matches
    .filter(
      m =>
        m.data.tournament_id === tournament.data.id &&
        m.data.status === 'played' &&
        (m.data.team1 === teamName || m.data.team2 === teamName)
    )
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  if (relevantMatches.length === 0) return 'Unknown Stage';
  
  const TOURNAMENT_STAGE_MAP = [
    { key: 'group', label: 'First Round' },
    { key: 'Round of 32', label: 'Round of 32' },
    { key: 'Round of 16', label: 'Round of 16' },
    { key: 'Quarter Finals', label: 'Quarterfinalist' },
    { key: 'Semi Finals', label: 'Semifinalist' },
    { key: 'Final', label: 'Finalist' },
  ];

  // Obtener todas las etapas reales jugadas
  const playedStages = new Set<string>();
  for (const match of relevantMatches) {
    if (match.data.stage === 'group') { // Si es un partido de fase de grupos
      playedStages.add(match.data.stage.trim());
    } else if (match.data.fixture) { // Si no es un partido de fase de grupos
      playedStages.add(match.data.fixture.trim());
    }
  }

  // Buscar la etapa más lejana alcanzada
  for (let i = TOURNAMENT_STAGE_MAP.length - 1; i >= 0; i--) {
    const stage = TOURNAMENT_STAGE_MAP[i];
    if (playedStages.has(stage.key)) {
      return stage.label;
    }
  }


  return 'Unknown Stage';
}
