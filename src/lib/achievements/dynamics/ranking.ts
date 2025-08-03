import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Category, CATEGORIES, tiers, ALIGNMENTS, type Subcategory } from '../utils';
import { type CollectionEntry } from 'astro:content';
import { getAllMatchesByTeam, getMatchWinner } from '@lib/matchUtils';
import { getMemberByName } from '@lib/memberUtils';
import { getMembers } from '@lib/generalUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;

const members = getMembers();

const thisCategory = CATEGORIES[6];

const makeReachedTierAchievements = (
  id: string,
  name: string,
  rarity: number,
  stars: number,
  icon: ImageMetadata,
  tier: string,
) => ({
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
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member) {
    const { evaluate, ...base } = this;
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
    // const displayStars = ((newStars - 1) % 8) + 1;; // max 8 estrellas

    return {
      ...base,
      stars: newStars,
      description: newDescription,
      rarity: newRarity
    };
  }
});

const reachedTierAchievements: Achievement[] = [
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
) => ({
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
  evaluate: function (matches: Match[], _tournaments: Tournament[], member: Member, members: Member[]) {
    const { evaluate, ...base } = this;
    const history = member.data.tierHistory;
    if (!history) return null;
    const played = getAllMatchesByTeam(member.data.name, matches);
    let bestStars = -1;
    let bestEdition = null;
    let bestOpponentTier = null;
    let bestOpponentName = null;

    for (const m of played) {
      const edition = m.data.date.getFullYear();
      const selfRecord = history.find(h => h.edition === edition);
      if (!selfRecord) continue;

      const opponentName = m.data.team1 === member.data.name ? m.data.team2 : m.data.team1;
      const oppMember = getMemberByName(opponentName, members);
      const oppHistory = oppMember?.data.tierHistory ?? [];
      const oppRecord = oppHistory.find(h => h.edition === edition);
      if (!oppRecord || oppRecord.tier !== tier) continue;

      const selfLevel = tiers.indexOf(selfRecord.tier as typeof tiers[number]);
      const oppLevel = tiers.indexOf(oppRecord.tier as typeof tiers[number]);
      if (oppLevel <= selfLevel) continue;

      const winner = getMatchWinner(m.data);
      if (winner !== member.data.name) continue;

      const stars = oppLevel - selfLevel;
      if (stars > bestStars) {
        bestStars = stars;
        bestEdition = edition;
        bestOpponentTier = oppRecord.tier;
        bestOpponentName = opponentName;
      }
    }

    if (bestStars > 0 && bestEdition && bestOpponentTier) {
      return {
        ...base,
        stars: bestStars,
        description: `Beaten a ${bestOpponentTier} team being ${bestStars} tiers lower.`,
      };
    }

    return null;
  }
});

const beatTierAchievements: Achievement[] = [
  makeBeatTierAchievements('beat-tier-s', 'Powerhouse Slayer', 1, Trophy, 'S'),
  makeBeatTierAchievements('beat-tier-ss', 'Super Team Slayer', 2, Trophy, 'SS'),
  makeBeatTierAchievements('beat-tier-x', 'Apex Slayer', 4, Trophy, 'X'),
]
export const rankingAchievements = [
  ...reachedTierAchievements,
  ...beatTierAchievements
];
