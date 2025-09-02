import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import events from '@data/events.json';
import roleplays from '@data/roleplays.json';
import bonuses from '@data/bonuses.json';

import type { Member, Tournament, Match, Achievement, Article, Sponsor, Stadium } from '@ty/collections';

// CACHES
let membersCache: Member[] | null = null;
let tournamentsCache: Tournament[] | null = null;
let matchesCache: Match[] | null = null;
let achievementsCache: Achievement[] | null = null;
let articlesCache: Article[] | null = null;
let sponsorsCache: Sponsor[] | null = null;
let stadiumsCache: Stadium[] | null = null;
// let eventsCache: CollectionEntry<'events'>[] | null = null;

// GETTERS
export async function getMembers() {
  if (!membersCache) membersCache = await getCollection('members');
  return membersCache.sort((a, b) => a.data.id - b.data.id); // Ascending
}

export async function getTournaments() {
  if (!tournamentsCache) tournamentsCache = await getCollection('tournaments');
  return tournamentsCache.sort((a, b) => a.data.id - b.data.id);
}

export async function getMatches() {
  if (!matchesCache) matchesCache = await getCollection('matches');
  return matchesCache.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()); // Descending
}

export async function getAchievements() {
  if (!achievementsCache) achievementsCache = await getCollection('achievements');
  return achievementsCache;
}

export async function getArticles() {
  if (!articlesCache) articlesCache = await getCollection('articles');
  articlesCache.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return articlesCache;
}

export async function getSponsors() {
  if (!sponsorsCache) sponsorsCache = await getCollection('sponsors');

  // Separar los sponsors con member definido de los que no lo tienen
  const sponsorsWithMember = sponsorsCache.filter(sponsor => sponsor.data.member);
  const sponsorsWithoutMember = sponsorsCache.filter(sponsor => !sponsor.data.member);

  // Ordenar aleatoriamente los sponsors con member
  const shuffledSponsors = sponsorsWithMember
  .sort((a, b) => a.data.type && b.data.type ? a.data.type.localeCompare(b.data.type) : 1);

  // Concatenar los sponsors sin member al final
  return [...shuffledSponsors, ...sponsorsWithoutMember];
}


export async function getStadiums() {
  if (!stadiumsCache) stadiumsCache = await getCollection('stadiums');
  return stadiumsCache;
}

export function getEvents() {
  // if (!eventsCache) eventsCache = await getCollection('events');
  // return eventsCache;
  return events;
}

export function getRoleplays() {
  return roleplays;
}

export function getBonuses() {
  return bonuses;
}