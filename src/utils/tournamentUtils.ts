import { type CollectionEntry } from 'astro:content';
import { getTournaments, getMatches } from '@lib/collections';
import { getMatchResult } from './matchUtils';
import { getMemberByName } from './memberUtils';

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

const matches = await getMatches();
const tournaments = await getTournaments();
const sortedTournaments = tournaments.sort((a, b) => b.data.id - a.data.id);
export const CURRENT_TOURNAMENT_ID = sortedTournaments[0]?.data.id ?? null;

export async function getTeamMatchesInTournament(teamName: string, tournamentId: number) {
  return matches.filter(
    m =>
      m.data.tournament_id === tournamentId &&
      m.data.status === 'played' &&
      (m.data.team1 === teamName || m.data.team2 === teamName)
  ).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// 🟩 Obtener estadísticas por torneo para un equipo
export async function getTeamStatsInTournament(
  teamName: string,
  tournamentId: number,
) {
  const relevantMatches = await getTeamMatchesInTournament(teamName, tournamentId);

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
export async function getTeamPointsInTournament(
  teamName: string,
  tournamentId: number,
) {
  const stats = await getTeamStatsInTournament(teamName, tournamentId);
  return stats.points;
}

// 🟦 Obtener el máximo goleador del equipo en un torneo
export async function getTopScorerOfTeamInTournament(
  teamName: string,
  tournamentId: number,
): Promise<string> {
  const relevantMatches = await getTeamMatchesInTournament(teamName, tournamentId);
  const relevantGoals = relevantMatches.flatMap(match => {
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

/* export async function getTeamPositionInTournament(
  tournament: TournamentEntry,
  teamName: string
): Promise<number | null> {
  if (!tournament.data.participants?.find(t => t === teamName)) return null;
  const otherTeams = tournament.data.participants || [];
  const relevantMatches = await getTeamMatchesInTournament(teamName, tournament.data.id);
  // Obtener estadísticas y fase más alta para cada equipo
  const standings = await Promise.all(
    otherTeams.map(async (name) => {
      // Obtener estadísticas básicas
      const stats = await getTeamStatsInTournament(name, tournament.data.id);
      console.log(teamName, name, stats);
      // Determinar la fase más alta
      let highestPhase = "Group Stage";

      const finalMatch = relevantMatches.find(match => 
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
      } else if (relevantMatches.some(match =>
        match.data.tournament_id === tournament.data.id && 
        match.data.fixture === "Semi Finals" && 
        (match.data.team1 === name || match.data.team2 === name)
      )) {
        highestPhase = "Semi Finals";
      } else if (relevantMatches.some(match =>
        match.data.tournament_id === tournament.data.id && 
        match.data.fixture === "Quarter Finals" && 
        (match.data.team1 === name || match.data.team2 === name)
      )) {
        highestPhase = "Quarter Finals";
      } else if (relevantMatches.some(match =>
        match.data.tournament_id === tournament.data.id && 
        match.data.fixture === "Round of 16" && 
        (match.data.team1 === name || match.data.team2 === name)
      )) {
        highestPhase = "Round of 16";
      } else if (relevantMatches.some(match =>
        match.data.tournament_id === tournament.data.id && 
        match.data.fixture === "Round of 32" && 
        (match.data.team1 === name || match.data.team2 === name)
      )) {
        highestPhase = "Round of 32";
      }

      return {
        name,
        highestPhase,
        ...stats
      };
    })
  );

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
    const thirdPlaceMatch = relevantMatches.find(match => 
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
  // console.log('finalSorted', finalSorted[0].highestPhase, finalSorted[0].name);
  // Encontrar la posición del equipo solicitado
  const index = finalSorted.findIndex(t => t.name === teamName);
  return index >= 0 ? index + 1 : null;
}
 */
// Cache para evitar recalcular standings del mismo torneo
const tournamentStandingsCache = new Map<number, any[]>();

// Función auxiliar para limpiar el cache si es necesario
export function clearTournamentCache(tournamentId?: number) {
  if (tournamentId) {
    tournamentStandingsCache.delete(tournamentId);
  } else {
    tournamentStandingsCache.clear();
  }
}

// Función para determinar la fase más alta alcanzada por un equipo
async function getTeamHighestPhase(
  teamName: string, 
  tournamentId: number, 
  allMatches: MatchEntry[]
): Promise<string> {
  const teamMatches = allMatches.filter(match => 
    match.data.tournament_id === tournamentId &&
    match.data.status === 'played' &&
    (match.data.team1 === teamName || match.data.team2 === teamName)
  );

  // Definir orden de fases (de menor a mayor importancia)
  const phaseOrder = [
    'Group Stage',
    'Round of 32', 
    'Round of 16',
    'Quarter Finals',
    'Semi Finals',
    'Final',
    'Champion'
  ];

  let highestPhase = 'Group Stage';

  // Buscar la fase más alta jugada
  for (const match of teamMatches) {
    const fixture = match.data.fixture?.trim();
    if (!fixture) continue;

    // Mapear fixtures a fases
    let currentPhase = 'Group Stage';
    switch (fixture) {
      case 'Round of 32': currentPhase = 'Round of 32'; break;
      case 'Round of 16': currentPhase = 'Round of 16'; break;
      case 'Quarter Finals': currentPhase = 'Quarter Finals'; break;
      case 'Semi Finals': currentPhase = 'Semi Finals'; break;
      case 'Final': 
        // Verificar si ganó la final para ser campeón
        const { team1: g1, team2: g2 } = getMatchResult(match.data);
        const isWinner = (match.data.team1 === teamName && g1 > g2) || 
                        (match.data.team2 === teamName && g2 > g1);
        currentPhase = isWinner ? 'Champion' : 'Final';
        break;
    }

    // Actualizar si esta fase es más alta que la actual
    if (phaseOrder.indexOf(currentPhase) > phaseOrder.indexOf(highestPhase)) {
      highestPhase = currentPhase;
    }
  }

  return highestPhase;
}

// Función para generar los standings completos de un torneo
async function generateTournamentStandings(
  tournament: TournamentEntry,
  allMatches: MatchEntry[]
): Promise<any[]> {
  const tournamentId = tournament.data.id;
  
  // Verificar cache primero
  if (tournamentStandingsCache.has(tournamentId)) {
    return tournamentStandingsCache.get(tournamentId)!;
  }

  const participants = tournament.data.participants || [];
  
  // Generar estadísticas para todos los equipos
  const standings = await Promise.all(
    participants.map(async (teamName) => {
      // Obtener estadísticas básicas del equipo
      const stats = await getTeamStatsInTournament(teamName, tournamentId);
      
      // Obtener la fase más alta alcanzada
      const highestPhase = await getTeamHighestPhase(teamName, tournamentId, allMatches);
      
      return {
        name: teamName,
        highestPhase,
        ...stats
      };
    })
  );

  // Separar por fases
  const teamsByPhase = {
    Champion: standings.filter(t => t.highestPhase === 'Champion'),
    Final: standings.filter(t => t.highestPhase === 'Final'),
    'Semi Finals': standings.filter(t => t.highestPhase === 'Semi Finals'),
    'Quarter Finals': standings.filter(t => t.highestPhase === 'Quarter Finals'),
    'Round of 16': standings.filter(t => t.highestPhase === 'Round of 16'),
    'Round of 32': standings.filter(t => t.highestPhase === 'Round of 32'),
    'Group Stage': standings.filter(t => t.highestPhase === 'Group Stage')
  };

  // Función para ordenar por criterios estándar
  const sortByStandardCriteria = (a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  };

  // Ordenar semifinalistas considerando el partido por el 3er puesto
  let sortedSemifinalists = [...teamsByPhase['Semi Finals']];
  if (sortedSemifinalists.length === 2) {
    const thirdPlaceMatch = allMatches.find(match => 
      match.data.tournament_id === tournamentId && 
      match.data.fixture === 'Third Place' &&
      match.data.status === 'played' &&
      sortedSemifinalists.some(team => team.name === match.data.team1) &&
      sortedSemifinalists.some(team => team.name === match.data.team2)
    );
    
    if (thirdPlaceMatch) {
      const { team1: g1, team2: g2 } = getMatchResult(thirdPlaceMatch.data);
      const winner = g1 > g2 ? thirdPlaceMatch.data.team1 : thirdPlaceMatch.data.team2;
      
      // Ordenar: ganador del 3er puesto primero
      sortedSemifinalists = sortedSemifinalists.sort((a, b) => {
        if (a.name === winner) return -1;
        if (b.name === winner) return 1;
        return 0;
      });
    } else {
      // Sin partido por el 3er puesto, ordenar por criterios estándar
      sortedSemifinalists.sort(sortByStandardCriteria);
    }
  }

  // Ordenar cada fase por criterios estándar
  Object.keys(teamsByPhase).forEach(phase => {
    if (phase !== 'Semi Finals') {
      teamsByPhase[phase].sort(sortByStandardCriteria);
    }
  });

  // Combinar todas las fases en orden de importancia
  const finalStandings = [
    ...teamsByPhase.Champion,           // 1°
    ...teamsByPhase.Final,              // 2°
    ...sortedSemifinalists,             // 3° y 4°
    ...teamsByPhase['Quarter Finals'],  // 5° - 8°
    ...teamsByPhase['Round of 16'],     // 9° - 16°
    ...teamsByPhase['Round of 32'],     // 17° - 32°
    ...teamsByPhase['Group Stage']      // Resto
  ];

  // Guardar en cache
  tournamentStandingsCache.set(tournamentId, finalStandings);
  
  return finalStandings;
}

// Función principal refactorizada
export async function getTeamPositionInTournament(
  tournament: TournamentEntry,
  teamName: string
): Promise<number | null> {
  // Verificar si el equipo participa en el torneo
  if (!tournament.data.participants?.includes(teamName)) {
    return null;
  }

  // Obtener todos los partidos una sola vez
  const allMatches = await getMatches();
  
  // Generar standings completos del torneo
  const standings = await generateTournamentStandings(tournament, allMatches);
  
  // Encontrar la posición del equipo
  const teamIndex = standings.findIndex(team => team.name === teamName);
  
  return teamIndex >= 0 ? teamIndex + 1 : null;
}

// Función auxiliar para obtener los standings completos (útil para debugging o mostrar tabla)
export async function getTournamentStandings(tournament: TournamentEntry) {
  const allMatches = await getMatches();
  return await generateTournamentStandings(tournament, allMatches);
}

// 🟥 Obtener la ronda final alcanzada por el equipo
export async function getTeamFinalResult(
  teamName: string,
  tournament: TournamentEntry,
): Promise<string> {
  const relevantMatches = await getTeamMatchesInTournament(teamName, tournament.data.id);

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
        const position = await getTeamPositionInTournament(tournament, teamName);
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
export async function calculateTournamentDecayPoints(
  teamName: string,
  tournaments: TournamentEntry[],
  currentTournamentId?: number,
): Promise<{
  totalPoints: number
  breakdown: Array<{
    tournamentId: number
    tournamentName: string
    points: number
    decayFactor: number
    finalPoints: number
  }>
}> {
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId)
  const decayFactors = [1.0, 0.5, 0.25, 0.1] // 100%, 50%, 25%, 10%
  const breakdown = await Promise.all(lastFourIds.map(async (tournamentId, index) => {
    const tournament = tournaments.find((t) => t.data.id === tournamentId)
    const rawPoints = await getTeamPointsInTournament(teamName, tournamentId)
    const decayFactor = decayFactors[index] || 0
    const finalPoints = rawPoints * decayFactor
    return {
      tournamentId,
      tournamentName: tournament?.data.name || `Tournament ${tournamentId}`,
      points: rawPoints,
      decayFactor,
      finalPoints,
    }
  }))

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0)

  return { totalPoints, breakdown }
}

// Función para obtener el equipo según la posición final
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
/* TODO: REVISAR PARTICIPANTS ESTA HARDCODEADO */
export async function getTeamByPosition(tournament: CollectionEntry<'tournaments'>, position: number): Promise<CollectionEntry<'members'> | null> {
  const participants = tournament.data.participants || [];
  for (const team of participants) {
    const teamPosition = await getTeamPositionInTournament(tournament, team);
    if (teamPosition === position) {
      return await getMemberByName(team);
    }
  }
  
  return null;
}

// Función para obtener el resultado del equipo (goles a favor/goles en contra en la final)
export async function getFinalResult(tournament: CollectionEntry<'tournaments'>, teamPosition: number): Promise<string> {
  if (teamPosition > 2) return ""; // Solo mostramos resultados para posiciones 1 y 2 (final)
  
  const team = await getTeamByPosition(tournament, teamPosition);
  const teamName = team?.data.name;
  if (!teamName) return "";
  
  const finalMatch = matches.find(match => 
    match.data.tournament_id === tournament.data.id && 
    match.data.fixture === "Final" && 
    (match.data.team1 === teamName || match.data.team2 === teamName)
  );
  
  if (!finalMatch) return "";
  
  const { team1: goalsT1, team2: goalsT2 } = getMatchResult(finalMatch.data);
  // Si el equipo es el ganador (posición 1), mostramos el resultado normalmente
  // Si es el perdedor (posición 2), invertimos los goles
  if (teamPosition === 1) {
    if (finalMatch.data.team1 === teamName) {
      return `${goalsT1}-${goalsT2}`;
    } else {
      return `${goalsT2}-${goalsT1}`;
    }
  } else {
    if (finalMatch.data.team1 === teamName) {
      return `${goalsT1}-${goalsT2}`;
    } else {
      return `${goalsT2}-${goalsT1}`;
    }
  }
}

// Función para obtener el resultado del partido por el tercer puesto
export async function getThirdPlaceResult(tournament: CollectionEntry<'tournaments'>): Promise<string> {
  const thirdPlace = await getTeamByPosition(tournament, 3);
  const fourthPlace = await getTeamByPosition(tournament, 4);

  const thirdPlaceName = thirdPlace?.data.name;
  const fourthPlaceName = fourthPlace?.data.name;

  if (!thirdPlaceName || !fourthPlaceName) return "";
  
  const thirdPlaceMatch = matches.find(match => 
    match.data.tournament_id === tournament.data.id && 
    match.data.fixture === "Third Place" && 
    ((match.data.team1 === thirdPlaceName && match.data.team2 === fourthPlaceName) || 
     (match.data.team1 === fourthPlaceName && match.data.team2 === thirdPlaceName))
  );
  
  if (!thirdPlaceMatch) return "N/A";
  
  const { team1: goalsT1, team2: goalsT2 } = getMatchResult(thirdPlaceMatch.data);
  if (thirdPlaceMatch.data.team1 === thirdPlaceName) {
    return `${goalsT1}-${goalsT2}`;
  } else {
    return `${goalsT2}-${goalsT1}`;
  }
}