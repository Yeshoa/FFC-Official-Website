// Las ligas se cargan de un archivo por división: <federacion>/division-<n>.json.
const leagueFiles = import.meta.glob('./**/division-*.json', {
  eager: true,
  import: 'default',
}) as Record<string, League>;

// Los clubes se referencian por id global (`clubId`), NUNCA por code (el code es visual
// y puede repetirse). La liga pertenece a una federación (`federationId`) y puede tener
// varias divisiones (`division`).
export interface LeagueStandingRow {
  position: number;
  clubId: number;
  clubName?: string; // fallback de display si el club no existe aún en clubs.json
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// Score del ranking de ligas (análogo al de federaciones, con sus propios inputs).
// Indexado por temporada (año): { season: { activity: points } }.
export interface LeagueScore {
  rp: Record<string, Record<string, number>>;
  events: Record<string, Record<string, number>>;
  bonus: Record<string, Record<string, number>>;
}

export interface League {
  id: string;
  name: string;
  division: number;
  federationId: number; // id global de la federación (fuente de verdad)
  season: number;
  logoPath?: string; // logo de la división (escudo de la liga)
  relegationPositions: number[]; // posiciones que descienden (tono rojo)
  championsLeaguePositions: number[]; // posiciones que clasifican a la CL (tono verde)
  standings: LeagueStandingRow[];
  score?: LeagueScore; // ranking de ligas (eventos/bonuses por temporada); lo carga el dueño
}

const leagues: League[] = Object.values(leagueFiles).sort(
  (a, b) => a.federationId - b.federationId || a.division - b.division,
);

// Primera división de una federación (lo que se muestra en la página del miembro).
export function getFirstDivision(federationId: number): League | null {
  return (
    leagues
      .filter((l) => l.federationId === federationId)
      .sort((a, b) => a.division - b.division)[0] ?? null
  );
}

// Todas las divisiones de una federación (para futuras vistas de ligas).
export function getLeaguesByFederation(federationId: number): League[] {
  return leagues
    .filter((l) => l.federationId === federationId)
    .sort((a, b) => a.division - b.division);
}

// La división donde juega un club (lo que se muestra en la página del club).
export function getLeagueForClub(clubId: number): League | null {
  return leagues.find((l) => l.standings.some((row) => row.clubId === clubId)) ?? null;
}

export function getAllLeagues(): League[] {
  return leagues;
}
