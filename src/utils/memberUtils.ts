import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getMemberTotalScore } from '../lib/rankingUtils';
import { TIERS } from '../lib/scoreUtils';
import { getMembers } from '@lib/collections';
import { CURRENT_TOURNAMENT_ID } from './tournamentUtils';


// Cache para evitar múltiples llamadas
const members = await getMembers();
const memberCache = new Map<string, CollectionEntry<'members'> | null>();

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

export async function getMemberByName(
  name: string,
  memberCollection?: CollectionEntry<'members'>[],
): Promise<CollectionEntry<'members'> | null> {
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
  return allMembers.find(member => member.slug === slug) ?? null;
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
  currentTournamentId: number = CURRENT_TOURNAMENT_ID
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
          totalScore: (await getMemberTotalScore(m, currentTournamentId)).totalScore,
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
