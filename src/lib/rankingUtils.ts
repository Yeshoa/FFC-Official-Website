import type { CollectionEntry } from "astro:content"
import { calculateTournamentDecayPoints, getLastFourTournamentIds } from "@lib/tournamentUtils"
import { calculateAllEventPoints, calculateEventDecayPoints } from "@lib/eventUtils"

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

// Configuración
const SCORING_CONFIG = {
  MAX_HISTORY_POINTS: 100,
  MAX_PREV_EDITION_POINTS: 150, // Para tournament decay
  MAX_EVENT_POINTS: 100, // Para event decay
} as const

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
  // 1️⃣ HISTORY POINTS (manual, sin cambios)
  const historyPoints = Math.min(score?.rp?.history ?? 0, SCORING_CONFIG.MAX_HISTORY_POINTS)
  // 2️⃣ TOURNAMENT DECAY POINTS (automático)
  const tournamentResult = calculateTournamentDecayPoints(
    member.data.name, // Nombre del equipo
    tournaments,
    matches,
    currentTournamentId,
  )
  const tournamentDecayPoints = Math.min(tournamentResult.totalPoints, SCORING_CONFIG.MAX_PREV_EDITION_POINTS)
  // 3️⃣ EVENT POINTS (automático - ACTUALES + ANTERIORES)
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId)
  const eventResult = calculateAllEventPoints(score?.events ?? {}, currentTournamentId ?? 0, lastFourIds)

  // Aplicar límite al TOTAL de eventos (actuales + anteriores)
  const totalEventPoints = Math.min(eventResult.totalEventPoints, SCORING_CONFIG.MAX_EVENT_POINTS)

  // 4️⃣ BONUS (sin cambios)
  const bonusHost = score?.bonus?.host ?? 0
  const bonusExtra = score?.bonus?.extra ?? 0
  const totalScore = historyPoints + tournamentDecayPoints + totalEventPoints + bonusHost + bonusExtra
  return {
    totalScore,
    breakdown: {
      historyPoints,
      tournamentDecayPoints,
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
