import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getMemberTotalScore } from './rankingUtils';
import { TIERS } from './scoreUtils';

export function getMemberByName(
  name: string,
  members: CollectionEntry<'members'>[]
): CollectionEntry<'members'> | null {
  return members.find(m => m.data.name === name) ?? null;
}
export function getMemberBySlug(
  slug: string,
  members: CollectionEntry<'members'>[]
): CollectionEntry<'members'> | null {
  return members.find(m => m.slug === slug) ?? null;
}
export function getMemberImage(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): ImageMetadata | null {
  if (!memberName) return null;
  const member = members.find(m => m.data.name === memberName);
  return member?.data.flagPath ?? null;
}

export function getMemberLogo(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): ImageMetadata | null {
  if (!memberName) return null;
  const member = members.find(m => m.data.name === memberName);
  return member?.data.logoPath ?? null;
}

export function getMemberRank(
  member: CollectionEntry<'members'> | null,
  members: CollectionEntry<'members'>[],
  matches: CollectionEntry<'matches'>[],
  tournaments: CollectionEntry<'tournaments'>[],
  currentTournamentId?: number
): number | null {
  if (!member) return null;

  const rankedMembers = members
    .filter(m => m.data.verified)
    .map(m => ({
      name: m.data.name,
      totalScore: getMemberTotalScore(m, tournaments, matches, currentTournamentId).totalScore,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

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

export function getTotalColorClass(total: number): string {
  if (total >= TIERS["X"]) return "text-cyan-500";
  if (total >= TIERS["SS"]) return "text-red-500";
  if (total >= TIERS["S"]) return "text-orange-500";
  if (total >= TIERS["A"]) return "text-yellow-500";
  if (total >= TIERS["B"]) return "text-green-500";
  if (total >= TIERS["C"]) return "text-blue-500";
  if (total >= TIERS["D"]) return "text-purple-500";
  if (total >= TIERS["E"]) return "text-pink-500";
  return "text-gray-500";
}

export function getMemberTier(total: number): string {
  const entries = Object.entries(TIERS)
    .sort((a, b) => b[1] - a[1]); // Orden descendente por valor

    for (const [tier, minScore] of entries) {
    if (total >= minScore) return tier;
  }
  return "F";
}