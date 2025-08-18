import type { CollectionEntry } from "astro:content";
import { CURRENT_TOURNAMENT_ID } from "./tournamentUtils";
import bonusData from "@content/bonus.json";
import easterEggData from "@content/easter-eggs.json";

// Combine bonus and easter egg data into one array.
const allBonusItems = [...bonusData, ...easterEggData];

// Calculates past bonus and easter egg points with decay
export function calculatePastBonusPoints(
  memberName: string,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): number {
  const totalPastPoints = lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    // Find all bonus/ee for the member in the given past tournament
    const pastItems = allBonusItems.filter(
      item => item.edition === tournamentId && item.participants.some(p => p.member_name === memberName)
    );

    // Sum scores for that tournament
    const totalTournamentBonus = pastItems.reduce((tournamentSum, item) => {
      const participant = item.participants.find(p => p.member_name === memberName);
      return tournamentSum + (participant ? participant.score : 0);
    }, 0);

    const decayFactor = decayFactors[index] || 0;
    return sum + totalTournamentBonus * decayFactor;
  }, 0);

  return Math.ceil(totalPastPoints);
}

// Calculates current bonus and easter egg points
export function calculateCurrentBonusPoints(
  memberName: string,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): {
  totalPoints: number;
  bonuses: Record<string, number>;
} {
  // Get all bonus/ee scores for the current edition from the JSON files
  const currentItems = allBonusItems.filter(
    item => item.edition === currentTournamentId && item.participants.some(p => p.member_name === memberName)
  );

  const bonuses: Record<string, number> = {};
  
  currentItems.forEach(item => {
    const participant = item.participants.find(p => p.member_name === memberName);
    if (participant) {
      bonuses[item.abbreviation] = participant.score;
    }
  });

  const totalPoints = Object.values(bonuses).reduce((sum, points) => sum + points, 0);

  return {
    totalPoints,
    bonuses,
  };
}

// Helper to get points for a specific bonus from a calculated breakdown
export const getCurrentBonusPoints = (team: { currentBonus?: Record<string, number> }, bonusName: string): number => {
  return team.currentBonus?.[bonusName] || 0;
};