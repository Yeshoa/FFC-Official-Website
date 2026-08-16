// Ranking de ligas (FCL): análogo al ranking de federaciones, pero con inputs propios
// de la liga (rp/events/bonus por temporada en `league.score`). El dueño carga los datos;
// mientras no haya, las ligas quedan en 0 y se ordenan por nombre.
import { CURRENT_SEASON } from '@config/season';
import type { League } from '@data/leagues';

export interface LeagueSeasonScore {
  roleplay: number;
  events: number;
  bonus: number;
  total: number;
}

function sumBreakdown(map: Record<string, number> | undefined): number {
  if (!map) return 0;
  return Object.values(map).reduce((a, b) => a + b, 0);
}

/** Puntaje de una liga para una temporada (actual por defecto). */
export function getLeagueSeasonScore(league: League, season: number = CURRENT_SEASON): LeagueSeasonScore {
  const s = league.score;
  const roleplay = sumBreakdown(s?.rp?.[`${season}`]);
  const events = sumBreakdown(s?.events?.[`${season}`]);
  const bonus = sumBreakdown(s?.bonus?.[`${season}`]);
  return { roleplay, events, bonus, total: roleplay + events + bonus };
}

/** Liga con su puntaje, para la UI del ranking. */
export interface RankedLeague {
  league: League;
  score: LeagueSeasonScore;
}

/** Todas las ligas ordenadas por puntaje de temporada (desc), tiebreak por nombre. */
export function getRankedLeagues(leagues: League[], season: number = CURRENT_SEASON): RankedLeague[] {
  return leagues
    .map((league) => ({ league, score: getLeagueSeasonScore(league, season) }))
    .sort(
      (a, b) => b.score.total - a.score.total || a.league.name.localeCompare(b.league.name),
    );
}

/** Top N ligas (para la home compacta). */
export function getTopLeagues(leagues: League[], limit: number, season: number = CURRENT_SEASON): RankedLeague[] {
  return getRankedLeagues(leagues, season).slice(0, limit);
}
