import clubsData from './clubs.json';

export interface ClubSquad {
  coach?: string;
  formation?: string;
}

export interface ClubColors {
  primary: string;
  secondary: string;
}

export interface Club {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  federation: string; // código de federación dueña (display)
  federationId?: number; // id global del miembro dueño (fuente de verdad)
  logoPath?: string;
  founded?: number;
  stadiumId?: number;
  colors?: ClubColors;
  budget?: number;
  squad?: ClubSquad;
}

const clubs: Club[] = clubsData as Club[];

const byId = new Map<number, Club>();
const byCode = new Map<string, Club>();
const byFederation = new Map<string, Club[]>();
const byFederationId = new Map<number, Club[]>();

for (const club of clubs) {
  byId.set(club.id, club);
  byCode.set(club.code.trim().toLowerCase(), club);
  const fed = club.federation.trim().toLowerCase();
  const list = byFederation.get(fed) ?? [];
  list.push(club);
  byFederation.set(fed, list);
  if (club.federationId !== undefined) {
    const idList = byFederationId.get(club.federationId) ?? [];
    idList.push(club);
    byFederationId.set(club.federationId, idList);
  }
}

export function getAllClubs(): Club[] {
  return clubs;
}

export function getClubById(id: number): Club | null {
  return byId.get(id) ?? null;
}

export function getClubByCode(code: string): Club | null {
  if (!code) return null;
  return byCode.get(code.trim().toLowerCase()) ?? null;
}

export function loadClubsByFederation(federation: string): Club[] {
  return byFederation.get(federation.trim().toLowerCase()) ?? [];
}

export function loadClubsByFederationId(federationId: number): Club[] {
  return byFederationId.get(federationId) ?? [];
}
