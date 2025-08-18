import { SCORING_CONFIG } from "./scoreUtils";
import { CURRENT_TOURNAMENT_ID } from "./tournamentUtils";

// Función helper para obtener puntos de eventos específicos
export const getCurrentRoleplayPoints = (team, roleplayName: string) => {
  return team.currentRoleplay?.[roleplayName] || 0;
};

// Calcula los puntos de roleplay actuales (incluye dispatchPoints)
export function calculateCurrentRoleplayPoints(
  memberRoleplay: Record<string, Record<string, number>>,
  team: any,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): {
  totalPoints: number
  roleplay: Record<string, number>
} {
  const currentTournamentIdStr = currentTournamentId.toString();
  const currentRoleplay = memberRoleplay[currentTournamentIdStr] || {};

  // Caso particular: incluye dispatchPoints si el equipo tiene fedDispatch
  const dispatchPoints = team.data?.feddispatch ? SCORING_CONFIG.RP_MAX : 0;
  const roleplay: Record<string, number> = { ...currentRoleplay, dispatch: dispatchPoints };

  const totalPoints = Object.values(roleplay).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    roleplay,
  };
}

// Calcula los puntos de roleplay pasados con decay (NO incluye dispatchPoints)
export function calculatePastRoleplayPoints(
  memberRoleplay: Record<string, Record<string, number>>,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    const tournamentIdStr = tournamentId.toString();
    const roleplay = memberRoleplay[tournamentIdStr] || {};
    const totalTournamentRoleplay = Object.values(roleplay).reduce((s, p) => s + p, 0);
    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentRoleplay * decayFactor;
  }, 0);
}