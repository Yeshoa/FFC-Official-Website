import type { CollectionEntry } from "astro:content"
import { calculateTournamentDecayPoints, getLastFourTournamentIds } from "src/utils/tournamentUtils"
import { calculateAllEventPoints } from "@lib/eventUtils"
import { normalizePoints, SCORING_CONFIG } from "./scoreUtils";
import { calculateCurrentBonusPoints, calculatePastBonusPoints } from "./bonusUtils";
import { CURRENT_TOURNAMENT_ID } from "src/utils/tournamentUtils";
import { calculateCurrentRoleplayPoints, calculatePastRoleplayPoints } from "./roleplayUtils";
import { getTournaments, getRoleplays, getEvents, getBonuses } from '@lib/collections';
import { getMemberTier } from "../utils/memberUtils";
import { getCurrentRoleplays } from "./roleplayUtils";
import { getCurrentEvents } from "./eventUtils";
import { getCurrentBonuses } from "./bonusUtils";

// 🟢 Tipos
type TournamentEntry = CollectionEntry<'tournaments'>;
type MemberEntry = CollectionEntry<'members'>;

const tournaments = await getTournaments()

// ============================================================================
// HELPERS INTERNOS - Completan datos con 0s para items que no tienen puntos
// ============================================================================

/**
 * Retorna TODOS los roleplays de la edición actual, completados con 0s
 * para los que el miembro no participó
 */
function getCurrentRoleplayDataWithDefaults(
  memberName: string,
  roleplayBreakdown: Record<string, number>
): Record<string, number> {
  const allRoleplays = getCurrentRoleplays();
  const result: Record<string, number> = {};
  
  allRoleplays.forEach(rp => {
    result[rp.name] = roleplayBreakdown[rp.name] ?? 0;
  });
  
  return result;
}

/**
 * Retorna TODOS los eventos de la edición actual, completados con 0s
 * para los que el miembro no participó
 */
function getCurrentEventDataWithDefaults(
  memberName: string,
  eventBreakdown: Record<string, number>
): Record<string, number> {
  const allEvents = getCurrentEvents();
  const result: Record<string, number> = {};
  
  allEvents.forEach(event => {
    result[event.name] = eventBreakdown[event.name] ?? 0;
  });
  
  return result;
}

/**
 * Retorna TODOS los bonuses de la edición actual, completados con 0s
 * para los que el miembro no participó
 */
function getCurrentBonusDataWithDefaults(
  memberName: string,
  bonusBreakdown: Record<string, number>
): Record<string, number> {
  const allBonuses = getCurrentBonuses();
  const result: Record<string, number> = {};
  allBonuses.forEach(bonus => {
    result[bonus.name] = bonusBreakdown[bonus.type] ?? 0;
    // result[bonus.name] = bonusBreakdown[bonus.name] ?? 0; // No se compara con name, se compara con type o id
  });
  
  return result;
}

// ============================================================================
// FUNCIÓN PRINCIPAL - Obtiene scores detallados DE UN MIEMBRO
// ============================================================================

export async function getMemberScoreDetails(
  member: MemberEntry,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID,
): Promise<{
  member: {
    slug: string;
    name: string;
    code: string;
    flag: any;
  };
  scores: {
    currentRoleplay: number;
    pastRoleplay: number;
    currentEventPoints: number;
    pastEventPoints: number;
    currentBonus: number;
    pastBonus: number;
    tournamentDecayPoints: number;
  };
  details: {
    currentRoleplay: Record<string, number>;
    currentEvents: Record<string, number>;
    currentBonus: Record<string, number>;
    pastBreakdown: {
      pastRoleplay: number;
      pastEvents: number;
      pastBonus: number;
      tournamentResults: number;
    };
  };
  totalScore: number;
  tier: string;
}> {
  const memberName = member.data.name;
  const lastFourIds = getLastFourTournamentIds(tournaments, currentTournamentId);

  // ==========  ROLEPLAY ==========
  const roleplayResult = calculateCurrentRoleplayPoints(memberName);
  const pastRoleplayPointsRaw = calculatePastRoleplayPoints(memberName, lastFourIds);
  const pastRoleplayPoints = normalizePoints(pastRoleplayPointsRaw, SCORING_CONFIG.PRP_RAW_MAX, SCORING_CONFIG.PRP_MAX);
  
  const currentRoleplayData = getCurrentRoleplayDataWithDefaults(memberName, roleplayResult.roleplay);

  // ==========  EVENTS ==========
  const eventResult = calculateAllEventPoints(memberName, currentTournamentId, lastFourIds);
  const currentEventData = getCurrentEventDataWithDefaults(memberName, eventResult.currentEvents);

  // ==========  BONUS ==========
  const bonusResult = await calculateCurrentBonusPoints(member, currentTournamentId);
  const pastBonus = await calculatePastBonusPoints(member, lastFourIds);
  const currentBonusData = getCurrentBonusDataWithDefaults(memberName, bonusResult.bonuses);

  // ==========  TOURNAMENT DECAY ==========
  const tournamentResult = await calculateTournamentDecayPoints(memberName, tournaments, currentTournamentId);
  const tournamentDecayPoints = Math.ceil(tournamentResult.totalPoints);

  // ==========  TOTALES Y RETORNO ==========
  const currentRoleplayTotal = roleplayResult.totalPoints;
  const currentEventTotal = eventResult.currentEventPoints;
  const currentBonusTotal = bonusResult.totalPoints;
  const pastPoints = pastRoleplayPoints + eventResult.pastEventPoints + pastBonus + tournamentDecayPoints;
  const totalScore = currentRoleplayTotal + currentEventTotal + currentBonusTotal + pastPoints;

  return {
    member: {
      slug: member.slug,
      name: member.data.name,
      code: member.data.code ?? '',
      flag: member.data.flagPath,
    },
    scores: {
      currentRoleplay: currentRoleplayTotal,
      pastRoleplay: pastRoleplayPoints,
      currentEventPoints: currentEventTotal,
      pastEventPoints: eventResult.pastEventPoints,
      currentBonus: currentBonusTotal,
      pastBonus,
      tournamentDecayPoints,
    },
    details: {
      currentRoleplay: currentRoleplayData,
      currentEvents: currentEventData,
      currentBonus: currentBonusData,
      pastBreakdown: {
        pastRoleplay: pastRoleplayPoints,
        pastEvents: eventResult.pastEventPoints,
        pastBonus,
        tournamentResults: tournamentDecayPoints,
      },
    },
    totalScore,
    tier: getMemberTier(totalScore),
  };
}

