import { MAX_EVENTS_POINTS, SCORING_CONFIG } from "./scoreUtils";
import { getMembers } from "./generalUtils";
const members = await getMembers();
export const EVENT_COUNT = 7;
// Funciones para manejar eventos dinámicos usando tournament IDs
export function calculateCurrentEventPoints(
  memberEvents: Record<string, Record<string, number>>,
  currentTournamentId: number,
  allMembersEvents: Array<Record<string, Record<string, number>>>,
  EV_MAX: number = SCORING_CONFIG.EV_MAX
): {
  normalizedPoints: number
  events: Record<string, number>
} {
  const currentTournamentIdStr = currentTournamentId.toString();
  const currentEvents = memberEvents[currentTournamentIdStr] || {};

  // 1. Obtener todos los puntajes de todos los miembros para este torneo
  const allScoresByEvent: Record<string, number[]> = {};
  for (const member of allMembersEvents) {
    const events = member[currentTournamentIdStr] || {};
    for (const [eventName, points] of Object.entries(events)) {
      if (!allScoresByEvent[eventName]) allScoresByEvent[eventName] = [];
      allScoresByEvent[eventName].push(points);
    }
  }

  // 2. Normalizar los puntos de cada evento
  const normalizedEvents: Record<string, number> = {};
  for (const [eventName, points] of Object.entries(currentEvents)) {
    const scores = allScoresByEvent[eventName] || [];
    const maxScore = Math.max(...scores, 0);
    // Si el máximo es 0, todos quedan en 0
    normalizedEvents[eventName] = maxScore > 0 ? Math.round((points / maxScore) * EV_MAX) : 0;
  }

  const normalizedPoints = Object.values(normalizedEvents).reduce((sum, p) => sum + p, 0);

  return {
    normalizedPoints,
    events: normalizedEvents,
  };
}

export function calculateEventDecayPoints(
  memberEvents: Record<string, Record<string, number>>,
  lastFourTournamentIds: number[],
  allMembersEvents: Array<Record<string, Record<string, number>>>,
  PEV_MAX: number = SCORING_CONFIG.PEV_MAX
): {
  totalPoints: number
  normalizedTotalPoints: number
  breakdown: Array<{
    tournamentId: number
    events: Record<string, number>
    totalTournamentPoints: number
    decayFactor: number
    finalPoints: number
  }>
} {
  const decayFactors = [1.0, 0.5, 0.25, 0.1];
  // 1. Calcula el breakdown para este miembro
  const breakdown = lastFourTournamentIds.map((tournamentId, index) => {
    const tournamentIdStr = tournamentId.toString();
    const events = memberEvents[tournamentIdStr] || {};
    const totalTournamentPoints = Object.values(events).reduce((sum, points) => sum + points, 0);
    const decayFactor = decayFactors[index] || 0;
    const finalPoints = totalTournamentPoints * decayFactor;
    return {
      tournamentId,
      events,
      totalTournamentPoints,
      decayFactor,
      finalPoints,
    };
  });

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0);

  // 2. Calcula el máximo total entre todos los miembros
  const allTotals = allMembersEvents.map(events => {
    return lastFourTournamentIds.reduce((sum, tournamentId, index) => {
      const tournamentIdStr = tournamentId.toString();
      const evs = events[tournamentIdStr] || {};
      const totalTournamentPoints = Object.values(evs).reduce((s, p) => s + p, 0);
      const decayFactor = decayFactors[index] || 0;
      return sum + totalTournamentPoints * decayFactor;
    }, 0);
  });
  const maxTotalPoints = Math.max(...allTotals, 1);
  console.log("Max Total Points:", maxTotalPoints, "Total Points:", totalPoints, "PEV_MAX:", PEV_MAX);
  // 3. Normaliza solo el total
  const normalizedTotalPoints = maxTotalPoints > 0
    ? Math.round((totalPoints / maxTotalPoints) * PEV_MAX)
    : 0;
  console.log("Normalized Total Points:", normalizedTotalPoints);
  return {
    totalPoints,
    normalizedTotalPoints,
    breakdown,
  };
}

// Función para calcular TODOS los eventos (actuales + anteriores)
export function calculateAllEventPoints(
  memberEvents: Record<string, Record<string, number>>,
  currentTournamentId: number,
  lastFourTournamentIds: number[],
  EV_MAX: number = MAX_EVENTS_POINTS / EVENT_COUNT
): {
  currentEventPoints: number
  pastEventPoints: number
  totalEventPoints: number
  currentEvents: Record<string, number>
  pastBreakdown: Array<{
    tournamentId: number
    events: Record<string, number>
    totalTournamentPoints: number
    decayFactor: number
    finalPoints: number
  }>
} {
  const allMembersEvents = members.map(member => member.data.score.events);
  console.log(MAX_EVENTS_POINTS, EVENT_COUNT, EV_MAX, "EV_MAX");
  // Eventos actuales (100%)
  // const currentResult = calculateCurrentEventPoints(memberEvents, currentTournamentId)
  const currentResult = calculateCurrentEventPoints(
    memberEvents,
    currentTournamentId,
    allMembersEvents, 
    EV_MAX
  );
  // Eventos anteriores (con decay)
  const pastResult = calculateEventDecayPoints(memberEvents, lastFourTournamentIds, allMembersEvents, EV_MAX);
  return {
    currentEventPoints: currentResult.normalizedPoints,
    // pastEventPoints: pastResult.totalPoints,
    pastEventPoints: pastResult.normalizedTotalPoints,
    totalEventPoints: currentResult.normalizedPoints + pastResult.normalizedTotalPoints,
    currentEvents: currentResult.events,
    pastBreakdown: pastResult.breakdown,
  }
}

// Función helper para agregar eventos dinámicamente
export function addEventToMember(
  currentEvents: Record<string, Record<string, number>>,
  tournamentId: number,
  eventName: string,
  points: number,
): Record<string, Record<string, number>> {
  const tournamentIdStr = tournamentId.toString()

  return {
    ...currentEvents,
    [tournamentIdStr]: {
      ...currentEvents[tournamentIdStr],
      [eventName]: points,
    },
  }
}

// Función para obtener todos los tipos de eventos únicos
export function getAllEventTypes(allMembersEvents: Record<string, Record<string, number>>[]): string[] {
  const eventTypes = new Set<string>()

  allMembersEvents.forEach((memberEvents) => {
    Object.values(memberEvents).forEach((tournamentEvents) => {
      Object.keys(tournamentEvents).forEach((eventName) => {
        eventTypes.add(eventName)
      })
    })
  })

  return Array.from(eventTypes).sort()
}

// Función para obtener eventos de un torneo específico
export function getEventsForTournament(
  memberEvents: Record<string, Record<string, number>>,
  tournamentId: number,
): Record<string, number> {
  return memberEvents[tournamentId.toString()] || {}
}
