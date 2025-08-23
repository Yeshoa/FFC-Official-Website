import type { CollectionEntry } from "astro:content";
import { CURRENT_TOURNAMENT_ID } from "../utils/tournamentUtils";
import { SCORING_CONFIG } from "./scoreUtils";
import { getTournaments } from '@lib/collections';

type MemberEntry = CollectionEntry<'members'>;
type TournamentEntry = CollectionEntry<'tournaments'>;

const tournaments = await getTournaments();

// Función helper para obtener puntos de eventos específicos
export const getCurrentBonusPoints = (team, bonusName: string) => {
  return team.currentBonus?.[bonusName] || 0;
};

// Obtener el total de bonus anteriores con decay
export async function calculatePastBonusPoints(
  memberBonus: Record<string, Record<string, number>>,
  member: MemberEntry,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): Promise<number> {
  return Math.ceil(lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    const tournamentIdStr = tournamentId.toString();
    const bonuses = memberBonus[tournamentIdStr] || {};
    const totalTournamentBonus = Object.values(bonuses).reduce((s, p) => s + p, 0);
    // Automatic calculation, deny Bilsa 2 first hosts
    const hostPoints = member.data.name === 'Bilsa' ? 0 : tournaments.find((t) => t.data.id === tournamentId)?.data.host === member.data.name ? SCORING_CONFIG.BO_MAX : 0;

    const decayFactor = decayFactors[index] || 0;
    return sum + (totalTournamentBonus + hostPoints) * decayFactor;
  }, 0));
}
export async function calculateCurrentBonusPoints(
  memberBonus: Record<string, Record<string, number>>,
  member: MemberEntry,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): Promise<{
  totalPoints: number
  bonuses: Record<string, number>
}> {
  const currentTournamentIdStr = currentTournamentId.toString();
  const currentBonuses = memberBonus[currentTournamentIdStr] || {};

  // Automatic calculation
  const hostPoints = tournaments.find((t) => t.data.id === currentTournamentId)?.data.host === member.data.name ? SCORING_CONFIG.BO_MAX : 0;
  
  // Record de bonus por tipo
  const bonuses: Record<string, number> = { ...currentBonuses, host: hostPoints };

  // Total crudo de bonus actuales
  const totalPoints = Object.values(bonuses).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    bonuses,
  };
}