import { CURRENT_TOURNAMENT_ID } from "../utils/tournamentUtils";
import { SCORING_CONFIG } from "./scoreUtils";
import { getTournaments } from '@lib/collections';
import { getBonuses } from '@lib/collections';
import type { Bonus, Bonuses, Member, Tournament } from '@ty/collections';

type MemberEntry = Member;
type TournamentEntry = Tournament;

const tournaments = await getTournaments();
const bonuses = getBonuses();

// Función helper para obtener puntos de eventos específicos
export const getCurrentBonusPoints = (team: Record<string, number>, bonusName: string) => {
  return team?.[bonusName] || 0;
};

// Obtener el total de bonus anteriores con decay
export async function calculatePastBonusPoints(
  member: MemberEntry,
  lastFourTournamentIds: number[],
  decayFactors: number[] = [1.0, 0.5, 0.25, 0.1]
): Promise<number> {
  return Math.ceil(lastFourTournamentIds.reduce((sum, tournamentId, index) => {
    // Buscar todos los bonuses para este torneo
    const tournamentBonuses = bonuses.filter(b => b.edition === tournamentId);
    
    // Calcular puntos de bonuses para este miembro en este torneo
    const bonusesForMember = tournamentBonuses.reduce((total, bonus) => {
      return total + (bonus.participants[member.data.name] ?? 0);
    }, 0);
    
    // Automatic calculation, deny Bilsa 2 first hosts
    const hostPoints = member.data.name === 'Bilsa' ? 0 : tournaments.find((t) => t.data.id === tournamentId)?.data.host === member.data.name ? SCORING_CONFIG.BO_MAX : 0;

    const decayFactor = decayFactors[index] || 0;
    return sum + (bonusesForMember + hostPoints) * decayFactor;
  }, 0));
}

export async function calculateCurrentBonusPoints(
  member: MemberEntry,
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
): Promise<{
  totalPoints: number
  bonuses: Record<string, number>
}> {
  // Buscar todos los bonuses para la edición actual
  const currentBonuses = bonuses.filter(b => b.edition === currentTournamentId);
  // Construir objeto con bonuses por tipo
  const bonusesRecord: Record<string, number> = {};
  currentBonuses.forEach(bonus => {
    // Usar el tipo como clave (host, eggs, extra, poll)
    bonusesRecord[bonus.type] = bonus.participants[member.data.name] ?? 0;
  });

  // Automatic calculation for host (puede ser redundante pero lo dejamos por compatibilidad)
  const hostFromTournament = tournaments.find((t) => t.data.id === currentTournamentId)?.data.host === member.data.name ? SCORING_CONFIG.BO_MAX : 0;
  if (hostFromTournament > 0) {
    bonusesRecord['host'] = hostFromTournament;
  }

  // Total de bonus actuales
  const totalPoints = Object.values(bonusesRecord).reduce((sum, points) => sum + points, 0);
  return {
    totalPoints,
    bonuses: bonusesRecord,
  };
}

export const getCurrentBonuses = (): Bonuses => {
  return bonuses.filter(bonus => bonus.edition === CURRENT_TOURNAMENT_ID);
}