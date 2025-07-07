import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

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
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): number | null {
  if (!memberName) return null;

  const member = members.find(m => m.data.name === memberName);
  if (!member) return null;

  const rankedMembers = members
    .filter(m => m.data.verified)
    .map(m => ({
      name: m.data.name,
      totalScore: getMemberTotalScore(m),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const rankIndex = rankedMembers.findIndex(m => m.name === memberName);
  return rankIndex === -1 ? null : rankIndex + 1;
}

export function getMemberTotalScore(member: CollectionEntry<'members'>): number {
  const score = member.data.score;

  const rpHistory = score?.rp?.history ?? 0;
  const rpResults = score?.rp?.results ?? 0;
  const eventsLastEdition = score?.events?.lastEditionPoints ?? 0;
  const eventsPoetry = score?.events?.poetry ?? 0;
  const bonusHost = score?.bonus?.host ?? 0;
  const bonusExtra = score?.bonus?.extra ?? 0;

  return rpHistory + rpResults + eventsLastEdition + eventsPoetry + bonusHost + bonusExtra;
}

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
}

export function getTotalColorClass(total: number) {
  if (total >= 110) return "text-cyan-500";
  if (total >= 84) return "text-red-500";
  if (total >= 62) return "text-orange-500";
  if (total >= 42) return "text-yellow-500";
  if (total >= 28) return "text-green-500";
  if (total >= 18) return "text-blue-500";
  if (total >= 10) return "text-purple-500";
  if (total >= 4) return "text-pink-500";
  return "text-gray-500"; // Color predeterminado para valores < 4
};

export function getMemberTier(total: number): string {
  if (total >= 110) return "X";
  if (total >= 84) return "SS";
  if (total >= 62) return "S";
  if (total >= 42) return "A";
  if (total >= 28) return "B";
  if (total >= 18) return "C";
  if (total >= 10) return "D";
  if (total >= 4) return "E";
  return "F"; // Tier predeterminado para valores < 4
}