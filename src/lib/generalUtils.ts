import { getCollection } from 'astro:content';

// CONSTANTS
// Form links
export const NEW_MEMBERS_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLScR44EQbFVoiMEaVJKN8tOy2JiNISN_OUTtorWkOUR6pAc6Xg/viewform?usp=dialog';
export const FFC_MEMBERS_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSeRMcQ7UNr0wXewbL6OMqv60DMpvHTuA8XRclmYljGunNX-Ng/viewform?usp=dialog';
export const SPONSOR_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSfKC5ptPjarwqpH0_KkGyhXrgB2ekWj6fHyMbhGyqf0pjDzsA/viewform?usp=dialog';

export const ENABLE_DONATIONS = false;
export const LOCALE = 'en-US';
// CACHES
let membersCache: any[] | null = null;
let tournamentsCache: any[] | null = null;
let matchesCache: any[] | null = null;
let achievementsCache: any[] | null = null;
let articlesCache: any[] | null = null;
let sponsorsCache: any[] | null = null;

// GETTERS
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
