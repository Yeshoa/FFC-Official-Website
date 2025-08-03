import { type CollectionEntry } from 'astro:content';
import { getTournaments } from './generalUtils';
import { getMatchResult } from './matchUtils';

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

const tournaments = await getTournaments();
const sortedTournaments = tournaments.sort((a, b) => b.data.id - a.data.id);
export const CURRENT_TOURNAMENT_ID = sortedTournaments[0]?.data.id ?? null;

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

// 🏆 Obtener los puntos de un equipo en un torneo
export function getTeamPointsInTournament(
  teamName: string,
  tournamentId: number,
  matches: MatchEntry[]
) {
  return getTeamStatsInTournament(teamName, tournamentId, matches).points;
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
/* export function getTeamPositionInTournament(
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
} */

export function getTeamPositionInTournament(
  tournament: TournamentEntry,
  matches: MatchEntry[],
  teamName: string
): number | null {
  const otherTeams = tournament.data.participants || [];
  
  // Obtener estadísticas y fase más alta para cada equipo
  const standings = otherTeams.map(name => {
    // Obtener estadísticas básicas
    const stats = getTeamStatsInTournament(name, tournament.data.id, matches);
    
    // Determinar la fase más alta
    let highestPhase = "Group Stage";
    
    // Verificamos si es el campeón (ganador de la final)
    const finalMatch = matches.find(match => 
      match.data.tournament_id === tournament.data.id && 
      match.data.fixture === "Final" && 
      (match.data.team1 === name || match.data.team2 === name)
    );
    
    if (finalMatch) {
      const { team1: g1, team2: g2 } = getMatchResult(finalMatch.data);
      
      if ((finalMatch.data.team1 === name && g1 > g2) || 
          (finalMatch.data.team2 === name && g2 > g1)) {
        highestPhase = "Champion";
      } else {
        highestPhase = "Final";
      }
    } else {
      // Verificar semifinales
      const semifinalMatch = matches.some(match => 
        match.data.tournament_id === tournament.data.id && 
        match.data.fixture === "Semi Finals" && 
        (match.data.team1 === name || match.data.team2 === name)
      );
      
      if (semifinalMatch) {
        highestPhase = "Semi Finals";
      } else {
        // Verificar cuartos de final
        const quarterMatch = matches.some(match => 
          match.data.tournament_id === tournament.data.id && 
          match.data.fixture === "Quarter Finals" && 
          (match.data.team1 === name || match.data.team2 === name)
        );
        
        if (quarterMatch) {
          highestPhase = "Quarter Finals";
        } else {
          // Verificar octavos de final (Round of 16)
          const r16Match = matches.some(match => 
            match.data.tournament_id === tournament.data.id && 
            match.data.fixture === "Round of 16" && 
            (match.data.team1 === name || match.data.team2 === name)
          );
          
          if (r16Match) {
            highestPhase = "Round of 16";
          } else {
            // Verificar dieciseisavos (Round of 32)
            const r32Match = matches.some(match => 
              match.data.tournament_id === tournament.data.id && 
              match.data.fixture === "Round of 32" && 
              (match.data.team1 === name || match.data.team2 === name)
            );
            
            if (r32Match) {
              highestPhase = "Round of 32";
            }
          }
        }
      }
    }
    
    return {
      name,
      highestPhase,
      ...stats
    };
  });

  // Separar equipos por fase
  const champions = standings.filter(team => team.highestPhase === "Champion");
  const finalists = standings.filter(team => team.highestPhase === "Final");
  const semifinalists = standings.filter(team => team.highestPhase === "Semi Finals");
  const quarterfinalists = standings.filter(team => team.highestPhase === "Quarter Finals");
  const r16teams = standings.filter(team => team.highestPhase === "Round of 16");
  const r32teams = standings.filter(team => team.highestPhase === "Round of 32");
  const groupStageTeams = standings.filter(team => team.highestPhase === "Group Stage");

  // Ordenar dentro de cada fase según criterios normales
  const sortByStandardCriteria = (a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  };

  // Ordenar cada grupo por separado
  const sortedQuarterfinalists = [...quarterfinalists].sort(sortByStandardCriteria);
  const sortedR16teams = [...r16teams].sort(sortByStandardCriteria);
  const sortedR32teams = [...r32teams].sort(sortByStandardCriteria);
  const sortedGroupStageTeams = [...groupStageTeams].sort(sortByStandardCriteria);

  // Determinar 3º y 4º puesto entre semifinalistas
  let sorted3rdAnd4th = [...semifinalists];
  if (semifinalists.length === 2) {
    const thirdPlaceMatch = matches.find(match => 
      match.data.tournament_id === tournament.data.id && 
      match.data.fixture === "Third Place" &&
      (match.data.team1 === semifinalists[0].name || match.data.team1 === semifinalists[1].name) &&
      (match.data.team2 === semifinalists[0].name || match.data.team2 === semifinalists[1].name)
    );
    
    if (thirdPlaceMatch) {
      const { team1: g1, team2: g2 } = getMatchResult(thirdPlaceMatch.data);
      
      // Determinar ganador del tercer lugar
      if ((thirdPlaceMatch.data.team1 === semifinalists[0].name && g1 > g2) ||
          (thirdPlaceMatch.data.team2 === semifinalists[0].name && g2 > g1)) {
        // El primer semifinalista ganó el partido por el tercer puesto
        sorted3rdAnd4th = [semifinalists[0], semifinalists[1]];
      } else {
        // El segundo semifinalista ganó el partido por el tercer puesto
        sorted3rdAnd4th = [semifinalists[1], semifinalists[0]];
      }
    } else {
      // No hay partido por el tercer puesto, ordenar por criterios estándar
      sorted3rdAnd4th.sort(sortByStandardCriteria);
    }
  }

  // Combinar todos los equipos en el orden correcto garantizando las posiciones por fase
  const finalSorted = [
    ...champions,                // 1er lugar
    ...finalists,                // 2do lugar
    ...sorted3rdAnd4th,          // 3er y 4to lugar
    ...sortedQuarterfinalists,   // Del 5to al 8vo lugar
    ...sortedR16teams,           // Del 9no al 16to lugar
    ...sortedR32teams,           // Del 17mo al 32do lugar (si hubo)
    ...sortedGroupStageTeams     // Del 17mo en adelante // Del 33ro en adelante
  ];

  // Encontrar la posición del equipo solicitado
  const index = finalSorted.findIndex(t => t.name === teamName);
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
      if (stage.key === 'Final') {
        const finalMatch = relevantMatches.find(
          m =>
            m.data.stage === 'Final' ||
            m.data.fixture.trim() === 'Final'
        );

        if (finalMatch) {
          const result = getMatchResult(finalMatch.data);
          const isWinner =
            (finalMatch.data.team1 === teamName && result.team1 > result.team2) ||
            (finalMatch.data.team2 === teamName && result.team2 > result.team1);

          return isWinner ? 'Champion' : 'Finalist';
        }
      }

      if (stage.key === 'Semi Finals') {
        const position = getTeamPositionInTournament(tournament, matches, teamName);
        if (position === 3) return 'Third-Place';
      }

      return stage.label;
    }
  }

  return 'Unknown Stage';
}

