// 🚀 COLLECTIONS OPTIMIZADAS PARA SITIO ESTÁTICO
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

// ⚡ PRE-CARGAR TODO EN BUILD TIME
const membersData = await getCollection('members');
const matchesData = await getCollection('matches');
const stadiumsData = await getCollection('stadiums');
const tournamentsData = await getCollection('tournaments');
const articlesData = await getCollection('articles');

// 📋 CREAR ÍNDICES PARA BÚSQUEDAS O(1)
const MEMBERS_BY_ID = new Map(membersData.map(m => [m.data.id, m]));
const MEMBERS_BY_CODE = new Map(membersData.map(m => [m.data.code, m]));
const STADIUMS_BY_ID = new Map(stadiumsData.map(s => [s.data.id, s]));
const TOURNAMENTS_BY_ID = new Map(tournamentsData.map(t => [t.data.id, t]));
const MATCHES_BY_TOURNAMENT = new Map<number, CollectionEntry<'matches'>[]>();

// Indexar matches por tournament
matchesData.forEach(match => {
  const tournamentId = match.data.tournament_id;
  if (!MATCHES_BY_TOURNAMENT.has(tournamentId)) {
    MATCHES_BY_TOURNAMENT.set(tournamentId, []);
  }
  MATCHES_BY_TOURNAMENT.get(tournamentId)!.push(match);
});

// 🔥 FUNCIONES 100% SÍNCRONAS - SIN AWAIT!

// === MEMBERS ===
export function getMembers() {
  return membersData.sort((a, b) => a.data.id - b.data.id);
}

export function getMemberById(id: number) {
  return MEMBERS_BY_ID.get(id) || null;
}

export function getMemberByCode(code: string) {
  return MEMBERS_BY_CODE.get(code) || null;
}

export function getVerifiedMembers() {
  return membersData.filter(m => m.data.verified);
}

export function getMembersByRegion(region: string) {
  return membersData.filter(m => m.data.region === region);
}

// === STADIUMS ===
export function getStadiums() {
  return stadiumsData.sort((a, b) => a.data.id - b.data.id);
}

export function getStadiumById(id: number) {
  return STADIUMS_BY_ID.get(id) || null;
}

export function getStadiumsByCountry(countryCode: string) {
  return stadiumsData.filter(s => s.data.country === countryCode);
}

export function searchStadiums(query: string) {
  const lowerQuery = query.toLowerCase();
  return stadiumsData.filter(s => 
    s.data.name.toLowerCase().includes(lowerQuery) ||
    s.data.city.toLowerCase().includes(lowerQuery)
  );
}

// === TOURNAMENTS ===
export function getTournaments() {
  return tournamentsData.sort((a, b) => b.data.year - a.data.year);
}

export function getTournamentById(id: number) {
  return TOURNAMENTS_BY_ID.get(id) || null;
}

export function getActiveTournaments() {
  return tournamentsData.filter(t => t.data.status === 'ongoing');
}

export function getTournamentsByType(type: string) {
  return tournamentsData.filter(t => t.data.type === type);
}

