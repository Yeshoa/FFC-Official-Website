import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getMemberTotalScore } from '../lib/rankingUtils';
import { TIERS } from '../lib/scoreUtils';
import { getMembers } from '@lib/collections';
import { getAllClubs, getClubById, type Club } from '@data/clubs';
import { CURRENT_SEASON } from '@config/season';
import { ROUTES } from '@config/routes';
import type { TeamView } from '@ty/matchDetail';


// Cache para evitar múltiples llamadas
const members = await getMembers();
const memberCache = new Map<string, CollectionEntry<'members'> | null>();
const memberByIdCache = new Map<number, CollectionEntry<'members'> | null>();

// Resuelve un miembro por su id global (fuente de verdad de la Fase D).
export function getMemberById(
  id: number | string | undefined,
  memberCollection?: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null {
  if (id === null || id === undefined || id === '') return null;
  const num = typeof id === 'number' ? id : Number(id);
  if (Number.isNaN(num)) return null;

  if (memberCollection) {
    return memberCollection.find(m => m.data.id === num) ?? null;
  }
  if (memberByIdCache.has(num)) return memberByIdCache.get(num)!;
  const member = members.find(m => m.data.id === num) ?? null;
  memberByIdCache.set(num, member);
  return member;
}

export interface TeamRef {
  id: number;
  type: 'national' | 'club';
  member?: CollectionEntry<'members'> | null;
  club?: Club | null;
}

// Resuelve cualquier equipo (selección o club) por su id global único.
// La secuencia de ids es compartida entre members.json y clubs.json (Fase D),
// por lo que un id numérico identifica a un único equipo en todo el universo.
export async function getTeamById(
  id: number | string | undefined,
  memberCollection?: CollectionEntry<'members'>[],
): Promise<TeamRef | null> {
  if (id === null || id === undefined || id === '') return null;
  const num = typeof id === 'number' ? id : Number(id);
  if (Number.isNaN(num)) return null;

  const member = getMemberById(num, memberCollection);
  if (member) return { id: num, type: 'national', member, club: null };

  const club = getClubById(num);
  if (club) return { id: num, type: 'club', member: null, club };

  return null;
}

// Vista normalizada de un equipo (selección o club) para UI compartida.
// Selección -> bandera + link a /members; club -> inicial con color + link a /clubs/<slug>.
export function getTeamView(ref: TeamRef | null, fallbackName: string): TeamView {
  if (!ref) return { name: fallbackName, type: 'national' };
  if (ref.type === 'club' && ref.club) {
    return {
      name: ref.club.name,
      code: ref.club.slug,
      href: ROUTES.clubs.detail(ref.club.slug),
      type: 'club',
      color: ref.club.colors?.primary,
    };
  }
  if (ref.member) {
    return {
      name: ref.member.data.name,
      code: ref.member.data.code,
      flag: ref.member.data.flagPath ?? null,
      href: ROUTES.members.detail(ref.member.id),
      type: 'national',
    };
  }
  return { name: fallbackName, type: 'national' };
}

// Resuelve las vistas de ambos equipos de un partido por id global.
export async function getMatchTeamViews(
  match: CollectionEntry<'matches'>,
): Promise<{ team1: TeamView; team2: TeamView }> {
  const [ref1, ref2] = await Promise.all([
    getTeamById(match.data.team1Id),
    getTeamById(match.data.team2Id),
  ]);
  return {
    team1: getTeamView(ref1, match.data.team1),
    team2: getTeamView(ref2, match.data.team2),
  };
}

// Resuelve el id global de un equipo a partir de su code/name (display -> id).
export function getTeamIdByRef(
  code?: string,
  name?: string,
): number | null {  if (code) {
    const m = members.find(m => m.data.code === code);
    if (m) return m.data.id;
    const club = getAllClubs().find(c => c.code.toLowerCase() === code.toLowerCase());
    if (club) return club.id;
  }
  if (name) {
    const m = members.find(m => m.data.name === name);
    if (m) return m.data.id;
    const club = getAllClubs().find(c => c.name.toLowerCase() === name.toLowerCase());
    if (club) return club.id;
  }
  return null;
}

function findMemberByIdentifier(
  identifier: string,
  members: CollectionEntry<'members'>[],
) {
  if (!identifier) return null;

  return (
    members.find(member =>
      member.data.name === identifier || member.data.code === identifier,
    ) ?? null
  );
}

export function getMemberByName(
  name: string,
  memberCollection: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null;
export function getMemberByName(
  name: string,
  memberCollection?: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null {
  if (memberCollection) {
    return findMemberByIdentifier(name, memberCollection);
  }

  if (memberCache.has(name)) {
    return memberCache.get(name)!;
  }

  const member = findMemberByIdentifier(name, members);
  memberCache.set(name, member);

  return member;
}

export function getMemberBySlug(
  slug: string,
  memberCollection: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null;

export async function getMemberBySlug(
  slug: string,
  memberCollection?: CollectionEntry<'members'>[],
): Promise<CollectionEntry<'members'> | null> {
  const allMembers = memberCollection ?? members;
  return allMembers.find(member => member.id === slug) ?? null;
}

export function getMemberByCode(
  code: string,
  memberCollection: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null;
export function getMemberByCode(
  code: string,
  memberCollection?: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null {
  if (!code) return null;
  return (memberCollection ?? members).find(
    m => m.data.code === code,
  ) ?? null;
}

interface MatchTeamSource {
  team1: string;
  team2: string;
  team1Code?: string;
  team2Code?: string;
  team1Id?: number;
  team2Id?: number;
  team1Type?: 'national' | 'club';
  team2Type?: 'national' | 'club';
}

// Resuelve el miembro (federación) de un lado del partido por ID global primero,
// y cae a código/name mientras la migración no complete todos los ids.
// `team1Type/team2Type` permite distinguir nacional vs club (club aún sin entidad: se resuelve por nombre hasta B4).
export function getMemberByMatchTeam(
  match: MatchTeamSource,
  side: 'team1' | 'team2',
  memberCollection?: CollectionEntry<'members'>[],
): CollectionEntry<'members'> | null {
  const id = side === 'team1' ? match.team1Id : match.team2Id;
  const type = side === 'team1' ? match.team1Type : match.team2Type;
  const code = side === 'team1' ? match.team1Code : match.team2Code;
  const name = side === 'team1' ? match.team1 : match.team2;

  if (type !== 'club' && id !== undefined && id !== null) {
    const byId = getMemberById(id, memberCollection);
    if (byId) return byId;
  }
  if (type !== 'club' && code) {
    const byCode = memberCollection
      ? getMemberByCode(code, memberCollection)
      : getMemberByCode(code);
    if (byCode) return byCode;
  }
  return memberCollection
    ? getMemberByName(name, memberCollection)
    : getMemberByName(name);
}
export function getMemberImage(
  memberName: string | undefined,
  memberCollection?: CollectionEntry<'members'>[],
): ImageMetadata | null {
  if (!memberName) return null;
  const member = findMemberByIdentifier(memberName, memberCollection ?? members);
  return member?.data.flagPath ?? null;
}

export function getMemberLogo(
  memberName: string | undefined,
  memberCollection?: CollectionEntry<'members'>[],
): ImageMetadata | null {
  if (!memberName) return null;
  const member = findMemberByIdentifier(memberName, memberCollection ?? members);
  return member?.data.logoPath ?? null;
}

export async function getMemberRank(
  member: CollectionEntry<'members'> | null,
  currentSeason: number = CURRENT_SEASON
): Promise<number | null> {
  if (!member) return null;
  const members = await getMembers();

  // esperar a que se resuelvan todos los scores
  const rankedMembers = (
    await Promise.all(
      members
        .filter(m => m.data.verified)
        .map(async m => ({
          name: m.data.name,
          totalScore: (await getMemberTotalScore(m, currentSeason)).totalScore,
        }))
    )
  ).sort((a, b) => b.totalScore - a.totalScore);

  const rankIndex = rankedMembers.findIndex(m => m.name === member.data.name);
  return rankIndex === -1 ? null : rankIndex + 1;
}

// export function getMemberTotalScore(member: CollectionEntry<'members'>): number {
//   const score = member.data.score;

//   const rpHistory = score?.rp?.history ?? 0;
//   const rpResults = score?.rp?.results ?? 0;
//   const eventsLastEdition = score?.events?.lastEditionPoints ?? 0;
//   const eventsPoetry = score?.events?.poetry ?? 0;
//   const bonusHost = score?.bonus?.host ?? 0;
//   const bonusExtra = score?.bonus?.extra ?? 0;

//   return rpHistory + rpResults + eventsLastEdition + eventsPoetry + bonusHost + bonusExtra;
// }
/* 
export function getRankedMembers(
  members: CollectionEntry<'members'>[]
): {
  slug: string;
  name: string;
  flag: ImageMetadata | null;
  scores: {
    rpHistory: number;
    rpResults: number;
    eventsLastEdition: number;
    eventsPoetry: number;
    bonusHost: number;
    bonusExtra: number;
  };
  totalScore: number;
}[] {
  return members
    .filter(member => member.data.verified)
    .map(member => {
      const score = member.data.score ?? {};
      const rpHistory = score.rp?.history ?? 0;
      const rpResults = score.rp?.results ?? 0;
      const eventsLastEdition = score.events?.lastEditionPoints ?? 0;
      const eventsPoetry = score.events?.poetry ?? 0;
      const bonusHost = score.bonus?.host ?? 0;
      const bonusExtra = score.bonus?.extra ?? 0;

      const totalScore = getMemberTotalScore(member);

      return {
        slug: member.slug,
        name: member.data.name,
        flag: member.data.flagPath,
        scores: {
          rpHistory,
          rpResults,
          eventsLastEdition,
          eventsPoetry,
          bonusHost,
          bonusExtra,
        },
        totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
} */

export function getMemberTier(total: number): string {
  const entries = Object.entries(TIERS)
    .sort((a, b) => b[1] - a[1]); // Orden descendente por valor

    for (const [tier, minScore] of entries) {
    if (total >= minScore) return tier;
  }
  return "F";
}
