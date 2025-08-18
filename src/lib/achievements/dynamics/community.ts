import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { type Category, CATEGORIES, ALIGNMENTS, type Subcategory, type Alignment } from '../utils';
import { type CollectionEntry } from 'astro:content';
import { getSponsors, getArticles } from '@lib/collections';
import { getMemberByName } from '@lib/memberUtils';
import { getGoalsByTeam, getMatchWinnerIncludingPenalties } from '@lib/matchUtils';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;
type Sponsor = CollectionEntry<'sponsors'>;
const sponsorCollection = await getSponsors();
const articleCollection = await getArticles();

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
];

const makeArticleAchievement = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  minArticles: number
) => ({
  id,
  name,
  icon: icon,
  rarity: rarity,
  description: "Wrote articles for the Confederation.",
  category: thisCategory,
  subcategory: "Articles" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  stars: 1,
  evaluate: function (matches: any[], tournaments: any[], member: any) {
    const { evaluate, ...base } = this;
    const articles = articleCollection.filter(article => article.data.nation === member.data.name);
    if (articles.length < minArticles) return null;
    const newStars = articles.length;
    return {
      ...base,
      description: `Wrote ${newStars} article${ newStars === 1 ? '' : 's'}.`,
      stars: newStars,
    };
  }
})

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

const articleAchievements: Achievement[] = [
  makeArticleAchievement('1-article', 'Journalist', 0, Trophy, 1),
  makeArticleAchievement('3-article', 'Reporter', 1, Trophy, 3),
  makeArticleAchievement('5-article', 'Editor', 2, Trophy, 5),
  makeArticleAchievement('7-article', 'Columnist', 3, Trophy, 7),
  makeArticleAchievement('10-article', 'Journalist Extraordinaire', 4, Trophy, 10),
  makeArticleAchievement('15-article', 'Investigative Journalist', 5, Trophy, 15),
  makeArticleAchievement('20-article', 'FFC Historian', 6, Trophy, 20),
  makeArticleAchievement('50-article', 'Roleplay Legend', 7, Trophy, 50),
];

export const communityAchievements = [
  ...baseAchievements,
  ...sponsorAchievements,
  ...articleAchievements
];