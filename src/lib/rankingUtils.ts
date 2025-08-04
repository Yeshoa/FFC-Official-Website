import type { CollectionEntry } from "astro:content"
import { calculateTournamentDecayPoints, getLastFourTournamentIds } from "@lib/tournamentUtils"
import { calculateAllEventPoints, calculateEventDecayPoints, EVENT_COUNT } from "@lib/eventUtils"
import { normalizePoints, SCORING_CONFIG } from "./scoreUtils";

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

// Función principal COMPLETAMENTE AUTOMÁTICA
export function getMemberTotalScore(
  member: MemberEntry,
  tournaments: TournamentEntry[],
  matches: MatchEntry[],
  currentTournamentId?: number,
): {
  totalScore: number
  breakdown: {
    historyPoints: number
    tournamentDecayPoints: number
    roleplayPoints: number,
    currentEventPoints: number // NUEVO
    pastEventPoints: number // NUEVO
    totalEventPoints: number // NUEVO
    bonusHost: number
    bonusExtra: number
  }
  details: {
    tournamentBreakdown: Array<{
      tournamentId: number
      tournamentName: string
      points: number
      decayFactor: number
      finalPoints: number
    }>
    currentEvents: Record<string, number> // NUEVO
    pastEventBreakdown: Array<{
      tournamentId: number
      events: Record<string, number>
      totalTournamentPoints: number
      decayFactor: number
      finalPoints: number
    }>
  }
} {
  const score = member.data.score
  {/* 🎭 ROLEPLAY */}
  // 1️⃣ HISTORY POINTS
  // Normalizar History Points
  const historyPoints = normalizePoints(score.rp.history, SCORING_CONFIG.H_RAW_MAX, SCORING_CONFIG.H_MAX);

  // 2️⃣ TOURNAMENT DECAY POINTS (automático)
  // Obtener puntos de las ediciones anteriores con decay
  const tournamentResult = calculateTournamentDecayPoints(
    member.data.name, // Nombre del equipo
    tournaments,
    matches,
    currentTournamentId,
  )
  // Normalizar Tournament Decay Points
  const tournamentDecayPoints = normalizePoints(tournamentResult.totalPoints, SCORING_CONFIG.PED_RAW_MAX, SCORING_CONFIG.PED_MAX);

  const roleplayPoints = historyPoints + tournamentDecayPoints;
  {/* 🎉 EVENTS */}
  // 3️⃣ EVENT POINTS (automático - ACTUALES + ANTERIORES)
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId)
  const eventResult = calculateAllEventPoints(score?.events ?? {}, currentTournamentId ?? 0, lastFourIds);

  // Aplicar límite al TOTAL de eventos (actuales + anteriores)
  const totalEventPoints = eventResult.totalEventPoints;

  {/* 🎁 BONUS */}
  const bonusHost = score?.bonus?.host ?? 0
  const bonusExtra = score?.bonus?.extra ?? 0
  const totalScore = roleplayPoints + totalEventPoints + bonusHost + bonusExtra
  return {
    totalScore,
    breakdown: {
      historyPoints,
      tournamentDecayPoints,
      roleplayPoints,
      currentEventPoints: eventResult.currentEventPoints,
      pastEventPoints: eventResult.pastEventPoints,
      totalEventPoints,
      bonusHost,
      bonusExtra,
    },
    details: {
      tournamentBreakdown: tournamentResult.breakdown,
      currentEvents: eventResult.currentEvents,
      pastEventBreakdown: eventResult.pastBreakdown,
    },
  }
}

// Función para obtener miembros rankeados (actualizada)
export function getRankedMembers(
  members: MemberEntry[],
  tournaments: TournamentEntry[],
  matches: MatchEntry[],
  currentTournamentId?: number,
): Array<{
  slug: string
  name: string
  flag: any
  scores: {
    historyPoints: number
    tournamentDecayPoints: number
    roleplayPoints: number,
    currentEventPoints: number
    pastEventPoints: number
    totalEventPoints: number
    bonusHost: number
    bonusExtra: number
  }
  currentEvents: Record<string, number>
  totalScore: number
}> {
  return members
    .filter((member) => member.data.verified)
    .map((member) => {
      const result = getMemberTotalScore(member, tournaments, matches, currentTournamentId)

      return {
        slug: member.slug,
        name: member.data.name,
        flag: member.data.flagPath,
        scores: result.breakdown,
        currentEvents: result.details.currentEvents,
        totalScore: result.totalScore,
        
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
}
