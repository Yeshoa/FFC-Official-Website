import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import { lockedResult } from '../types';
import { type Category, CATEGORIES, ALIGNMENTS, type Subcategory, type Alignment } from '../utils';
import type { CollectionEntry } from 'astro:content';
import { getSponsors, getArticles } from '@lib/collections';

type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;
const sponsorCollection = await getSponsors();
const articleCollection = await getArticles();

const thisCategory = CATEGORIES[5];

export const baseAchievements: AchievementDefinition[] = [];

const makeArticleAchievement = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  minArticles: number
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description: "Wrote articles for the Confederation.",
  category: thisCategory,
  subcategory: "Articles" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  stars: 1,
  evaluate: function (context) {
    const { member } = context;
    const articles = articleCollection.filter(article => article.data.nation === member.data.name);
    if (articles.length < minArticles) return lockedResult(this, articles.length, minArticles);
    const newStars = articles.length;
    return achieved(this, {
      description: `Wrote ${newStars} article${ newStars === 1 ? '' : 's'}.`,
      stars: newStars,
      current: newStars,
      target: minArticles,
      progress: 100,
    });
  }
})

const makeSponsorAchievements = (
  id: string,
  name: string,
  rarity: number,
  icon: ImageMetadata,
  minSponsors: number
): AchievementDefinition => ({
  id,
  name,
  icon,
  rarity,
  description: "Provided a sponsor to the Confederation.",
  category: thisCategory,
  subcategory: "Sponsors" as Subcategory,
  alignment: ALIGNMENTS[0],
  unique: false,
  visible: false,
  enabled: true,
  stars: 1,
  evaluate: function (context) {
    const { member } = context;
    const sponsors = sponsorCollection.filter(sponsor => sponsor.data.member === member.data.name);
    if (sponsors.length < minSponsors) return lockedResult(this, sponsors.length, minSponsors);
    const newStars = sponsors.length;
    return achieved(this, {
      description: `Provided ${newStars} sponsor${ newStars === 1 ? '' : 's'} to the Confederation.`,
      stars: newStars,
      current: newStars,
      target: minSponsors,
      progress: 100,
    });
  }
})

const sponsorAchievements: AchievementDefinition[] = [
  makeSponsorAchievements('1-sponsor', 'Entrepreneur', 0, Trophy, 1),
  makeSponsorAchievements('3-sponsor', 'Bussinessman', 1, Trophy, 3),
  makeSponsorAchievements('5-sponsor', 'Investor', 1, Trophy, 5),
  makeSponsorAchievements('7-sponsor', 'Financier', 2, Trophy, 7),
  makeSponsorAchievements('10-sponsor', 'Magnate', 2, Trophy, 10),
  makeSponsorAchievements('15-sponsor', 'Tycoon', 3, Trophy, 15),
]

const articleAchievements: AchievementDefinition[] = [
  makeArticleAchievement('1-article', 'Journalist', 0, Trophy, 1),
  makeArticleAchievement('3-article', 'Reporter', 1, Trophy, 3),
  makeArticleAchievement('5-article', 'Editor', 2, Trophy, 5),
  makeArticleAchievement('7-article', 'Columnist', 3, Trophy, 7),
  makeArticleAchievement('10-article', 'Journalist Extraordinaire', 4, Trophy, 10),
  makeArticleAchievement('15-article', 'Investigative Journalist', 5, Trophy, 15),
  makeArticleAchievement('20-article', 'FFC Historian', 6, Trophy, 20),
  makeArticleAchievement('50-article', 'Roleplay Legend', 7, Trophy, 50),
];

export const communityAchievements: AchievementDefinition[] = [
  ...baseAchievements,
  ...sponsorAchievements,
  ...articleAchievements
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
