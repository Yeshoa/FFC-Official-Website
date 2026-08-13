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
  slug: string; // ruta única derivada del nombre (code NO se usa: es visual y puede repetirse)
}

// Slugify: minúsculas, sin acentos, no-alfanuméricos -> guiones.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const clubs: Club[] = (clubsData as Omit<Club, 'slug'>[]).map((club) => {
  const base = slugify(club.name) || 'club';
  return { ...club, slug: base };
});

// Si dos clubes se llaman igual, el slug choca: se agrega un sufijo numérico (-2, -3...).
const slugCounts = new Map<string, number>();
for (const club of clubs) {
  const count = slugCounts.get(club.slug) ?? 0;
  slugCounts.set(club.slug, count + 1);
  if (count > 0) club.slug = `${club.slug}-${count + 1}`;
}

const byId = new Map<number, Club>();
const byCode = new Map<string, Club>();
const bySlug = new Map<string, Club>();
const byFederation = new Map<string, Club[]>();
const byFederationId = new Map<number, Club[]>();

for (const club of clubs) {
  byId.set(club.id, club);
  byCode.set(club.code.trim().toLowerCase(), club);
  bySlug.set(club.slug, club);
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

export function getClubBySlug(slug: string): Club | null {
  if (!slug) return null;
  return bySlug.get(slug) ?? null;
}

export function loadClubsByFederation(federation: string): Club[] {
  return byFederation.get(federation.trim().toLowerCase()) ?? [];
}

export function loadClubsByFederationId(federationId: number): Club[] {
  return byFederationId.get(federationId) ?? [];
}