/**
 * Función anterior mantenida por compatibilidad (es un wrapper)
 */
export async function getMemberTotalScore(
  member: MemberEntry,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID,
): Promise<{
  totalScore: number
  breakdown: {
    currentRoleplay: number,
    pastRoleplay: number,
    currentEventPoints: number
    pastEventPoints: number
    totalEventPoints: number
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
}> {
  const result = await getMemberScoreDetails(member, currentTournamentId);
  // Reconstruct para mantener compatibilidad
  return {
    totalScore: result.totalScore,
    breakdown: {
      currentRoleplay: result.scores.currentRoleplay,
      pastRoleplay: result.scores.pastRoleplay,
      currentEventPoints: result.scores.currentEventPoints,
      pastEventPoints: result.scores.pastEventPoints,
      totalEventPoints: result.scores.currentEventPoints + result.scores.pastEventPoints,
      currentBonus: result.scores.currentBonus,
      pastBonus: result.scores.pastBonus,
      tournamentDecayPoints: result.scores.tournamentDecayPoints,
    },
    details: {
      currentRoleplay: result.details.currentRoleplay,
      currentEvents: result.details.currentEvents,
      pastEventBreakdown: [],
      currentBonus: result.details.currentBonus,
      tournamentBreakdown: [],
    },
  };
}
// ============================================================================
// FUNCIÓN RANKINGS - Obtiene scores para TODOS los miembros verificados, 
// ordenados por puntaje total (descendente)
// ============================================================================

export async function getRankedMembers(
  members: MemberEntry[],
  currentTournamentId?: number,
): Promise<Array<{
  slug: string
  name: string
  code: string
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
  tier: string
}>> {
  const ranked = await Promise.all(
    members
      .filter((member) => member.data.verified)
      .map(async (member) => {
        const result = await getMemberScoreDetails(member, currentTournamentId);
        return {
          slug: result.member.slug,
          name: result.member.name,
          code: result.member.code,
          flag: result.member.flag,
          scores: {
            currentRoleplay: result.scores.currentRoleplay,
            pastRoleplay: result.scores.pastRoleplay,
            currentEventPoints: result.scores.currentEventPoints,
            pastEventPoints: result.scores.pastEventPoints,
            totalEventPoints: result.scores.currentEventPoints + result.scores.pastEventPoints,
            currentBonus: result.scores.currentBonus,
            pastBonus: result.scores.pastBonus,
            tournamentDecayPoints: result.scores.tournamentDecayPoints,
          },
          currentRoleplay: result.details.currentRoleplay,
          currentEvents: result.details.currentEvents,
          currentBonus: result.details.currentBonus,
          totalScore: result.totalScore,
          tier: result.tier,
        };
      })
  );

  return ranked.sort((a, b) => b.totalScore - a.totalScore);
}

// ============================================================================
// UTILIDADES
// ============================================================================

export function getRankClass(ranking: number): string {
  return ranking === 1
    ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]'
    : ranking === 2
    ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.7)]'
    : ranking === 3
    ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]'
    : 'text-green-400';
}
