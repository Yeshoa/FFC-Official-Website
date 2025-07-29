// Funciones para manejar eventos dinámicos usando tournament IDs

export function calculateCurrentEventPoints(
  memberEvents: Record<string, Record<string, number>>,
  currentTournamentId: number,
): {
  totalPoints: number
  events: Record<string, number>
} {
  const currentTournamentIdStr = currentTournamentId.toString()
  const currentEvents = memberEvents[currentTournamentIdStr] || {}
  const totalPoints = Object.values(currentEvents).reduce((sum, points) => sum + points, 0)
  
  return {
    totalPoints,
    events: currentEvents,
  }
}

export function calculateEventDecayPoints(
  memberEvents: Record<string, Record<string, number>>, // events del member
  lastFourTournamentIds: number[], // Los mismos IDs que se usan para torneos
): {
  totalPoints: number
  breakdown: Array<{
    tournamentId: number
    events: Record<string, number>
    totalTournamentPoints: number
    decayFactor: number
    finalPoints: number
  }>
} {
  const decayFactors = [1.0, 0.5, 0.25, 0.1] // 100%, 50%, 25%, 10%

  const breakdown = lastFourTournamentIds.map((tournamentId, index) => {
    const tournamentIdStr = tournamentId.toString()
    const events = memberEvents[tournamentIdStr] || {}
    const totalTournamentPoints = Object.values(events).reduce((sum, points) => sum + points, 0)
    const decayFactor = decayFactors[index] || 0
    const finalPoints = totalTournamentPoints * decayFactor

    return {
      tournamentId,
      events,
      totalTournamentPoints,
      decayFactor,
      finalPoints,
    }
  })

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0)

  return { totalPoints, breakdown }
}

// Función para calcular TODOS los eventos (actuales + anteriores)
export function calculateAllEventPoints(
  memberEvents: Record<string, Record<string, number>>,
  currentTournamentId: number,
  lastFourTournamentIds: number[],
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
  // Eventos actuales (100%)
  const currentResult = calculateCurrentEventPoints(memberEvents, currentTournamentId)
  // Eventos anteriores (con decay)
  const pastResult = calculateEventDecayPoints(memberEvents, lastFourTournamentIds)

  return {
    currentEventPoints: currentResult.totalPoints,
    pastEventPoints: pastResult.totalPoints,
    totalEventPoints: currentResult.totalPoints + pastResult.totalPoints,
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
