import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import { type Category, CATEGORIES, tiers, ALIGNMENTS, type Subcategory } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getAllMatchesByTeam, getMatchWinnerId } from 'src/utils/matchUtils';
import { getMemberById } from 'src/utils/memberUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

const thisCategory = CATEGORIES[6];

const makeReachedTierAchievements = (
  id: string,
  name: string,
  rarity: number,
  stars: number,
  icon: ImageMetadata,
  tier: string,
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  stars,
  description: "Reached Tier " + tier + " at least once.",
  category: thisCategory,
  subcategory: "Reached Tier" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  evaluate: function (context) {
    const { member } = context;
    if (!member.data.tierHistory) return null;
    const reachedTier = member.data.tierHistory.filter(t => t.tier === tier);
    const times = reachedTier.length;
    if (reachedTier.length < 1) return null;
    const list = reachedTier.map((t, i, arr) => i === arr.length - 1 && arr.length > 1 ? ` and ${t.edition}` : t.edition).join(', ');
    const newDescription = times === 1
      ? "Reached Tier " + tier + " in " + list + "."
      : times < 9 ? "Reached Tier " + tier + " " + times + " times (" + list + ")."
      : "Reached Tier " + tier + " " + times + " times.";

    const newStars = reachedTier.length;
    const bonus = Math.floor((newStars - 1) / 8); // 1 extra rarity por cada 8 estrellas
    const newRarity = rarity + bonus;

    return achieved(this, {
      stars: newStars,
      description: newDescription,
      rarity: newRarity,
      current: times,
      target: 1,
      progress: 100,
    });
  }
});

const reachedTierAchievements: AchievementDefinition[] = [
  makeReachedTierAchievements('reached-tier-s', 'Powerhouse', 2, 1, Trophy, 'S'),
  makeReachedTierAchievements('reached-tier-ss', 'Super Team', 3, 1, Trophy, 'SS'),
  makeReachedTierAchievements('reached-tier-x', 'Apex', 5, 1, Trophy, 'X'),
]

const makeBeatTierAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  tier: string,
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description: "Beaten a Tier " + tier + " team being a lower Tier team.",
  category: thisCategory,
  subcategory: "Beaten Higher Tier" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  stars: 1,
  evaluate: function (context) {
    const { matches, members, member } = context;
    const memberId = member.data.id;
    const history = member.data.tierHistory;
    if (!history) return null;
    const played = getAllMatchesByTeam(memberId, matches);
    let bestStars = -1;
    let bestEdition = null;
    let bestOpponentTier = null;
    let bestOpponentName = null;

    for (const m of played) {
      const edition = m.data.date.getFullYear();
      const selfRecord = history.find(h => h.edition === edition);
      if (!selfRecord) continue;

      const opponentId = m.data.team1Id === memberId ? m.data.team2Id : m.data.team1Id;
      if (opponentId === undefined || opponentId === null) continue;
      const oppMember = getMemberById(opponentId, members);
      const oppHistory = oppMember?.data?.tierHistory ?? [];
      const oppRecord = oppHistory.find(h => h.edition === edition);
      if (!oppRecord || oppRecord.tier !== tier) continue;

      const selfLevel = tiers.indexOf(selfRecord.tier as typeof tiers[number]);
      const oppLevel = tiers.indexOf(oppRecord.tier as typeof tiers[number]);
      if (oppLevel <= selfLevel) continue;

      const winnerId = getMatchWinnerId(m.data);
      if (winnerId !== memberId) continue;

      const stars = oppLevel - selfLevel;
      if (stars > bestStars) {
        bestStars = stars;
        bestEdition = edition;
        bestOpponentTier = oppRecord.tier;
        bestOpponentName = oppMember?.data.name ?? null;
      }
    }

    if (bestStars > 0 && bestEdition && bestOpponentTier) {
      const opponentSegment = bestOpponentName ? ` against ${bestOpponentName}` : '';
      return achieved(this, {
        stars: bestStars,
        description: `Beaten a ${bestOpponentTier} team being ${bestStars} tiers lower${opponentSegment}.`,
        current: bestStars,
        target: 1,
        progress: 100,
      });
    }

    return null;
  }
});

const beatTierAchievements: AchievementDefinition[] = [
  makeBeatTierAchievements('beat-tier-s', 'Powerhouse Slayer', 1, Trophy, 'S'),
  makeBeatTierAchievements('beat-tier-ss', 'Super Team Slayer', 2, Trophy, 'SS'),
  makeBeatTierAchievements('beat-tier-x', 'Apex Slayer', 4, Trophy, 'X'),
]

export const rankingAchievements: AchievementDefinition[] = [
  ...reachedTierAchievements,
  ...beatTierAchievements
];

/** Marca un resultado como logrado, preservando la visibilidad de la definición. */
function achieved(def: AchievementDefinition, overrides: Partial<AchievementResult>): AchievementResult {
  return {
    id: def.id,
    achieved: true,
    visible: def.visible,
    ...overrides,
  };
}
