import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Category, CATEGORIES, ALIGNMENTS, type Subcategory, type Alignment } from '../utils';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinnerIncludingPenalties } from '@lib/matchUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;
type Sponsor = CollectionEntry<'sponsors'>;
const sponsorCollection = await getCollection('sponsors');

const thisCategory = CATEGORIES[5];

export const baseAchievements: {
  id: string;
  rarity: number;
  name: string;
  icon: ImageMetadata;
  description: string;
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;
  stars?: number;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  /* {
    id: 'sponsor',
    rarity: 0,
    name: 'Bussiness Partner',
    icon: Trophy,
    description: 'Provided a sponsor to the Confederation.',
    category: thisCategory,
    subcategory: "Basic" as Subcategory,
    alignment: ALIGNMENTS[0],
    visible: false,
    unique: false,
    enabled: true,
    stars: 1,
    evaluate: function (member, sponsorCollection) {
      const { evaluate, ...base } = this;
      const sponsors = sponsorCollection.filter(sponsor => sponsor.data.member === member.data.name);
      const newStars = sponsors.length;
      const newRarity = newStars/3;
      return {
        ...base,
        description: `Provided ${newStars} sponsor${ newStars === 1 ? '' : 's'}.`,
        stars: newStars,
        rarity: newRarity,
      };
    }
  }, */
];

const makeSponsorAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  minSponsors: number
) => ({
  id,
  name,
  icon: icon,
  rarity: rarity,
  description: "Provided a sponsor to the Confederation.",
  category: thisCategory,
  subcategory: "Sponsors" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  stars: 1,
  evaluate: function (matches: any[], tournaments: any[], member: any) {
    const { evaluate, ...base } = this;
    const sponsors = sponsorCollection.filter(sponsor => sponsor.data.member === member.data.name);
    if (sponsors.length < minSponsors) return null;
    const newStars = sponsors.length;
    return {
      ...base,
      description: `Provided ${newStars} sponsor${ newStars === 1 ? '' : 's'} to the Confederation.`,
      stars: newStars,
    };
  }
})

const sponsorAchievements: Achievement[] = [
  makeSponsorAchievements('1-sponsor', 'Entrepreneur', 0, Trophy, 1),
  makeSponsorAchievements('3-sponsor', 'Bussinessman', 1, Trophy, 3),
  makeSponsorAchievements('5-sponsor', 'Investor', 1, Trophy, 5),
  makeSponsorAchievements('7-sponsor', 'Financier', 2, Trophy, 7),
  makeSponsorAchievements('10-sponsor', 'Magnate', 2, Trophy, 10),
  makeSponsorAchievements('15-sponsor', 'Tycoon', 3, Trophy, 15),
]


export const communityAchievements = [
  ...baseAchievements,
  ...sponsorAchievements
];