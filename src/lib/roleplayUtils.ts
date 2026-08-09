import { SCORING_CONFIG } from "./scoreUtils";
import { CURRENT_SEASON } from "@config/season";
import { getRoleplays, getMembers } from '@lib/collections';
import type { Roleplay, Roleplays } from '@ty/collections';

const roleplays = getRoleplays() as Roleplays;
const members = await getMembers();

// Calcula los puntos de roleplay actuales
export function calculateCurrentRoleplayPoints(
  memberName: string,
  RP_MAX: number = SCORING_CONFIG.RP_MAX
): {
  totalPoints: number
  roleplay: Record<string, number>
} {
  const currentRoleplays = getCurrentRoleplays();
  const roleplay: Record<string, number> = {};

  // Procesar roleplays actuales
  currentRoleplays.forEach(rp => {
    if (rp.enabled !== false) {
      const points = (rp.participants[memberName] ?? 0) * (rp.weight ?? 1);
      const maxScore = rp.maxScore || 1;
      roleplay[rp.name] = maxScore > 0 ? Math.ceil((points / maxScore) * RP_MAX) : 0;
    }
  });

  const totalPoints = Object.values(roleplay).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    roleplay,
  };
}

// Calcula los puntos de roleplay pasados con decay (NO incluye dispatchPoints)
export function calculatePastRoleplayPoints(
  memberName: string,
  lastFourSeasons: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourSeasons.reduce((sum, season, index) => {
    const pastRoleplays = getRoleplaysBySeason(season);
    const totalTournamentRoleplay = pastRoleplays.reduce((s, rp) => {
      const points = (rp.participants[memberName] ?? 0) * (rp.weight ?? 1);
      return s + points;
    }, 0);
    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentRoleplay * decayFactor;
  }, 0);
}

// Helper para obtener roleplays actuales (temporada actual)
export const getCurrentRoleplays = (): Roleplays => {
  return roleplays.filter(roleplay => roleplay.edition === CURRENT_SEASON && roleplay.enabled !== false);
};

// Helper para obtener roleplays por miembro
export const getRoleplaysByMember = (memberName: string): Roleplays => {
  return roleplays.filter(rp => rp.participants[memberName] !== undefined && rp.enabled !== false);
};

// Helper para obtener roleplays por temporada
export const getRoleplaysBySeason = (season: number): Roleplays => {
  return roleplays.filter(rp => rp.edition === season && rp.enabled !== false);
};

// Helper para obtener roleplays por miembro y temporada
export const getRoleplaysByMemberAndSeason = (memberName: string, season: number): Roleplays => {
  return roleplays.filter(rp => rp.participants[memberName] !== undefined && rp.edition === season && rp.enabled !== false);
};

// Helper para obtener roleplays actuales por miembro
export const getCurrentRoleplaysByMember = (memberName: string): Roleplays => {
  return getRoleplaysByMemberAndSeason(memberName, CURRENT_SEASON);
};

// Helper para obtener roleplays pasados por miembro
export const getPastRoleplaysByMember = (memberName: string): Roleplays => {
  return roleplays.filter(rp => rp.participants[memberName] !== undefined && rp.edition !== CURRENT_SEASON && rp.enabled !== false);
};