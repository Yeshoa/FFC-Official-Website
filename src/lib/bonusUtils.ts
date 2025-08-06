import { CURRENT_TOURNAMENT_ID } from "./tournamentUtils";
// Función helper para obtener puntos de eventos específicos
export const getCurrentBonusPoints = (team, bonusName: string) => {
  return team.currentBonus?.[bonusName] || 0;
};

// Obtener el total de bonus anteriores con decay
export function calculatePastBonusPoints(
  memberBonus: Record<string, Record<string, number>>,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    const tournamentIdStr = tournamentId.toString();
    const bonuses = memberBonus[tournamentIdStr] || {};
    const totalTournamentBonus = Object.values(bonuses).reduce((s, p) => s + p, 0);
    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentBonus * decayFactor;
  }, 0);
}

export function calculateCurrentBonusPoints(
  memberBonus: Record<string, Record<string, number>>,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): {
  totalPoints: number
  bonuses: Record<string, number>
} {
  const currentTournamentIdStr = currentTournamentId.toString();
  const currentBonuses = memberBonus[currentTournamentIdStr] || {};
  // Record de bonus por tipo
  const bonuses: Record<string, number> = { ...currentBonuses };

  // Total crudo de bonus actuales
  const totalPoints = Object.values(bonuses).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    bonuses,
  };
}