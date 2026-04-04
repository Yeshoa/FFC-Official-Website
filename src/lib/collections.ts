import { getCollection } from 'astro:content';

import type {
  Achievement,
  Article,
  Bonus,
  Event,
  Match,
  Member,
  Roleplay,
  Sponsor,
  Stadium,
  Tournament,
} from '@ty/collections';

let membersCache: Member[] | null = null;
let tournamentsCache: Tournament[] | null = null;
let matchesCache: Match[] | null = null;
let achievementsCache: Achievement[] | null = null;
let articlesCache: Article[] | null = null;
let sponsorsCache: Sponsor[] | null = null;
let stadiumsCache: Stadium[] | null = null;

let memberByCodeCache: Map<string, Member> | null = null;
let memberByNameCache: Map<string, Member> | null = null;
let tournamentByIdCache: Map<number, Tournament> | null = null;
let matchesByTournamentCache: Map<number, Match[]> | null = null;

const [eventsCache, roleplaysCache, bonusesCache] = await Promise.all([
  getCollection('events').then(entries => entries.map(entry => entry.data as Event)),
  getCollection('roleplays').then(entries => entries.map(entry => entry.data as Roleplay)),
  getCollection('bonuses').then(entries => entries.map(entry => entry.data as Bonus)),
]);

function buildMemberIndexes(members: Member[]) {
  if (memberByCodeCache && memberByNameCache) return;

  memberByCodeCache = new Map(
    members
      .filter(member => !!member.data.code)
      .map(member => [member.data.code!.toUpperCase(), member]),
  );
  memberByNameCache = new Map(
    members.map(member => [member.data.name.toLowerCase(), member]),
  );
}

function buildTournamentIndexes(tournaments: Tournament[]) {
  if (tournamentByIdCache) return;
  tournamentByIdCache = new Map(tournaments.map(tournament => [tournament.data.id, tournament]));
}

function buildMatchesByTournament(matches: Match[]) {
  if (matchesByTournamentCache) return;

  matchesByTournamentCache = new Map<number, Match[]>();
  for (const match of matches) {
    const list = matchesByTournamentCache.get(match.data.tournament_id) ?? [];
    list.push(match);
    matchesByTournamentCache.set(match.data.tournament_id, list);
  }
}

export async function getMembers() {
  if (!membersCache) membersCache = await getCollection('members');
  membersCache.sort((a, b) => a.data.id - b.data.id);
  buildMemberIndexes(membersCache);
  return membersCache;
}

export async function getTournaments() {
  if (!tournamentsCache) tournamentsCache = await getCollection('tournaments');
  tournamentsCache.sort((a, b) => a.data.id - b.data.id);
  buildTournamentIndexes(tournamentsCache);
  return tournamentsCache;
}

export async function getMatches() {
  if (!matchesCache) matchesCache = await getCollection('matches');
  matchesCache.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  buildMatchesByTournament(matchesCache);
  return matchesCache;
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

  const sponsorsWithMember = sponsorsCache.filter(sponsor => sponsor.data.member);
  const sponsorsWithoutMember = sponsorsCache.filter(sponsor => !sponsor.data.member);

  const sortedSponsors = sponsorsWithMember.sort((a, b) =>
    a.data.type && b.data.type ? a.data.type.localeCompare(b.data.type) : 1,
  );

  return [...sortedSponsors, ...sponsorsWithoutMember];
}

export async function getStadiums() {
  if (!stadiumsCache) stadiumsCache = await getCollection('stadiums');
  return stadiumsCache;
}

export async function getMemberByCode(code: string) {
  if (!code) return null;
  const members = await getMembers();
  buildMemberIndexes(members);
  return memberByCodeCache?.get(code.toUpperCase()) ?? null;
}

export async function getMemberByName(name: string) {
  if (!name) return null;
  const members = await getMembers();
  buildMemberIndexes(members);
  return memberByNameCache?.get(name.toLowerCase()) ?? null;
}

export async function getTournamentById(id: number) {
  const tournaments = await getTournaments();
  buildTournamentIndexes(tournaments);
  return tournamentByIdCache?.get(id) ?? null;
}

export async function getMatchesByTournament(tournamentId: number) {
  const matches = await getMatches();
  buildMatchesByTournament(matches);
  return matchesByTournamentCache?.get(tournamentId) ?? [];
}

export function getEvents() {
  return eventsCache;
}

export function getRoleplays() {
  return roleplaysCache;
}

export function getBonuses() {
  return bonusesCache;
}
