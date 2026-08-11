import leaguesData from './leagues.json';

export interface LeagueStandingRow {
  position: number;
  club: string;
  clubCode?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface League {
  season: number;
  federation: string;
  standings: LeagueStandingRow[];
}

const leagues: Record<string, League> = leaguesData as Record<string, League>;

export function getLeague(federation: string): League | null {
  if (!federation) return null;
  const code = federation.trim().toLowerCase();
  return leagues[code] ?? null;
}

export function hasLeague(federation: string): boolean {
  return getLeague(federation) !== null;
}

export function getAllLeagues(): Record<string, League> {
  return leagues;
}
