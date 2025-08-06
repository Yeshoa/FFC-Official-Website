import type { CollectionEntry } from "astro:content"
import { calculateTournamentDecayPoints, getLastFourTournamentIds } from "@lib/tournamentUtils"
import { calculateAllEventPoints, calculateEventDecayPoints, EVENT_COUNT } from "@lib/eventUtils"
import { MAX_ROLEPLAY_POINTS, normalizePoints, SCORING_CONFIG } from "./scoreUtils";
import { calculateCurrentBonusPoints, calculatePastBonusPoints } from "./bonusUtils";
import { CURRENT_TOURNAMENT_ID } from "@lib/tournamentUtils";
import { calculateCurrentRoleplayPoints, calculatePastRoleplayPoints } from "./roleplayUtils";

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MatchEntry = CollectionEntry<'matches'>;
type MemberEntry = CollectionEntry<'members'>;

// Función principal COMPLETAMENTE AUTOMÁTICA
export function getMemberTotalScore(
  member: MemberEntry,
  tournaments: TournamentEntry[],
  matches: MatchEntry[],
  currentTournamentId: number = CURRENT_TOURNAMENT_ID,
): {
  totalScore: number
  breakdown: {
    currentRoleplay: number,
    pastRoleplay: number,
    currentEventPoints: number // NUEVO
    pastEventPoints: number // NUEVO
    totalEventPoints: number // NUEVO
    currentBonus: number
    pastBonus: number
    tournamentDecayPoints: number
  }
  details: {
    currentRoleplay: Record<string, number> 
    currentEvents: Record<string, number> 
    pastEventBreakdown: Array<{
      tournamentId: number
      events: Record<string, number>
      totalTournamentPoints: number
      decayFactor: number
      finalPoints: number
    }>
    currentBonus: Record<string, number>
    tournamentBreakdown: Array<{
      tournamentId: number
      tournamentName: string
      points: number
      decayFactor: number
      finalPoints: number
    }>
  }
} {
  const score = member.data.score
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId)

  {/* 🎭 ROLEPLAY */}
  // 1️⃣ ROLEPLAY POINTS (semi-automático - ACTUALES + ANTERIORES)
  const roleplayResult = calculateCurrentRoleplayPoints(score.rp, member, currentTournamentId);
  const pastRoleplayPoints = calculatePastRoleplayPoints(score.rp, lastFourIds);
  const roleplayPoints = roleplayResult.totalPoints;

  {/* 🎉 EVENTS */}
  // 2️⃣ EVENT POINTS (automático - ACTUALES + ANTERIORES)
  const eventResult = calculateAllEventPoints(score?.events ?? {}, currentTournamentId, lastFourIds);
  const currentEventPoints = eventResult.currentEventPoints;
  const pastEventPoints = eventResult.pastEventPoints;
  // Aplicar al TOTAL de eventos (actuales + anteriores)
  const totalEventPoints = eventResult.totalEventPoints;
  
  {/* 🎁 BONUS */}
  // 3️⃣ BONUS POINTS (actuales + anteriores)
  const bonusResult = calculateCurrentBonusPoints(score.bonus, currentTournamentId);
  const currentBonus = bonusResult.totalPoints;
  const pastBonus = calculatePastBonusPoints(score.bonus, lastFourIds);
  const bonusPoints = currentBonus + pastBonus;

  {/* 🏆 TOURNAMENT DECAY POINTS */}
  // 4️⃣ TOURNAMENT DECAY POINTS (automático)
  // Obtener puntos de las ediciones anteriores con decay
  const tournamentResult = calculateTournamentDecayPoints(
    member.data.name, // Nombre del equipo
    tournaments,
    matches,
    currentTournamentId,
  )
  // Normalizar Tournament Decay Points
  const tournamentDecayPoints = Math.ceil(tournamentResult.totalPoints);
  // const tournamentDecayPoints = tournamentResult.totalPoints;

  const pastPoints = pastRoleplayPoints + pastEventPoints +  pastBonus + tournamentDecayPoints;
  const totalScore = roleplayPoints + currentEventPoints + currentBonus + pastPoints;
  return {
    totalScore,
    breakdown: {
      currentRoleplay: roleplayPoints,
      pastRoleplay: pastRoleplayPoints,
      currentEventPoints: eventResult.currentEventPoints,
      pastEventPoints: eventResult.pastEventPoints,
      totalEventPoints,
      currentBonus,
      pastBonus,
      tournamentDecayPoints,
    },
    details: {
      currentRoleplay: roleplayResult.roleplay,
      currentEvents: eventResult.currentEvents,
      pastEventBreakdown: eventResult.pastBreakdown,
      currentBonus: bonusResult.bonuses,
      tournamentBreakdown: tournamentResult.breakdown,
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
    currentRoleplay: number,
    pastRoleplay: number
    currentEventPoints: number
    pastEventPoints: number
    totalEventPoints: number
    currentBonus: number
    pastBonus: number
    tournamentDecayPoints: number
  }
  currentRoleplay: Record<string, number>
  currentEvents: Record<string, number>
  currentBonus: Record<string, number>
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
        currentRoleplay: result.details.currentRoleplay,
        currentEvents: result.details.currentEvents,
        currentBonus: result.details.currentBonus,
        totalScore: result.totalScore,
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
}