// Función para obtener los últimos 4 tournament IDs completados (excluyendo el actual)
export function getLastFourTournamentIds(tournaments: TournamentEntry[], currentTournamentId?: number): number[] {
  // Si no se especifica el actual, asumir que es el de mayor ID
  const current = currentTournamentId ?? Math.max(...tournaments.map((t) => t.data.id))

  return tournaments
    .filter((t) => t.data.id < current) // Excluir el torneo actual
    .sort((a, b) => b.data.id - a.data.id) // Ordenar por ID descendente (más reciente primero)
    .slice(0, 4) // Solo los últimos 4
    .map((t) => t.data.id)
}

// Función para calcular puntos de torneos con decay automático
export function calculateTournamentDecayPoints(
  teamName: string,
  tournaments: TournamentEntry[],
  matches: MatchEntry[],
  currentTournamentId?: number,
): {
  totalPoints: number
  breakdown: Array<{
    tournamentId: number
    tournamentName: string
    points: number
    decayFactor: number
    finalPoints: number
  }>
} {
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId)
  const decayFactors = [1.0, 0.5, 0.25, 0.1] // 100%, 50%, 25%, 10%

  const breakdown = lastFourIds.map((tournamentId, index) => {
    const tournament = tournaments.find((t) => t.data.id === tournamentId)
    const rawPoints = getTeamPointsInTournament(teamName, tournamentId, matches)
    const decayFactor = decayFactors[index] || 0
    const finalPoints = rawPoints * decayFactor

    return {
      tournamentId,
      tournamentName: tournament?.data.name || `Tournament ${tournamentId}`,
      points: rawPoints,
      decayFactor,
      finalPoints,
    }
  })

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0)

  return { totalPoints, breakdown }
}