// === MATCHES ===
export function getMatches() {
  return matchesData.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getMatchesByTournament(tournamentId: number) {
  return MATCHES_BY_TOURNAMENT.get(tournamentId) || [];
}

export function getMatchBySlug(slug: string) {
  return matchesData.find(m => m.slug === slug) || null;
}

export function getUpcomingMatches() {
  const now = new Date();
  return matchesData
    .filter(m => m.data.status === 'scheduled' && m.data.date > now)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export function getRecentMatches(limit = 10) {
  return matchesData
    .filter(m => m.data.status === 'played')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, limit);
}

// 🔥 FUNCIÓN SÚPER OPTIMIZADA - RESUELVE TODO SÍNCRONAMENTE
export function getMatchWithDetails(slug: string) {
  const match = getMatchBySlug(slug);
  if (!match) return null;

  return {
    ...match,
    team1Data: getMemberByCode(match.data.team1),
    team2Data: getMemberByCode(match.data.team2),
    stadiumData: match.data.stadium_id ? getStadiumById(match.data.stadium_id) : null,
    tournamentData: getTournamentById(match.data.tournament_id),
  };
}

export function getMatchesWithDetails() {
  return matchesData.map(match => ({
    ...match,
    team1Data: getMemberByCode(match.data.team1),
    team2Data: getMemberByCode(match.data.team2),
    stadiumData: match.data.stadium_id ? getStadiumById(match.data.stadium_id) : null,
    tournamentData: getTournamentById(match.data.tournament_id),
  }));
}

// 🎯 FUNCIONES DE ANÁLISIS AVANZADAS (TODO SÍNCRONO)
export function getTeamMatches(teamCode: string) {
  return matchesData.filter(m => 
    m.data.team1 === teamCode || m.data.team2 === teamCode
  );
}

export function getHeadToHead(team1: string, team2: string) {
  return matchesData.filter(m => 
    (m.data.team1 === team1 && m.data.team2 === team2) ||
    (m.data.team1 === team2 && m.data.team2 === team1)
  );
}

export function getTournamentStadiums(tournamentId: number) {
  const tournamentMatches = getMatchesByTournament(tournamentId);
  const stadiumIds = [...new Set(
    tournamentMatches
      .map(m => m.data.stadium_id)
      .filter(id => id !== undefined)
  )];
  
  return stadiumIds.map(id => getStadiumById(id!)).filter(Boolean);
}

export function getStadiumMatches(stadiumId: number) {
  return matchesData.filter(m => m.data.stadium_id === stadiumId);
}

// 📊 ESTADÍSTICAS INSTANTÁNEAS
export function getTournamentStats(tournamentId: number) {
  const matches = getMatchesByTournament(tournamentId);
  const playedMatches = matches.filter(m => m.data.status === 'played');
  
  return {
    totalMatches: matches.length,
    playedMatches: playedMatches.length,
    scheduledMatches: matches.filter(m => m.data.status === 'scheduled').length,
    totalGoals: playedMatches.reduce((sum, m) => 
      sum + (m.data.goals?.length || 0), 0
    ),
    averageGoalsPerMatch: playedMatches.length > 0 
      ? (playedMatches.reduce((sum, m) => sum + (m.data.goals?.length || 0), 0) / playedMatches.length).toFixed(2)
      : 0
  };
}

export function getTeamStats(teamCode: string) {
  const teamMatches = getTeamMatches(teamCode).filter(m => m.data.status === 'played');
  
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  
  teamMatches.forEach(match => {
    const isTeam1 = match.data.team1 === teamCode;
    const team1Goals = match.data.goals?.filter(g => g.team === match.data.team1).length || 0;
    const team2Goals = match.data.goals?.filter(g => g.team === match.data.team2).length || 0;
    
    if (isTeam1) {
      goalsFor += team1Goals;
      goalsAgainst += team2Goals;
      if (team1Goals > team2Goals) wins++;
      else if (team1Goals === team2Goals) draws++;
      else losses++;
    } else {
      goalsFor += team2Goals;
      goalsAgainst += team1Goals;
      if (team2Goals > team1Goals) wins++;
      else if (team2Goals === team1Goals) draws++;
      else losses++;
    }
  });
  
  return {
    played: teamMatches.length,
    wins, draws, losses,
    goalsFor, goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws,
    winPercentage: teamMatches.length > 0 ? ((wins / teamMatches.length) * 100).toFixed(1) : 0
  };
}

// 🎨 USO EN PÁGINAS - SIN ASYNC/AWAIT
/*
---
// ⚡ TODO ES SÍNCRONO AHORA!
const matches = getMatchesWithDetails();
const recentMatches = getRecentMatches(5);
const upcomingMatches = getUpcomingMatches();
const forestStats = getTeamStats('FOR');
const wembley = getStadiumById(1);
const forestCup = getTournamentById(4);
---

<div>
  <h1>Dashboard</h1>
  
  <!-- Estadísticas instantáneas -->
  <div class="stats">
    <p>Forest: {forestStats.wins}W-{forestStats.draws}D-{forestStats.losses}L</p>
    <p>Próximos partidos: {upcomingMatches.length}</p>
  </div>
  
  <!-- Wembley info -->
  {wembley && (
    <p>Próximo partido en {wembley.data.name} ({wembley.data.capacity} capacity)</p>
  )}
</div>
*/