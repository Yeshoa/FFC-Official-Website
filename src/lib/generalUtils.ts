import { getCollection } from 'astro:content';

let membersCache: any[] | null = null;
let tournamentsCache: any[] | null = null;
let matchesCache: any[] | null = null;
let achievementsCache: any[] | null = null;
let articlesCache: any[] | null = null;
let sponsorsCache: any[] | null = null;

export async function getMembers() {
  if (!membersCache) membersCache = await getCollection('members');
  return membersCache;
}

export async function getTournaments() {
  if (!tournamentsCache) tournamentsCache = await getCollection('tournaments');
  return tournamentsCache;
}

export async function getMatches() {
  if (!matchesCache) matchesCache = await getCollection('matches');
  return matchesCache;
}

export async function getAchievements() {
  if (!achievementsCache) achievementsCache = await getCollection('achievements');
  return achievementsCache;
}

export async function getArticles() {
  if (!articlesCache) articlesCache = await getCollection('articles');
  return articlesCache;
}

export async function getSponsors() {
  if (!sponsorsCache) sponsorsCache = await getCollection('sponsors');
  return sponsorsCache;
}
