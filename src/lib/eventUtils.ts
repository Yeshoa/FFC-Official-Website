import { MAX_EVENTS_POINTS, SCORING_CONFIG } from "./scoreUtils";
import { CURRENT_TOURNAMENT_ID } from "./tournamentUtils";
import eventsData from "@content/events.json";

// Main function to calculate all event points for a member
export function calculateAllEventPoints(
  memberName: string,
  currentTournamentId: number,
  lastFourTournamentIds: number[],
  EV_MAX: number = SCORING_CONFIG.EV_MAX
): {
  currentEventPoints: number;
  pastEventPoints: number;
  totalEventPoints: number;
  currentEvents: Record<string, number>;
  pastBreakdown: Array<{
    tournamentId: number;
    events: Record<string, number>;
    totalTournamentPoints: number;
    decayFactor: number;
    finalPoints: number;
  }>;
} {
  // --- Calculate Current Event Points ---
  const currentEventsFromJSON = eventsData.filter(event => event.edition === currentTournamentId);
  const normalizedEvents: Record<string, number> = {};

  for (const event of currentEventsFromJSON) {
    const participant = event.participants.find(p => p.member_name === memberName);
    if (participant) {
      // The original logic normalized against the max score *achieved* in that event.
      // Let's replicate that.
      const maxAchievedScore = Math.max(...event.participants.map(p => p.score), 0);
      const memberScore = participant.score;

      // Normalize points for this event
      normalizedEvents[event.abbreviation] = maxAchievedScore > 0
        ? Math.ceil((memberScore / maxAchievedScore) * EV_MAX)
        : 0;
    }
  }
  const currentEventPoints = Object.values(normalizedEvents).reduce((sum, p) => sum + p, 0);

  // --- Calculate Past Event Points with Decay ---
  const decayFactors = [1.0, 0.5, 0.25, 0.1];
  const pastBreakdown = lastFourTournamentIds.map((tournamentId, index) => {
    const pastEventsForTournament = eventsData.filter(
      event => event.edition === tournamentId && event.participants.some(p => p.member_name === memberName)
    );

    const events: Record<string, number> = {};
    let totalTournamentPoints = 0;

    pastEventsForTournament.forEach(event => {
        const participant = event.participants.find(p => p.member_name === memberName);
        if(participant) {
            events[event.abbreviation] = participant.score;
            totalTournamentPoints += participant.score;
        }
    });

    const decayFactor = decayFactors[index] || 0;
    const finalPoints = totalTournamentPoints * decayFactor;

    return {
      tournamentId,
      events,
      totalTournamentPoints,
      decayFactor,
      finalPoints,
    };
  });

  const pastEventPoints = pastBreakdown.reduce((sum, item) => sum + item.finalPoints, 0);

  return {
    currentEventPoints,
    pastEventPoints,
    totalEventPoints: currentEventPoints + pastEventPoints,
    currentEvents: normalizedEvents,
    pastBreakdown,
  };
}

// Helper function to get all unique event types (abbreviations)
export function getAllEventTypes(): string[] {
  const eventTypes = new Set<string>();
  eventsData.forEach(event => eventTypes.add(event.abbreviation));
  return Array.from(eventTypes).sort();
}

// Helper to get points for a specific event from a calculated breakdown
// This function assumes the 'team' object has a 'currentEvents' property,
// which is true for the object constructed in `rankingUtils.ts`.
export const getCurrentEventPoints = (team: { currentEvents?: Record<string, number> }, eventName: string): number => {
  return team.currentEvents?.[eventName] || 0;
};