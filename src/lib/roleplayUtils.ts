import { SCORING_CONFIG } from "./scoreUtils";
import { CURRENT_TOURNAMENT_ID } from "./tournamentUtils";
import roleplayData from "@content/roleplay.json";
import type { CollectionEntry } from "astro:content";

// Calculates the points of roleplay for the current tournament
export function calculateCurrentRoleplayPoints(
  team: CollectionEntry<'members'>, // The member object
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): {
  totalPoints: number;
  roleplay: Record<string, number>;
} {
  const memberName = team.data.name;

  // Get all roleplay scores for the current edition from the JSON
  const currentEditionRoleplays = roleplayData.filter(
    rp => rp.edition === currentTournamentId && rp.participants.some(p => p.member_name === memberName)
  );

  const roleplay: Record<string, number> = {};

  currentEditionRoleplays.forEach(rp => {
    const participant = rp.participants.find(p => p.member_name === memberName);
    if (participant) {
      roleplay[rp.abbreviation] = participant.score;
    }
  });

  // Keep the special case for dispatch points
  const dispatchPoints = team.data?.feddispatch ? SCORING_CONFIG.RP_MAX : 0;
  if (dispatchPoints > 0) {
    roleplay["dispatch"] = dispatchPoints;
  }

  const totalPoints = Object.values(roleplay).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    roleplay,
  };
}

// Calculates past roleplay points with decay
export function calculatePastRoleplayPoints(
  memberName: string,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  return lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    // Find all roleplays for the member in the given past tournament
    const pastEditionRoleplays = roleplayData.filter(
      rp => rp.edition === tournamentId && rp.participants.some(p => p.member_name === memberName)
    );

    // Sum scores for that tournament
    const totalTournamentRoleplay = pastEditionRoleplays.reduce((tournamentSum, rp) => {
      const participant = rp.participants.find(p => p.member_name === memberName);
      return tournamentSum + (participant ? participant.score : 0);
    }, 0);

    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentRoleplay * decayFactor;
  }, 0);
}

// Helper to get points for a specific roleplay from a calculated breakdown
export const getCurrentRoleplayPoints = (team: { currentRoleplay?: Record<string, number> }, rpName: string): number => {
  return team.currentRoleplay?.[rpName] || 0;
};