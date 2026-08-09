import { MAX_EVENTS_POINTS, SCORING_CONFIG } from "./scoreUtils";
import { getMembers, getEvents } from '@lib/collections';
import type { Event, Events } from '@ty/collections';
import { CURRENT_SEASON } from "@config/season";

const events = getEvents() as Events;
const members = await getMembers();

export const EVENT_COUNT = 5;

// Función para calcular puntos de eventos actuales
export function calculateCurrentEventPoints(
  memberName: string,
  currentSeason: number,
  EV_MAX: number = SCORING_CONFIG.EV_MAX
): {
  normalizedPoints: number
  events: Record<string, number>
} {
  const currentEvents = getEventsByMemberAndSeason(memberName, currentSeason);
  const normalizedEvents: Record<string, number> = {};

  // Normalizar los puntos de cada evento usando event.maxScore
  currentEvents.forEach(event => {
    const points = (event.participants[memberName] ?? 0) * (event.weight ?? 1);
    const maxScore = event.maxScore || 1;
    normalizedEvents[event.name] = maxScore > 0 ? ((points / maxScore) * EV_MAX) : 0;
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
  lastFourSeasons: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourSeasons.reduce((sum, season, index) => {
    const events = getEventsByMemberAndSeason(memberName, season);
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
  lastFourSeasons: number[],
  PEV_MAX: number = SCORING_CONFIG.PEV_MAX
): {
  totalPoints: number
  normalizedTotalPoints: number
  breakdown: Array<{
    season: number
    events: Record<string, number>
    totalTournamentPoints: number
    decayFactor: number
    finalPoints: number
  }>
} {
  const decayFactors = [1.0, 0.5, 0.25, 0.1];

  // Calcula el breakdown para este miembro
  const breakdown = lastFourSeasons.map((season, index) => {
    const events = getEventsByMemberAndSeason(memberName, season);
    const eventsRecord: Record<string, number> = {};
    events.forEach(event => {
      const points = (event.participants[memberName] ?? 0) * (event.weight ?? 1);
      eventsRecord[event.name] = points;
    });
    const totalTournamentPoints = Object.values(eventsRecord).reduce((sum, points) => sum + points, 0);
    const decayFactor = decayFactors[index] || 0;
    const finalPoints = totalTournamentPoints * decayFactor;
    return {
      season,
      events: eventsRecord,
      totalTournamentPoints,
      decayFactor,
      finalPoints,
    };
  });

  const totalPoints = breakdown.reduce((sum, item) => sum + item.finalPoints, 0);

  // Calcula el máximo total entre todos los miembros
  const allTotals = members.map(member => calculateMemberDecayTotal(member.data.name, lastFourSeasons));
  const maxTotalPoints = Math.max(...allTotals, 1);

  // Normaliza solo el total
  const normalizedTotalPoints = maxTotalPoints > 0
    ? (totalPoints / maxTotalPoints) * PEV_MAX
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
  currentSeason: number,
  lastFourSeasons: number[],
  EV_MAX: number = SCORING_CONFIG.EV_MAX
): {
  currentEventPoints: number
  pastEventPoints: number
  totalEventPoints: number
  currentEvents: Record<string, number>
  pastBreakdown: Array<{
    season: number
    events: Record<string, number>
    totalTournamentPoints: number
    decayFactor: number
    finalPoints: number
  }>
} {
  // Eventos actuales (100%)
  const currentResult = calculateCurrentEventPoints(memberName, currentSeason, EV_MAX);

  // Eventos anteriores (con decay)
  const pastResult = calculateEventDecayPoints(memberName, lastFourSeasons, SCORING_CONFIG.PEV_MAX);

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
  const currentEvents = getEventsByMemberAndSeason(memberName, CURRENT_SEASON);
  const event = currentEvents.find(e => e.name === eventName);
  return event ? (event.participants[memberName] ?? 0) * (event.weight ?? 1) : 0;
};

// Helpers para obtener eventos
export const getEventsByMember = (memberName: string): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.enabled !== false);
};

export const getEventsBySeason = (season: number): Events => {
  return events.filter(event => event.edition === season && event.enabled !== false);
};

export const getEventsByMemberAndSeason = (memberName: string, season: number): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.edition === season && event.enabled !== false);
};

export const getCurrentEventsByMember = (memberName: string): Events => {
  return getEventsByMemberAndSeason(memberName, CURRENT_SEASON);
};

export const getPastEventsByMember = (memberName: string): Events => {
  return events.filter(event => event.participants[memberName] !== undefined && event.edition !== CURRENT_SEASON && event.enabled !== false);
};

export const getCurrentEvents = (): Events => {
  return getEventsBySeason(CURRENT_SEASON);
};
