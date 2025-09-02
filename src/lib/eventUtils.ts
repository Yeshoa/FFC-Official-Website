import { MAX_EVENTS_POINTS, SCORING_CONFIG } from "./scoreUtils";
import { getMembers, getEvents } from '@lib/collections';
import type { Event, Events } from '@ty/collections';
import { CURRENT_TOURNAMENT_ID } from "@utils/tournamentUtils";

const events = getEvents() as Events;
const members = await getMembers();

export const EVENT_COUNT = 5;

// Función para calcular puntos de eventos actuales
export function calculateCurrentEventPoints(
  memberName: string,
  currentTournamentId: number,
  EV_MAX: number = SCORING_CONFIG.EV_MAX
): {
  normalizedPoints: number
  events: Record<string, number>
} {
  const currentEvents = getEventsByMemberAndEdition(memberName, currentTournamentId);
  const normalizedEvents: Record<string, number> = {};

  // Normalizar los puntos de cada evento usando event.maxScore
  currentEvents.forEach(event => {
    const points = (event.participants[memberName] ?? 0) * (event.weight ?? 1);
    const maxScore = event.maxScore || 1;
    normalizedEvents[event.name] = maxScore > 0 ? Math.ceil((points / maxScore) * EV_MAX) : 0;
  });

  const normalizedPoints = Object.values(normalizedEvents).reduce((sum, p) => sum + p, 0);
  return {
    normalizedPoints,
    events: normalizedEvents,
  };
}

// Helper para calcular total points con decay para un miembro
function calculateMemberDecayTotal(
  memberName: string,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    const events = getEventsByMemberAndEdition(memberName, tournamentId);
    const totalTournamentPoints = events.reduce((s, event) => {
      const points = (event.participants[memberName] ?? 0) * (event.weight ?? 1);
      return s + points;
    }, 0);
    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentPoints * decayFactor;
  }, 0);
}

// Función para calcular puntos de eventos con decay
export function calculateEventDecayPoints(
  memberName: string,
  lastFourTournamentIds: number[],
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

  // Calcula el breakdown para este miembro
  const breakdown = lastFourTournamentIds.map((tournamentId, index) => {
    const events = getEventsByMemberAndEdition(memberName, tournamentId);
    const eventsRecord: Record<string, number> = {};
    events.forEach(event => {
      const points = (event.participants[memberName] ?? 0) * (event.weight ?? 1);
      eventsRecord[event.name] = Math.ceil(points);
    });
    const totalTournamentPoints = Object.values(eventsRecord).reduce((sum, points) => sum + points, 0);
    const decayFactor = decayFactors[index] || 0;
    const finalPoints = totalTournamentPoints * decayFactor;
    return {
      tournamentId,
      events: eventsRecord,
      totalTournamentPoints,
      decayFactor,
      finalPoints,
    };
  });

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0);

  // Calcula el máximo total entre todos los miembros
  const allTotals = members.map(member => calculateMemberDecayTotal(member.data.name, lastFourTournamentIds));
  const maxTotalPoints = Math.max(...allTotals, 1);

  // Normaliza solo el total
  const normalizedTotalPoints = maxTotalPoints > 0
    ? Math.ceil((totalPoints / maxTotalPoints) * PEV_MAX)
    : 0;

  return {
    totalPoints,
    normalizedTotalPoints,
    breakdown,
  };
}

// Función para calcular TODOS los eventos (actuales + anteriores)
export function calculateAllEventPoints(
  memberName: string,
  currentTournamentId: number,
  lastFourTournamentIds: number[],
  EV_MAX: number = SCORING_CONFIG.EV_MAX
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
  const currentResult = calculateCurrentEventPoints(memberName, currentTournamentId, EV_MAX);

  // Eventos anteriores (con decay)
  const pastResult = calculateEventDecayPoints(memberName, lastFourTournamentIds, SCORING_CONFIG.PEV_MAX);

  return {
    currentEventPoints: currentResult.normalizedPoints,
    pastEventPoints: pastResult.totalPoints,
    totalEventPoints: currentResult.normalizedPoints + pastResult.totalPoints,
    currentEvents: currentResult.events,
    pastBreakdown: pastResult.breakdown,
  };
}

// Función helper para obtener puntos de eventos específicos (actual)
export const getCurrentEventPoints = (memberName: string, eventName: string) => {
  const currentEvents = getEventsByMemberAndEdition(memberName, CURRENT_TOURNAMENT_ID);
  const event = currentEvents.find(e => e.name === eventName);
  return event ? (event.participants[memberName] ?? 0) * (event.weight ?? 1) : 0;
};

// Helpers para obtener eventos
export const getEventsByMember = (memberName: string): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.enabled !== false);
};

export const getEventsByTournamentId = (tournamentId: number): Events => {
  return events.filter(event => event.edition === tournamentId && event.enabled !== false);
};

export const getEventsByMemberAndEdition = (memberName: string, tournamentId: number): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.edition === tournamentId && event.enabled !== false);
};

export const getCurrentEventsByMember = (memberName: string): Events => {
  return getEventsByMemberAndEdition(memberName, CURRENT_TOURNAMENT_ID);
};

export const getPastEventsByMember = (memberName: string): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.edition !== CURRENT_TOURNAMENT_ID && event.enabled !== false);
};

export const getCurrentEvents = (): Events => {
  return getEventsByTournamentId(CURRENT_TOURNAMENT_ID);
};