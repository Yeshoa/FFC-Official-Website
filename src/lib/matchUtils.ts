import type { CollectionEntry } from "astro:content";

type Match = CollectionEntry<'matches'>['data'];

export function getMatchWinner(match: Match): string | null {
  if (match.status !== 'played' || !match.goals) return null;
  const goals = getGoalsByTeam(match);
  return goals.team1 > goals.team2
  ? match.team1
  : goals.team2 > goals.team1
  ? match.team2
    : null;
}

export function getMatchWinnerIncludingPenalties(match: Match): string | null {
  if (match.status !== 'played') return null;

  const goals = getGoalsByTeam(match);

  if (goals.team1 > goals.team2) {
    return match.team1;
  } else if (goals.team2 > goals.team1) {
    return match.team2;
  }

  // Empate → Revisamos penales
  const penalties = getPenaltiesResult(match);
  if (!penalties) return null;

  if (penalties.team1 > penalties.team2) {
    return match.team1;
  } else if (penalties.team2 > penalties.team1) {
    return match.team2;
  }

  return null;
}

export function getGoalsByTeam(match: Match): { team1: number; team2: number } {
  let team1 = 0;
  let team2 = 0;

  for (const goal of match.goals || []) {
    if (goal.team === match.team1) team1++;
    else if (goal.team === match.team2) team2++;
  }

  return { team1, team2 };
}

export function getGoalScorers(match: Match): Record<string, number> {
  const scorers: Record<string, number> = {}; // Nombre de jugador y número de goles

  for (const goal of match.goals || []) {
    if (!scorers[goal.player]) scorers[goal.player] = 0;
    scorers[goal.player]++; // Incrementa el contador de goles del jugador
  }

  return scorers;
}

export function getGoalsByMinute(match: Match): { [minute: number]: string[] } {
  const timeline: { [minute: number]: string[] } = {};  

  for (const goal of match.goals || []) {
    if (!timeline[goal.minute]) timeline[goal.minute] = [];
    timeline[goal.minute].push(goal.player);
  }

  return timeline;
}

export function getMatchResult(match: Match): { team1: number; team2: number } {
  let t1 = 0, t2 = 0;

  for (const goal of match.goals || []) {
    if (goal.team === match.team1) t1++;
    else if (goal.team === match.team2) t2++;
  }

  return { team1: t1, team2: t2 };
}

export function getMatchResult90(match: Match): { team1: number; team2: number } {
  let t1 = 0, t2 = 0;

  for (const goal of match.goals || []) {
    if (goal.minute <= 90) {
      if (goal.team === match.team1) t1++;
      else if (goal.team === match.team2) t2++;
    }
  }

  return { team1: t1, team2: t2 };
}

export function getExtraTimeResult(match: Match): { team1: number; team2: number } | null {
  let t1 = 0, t2 = 0;

  for (const goal of match.goals || []) {
    if (goal.minute > 90) {
      if (goal.team === match.team1) t1++;
      else if (goal.team === match.team2) t2++;
    }
  }

  if (t1 === 0 && t2 === 0) return null;

  return { team1: t1, team2: t2 };
}


export function getPenaltiesResult(match: Match): { team1: number; team2: number } | null {
  if (!match.penalties) return null;

  let t1 = 0, t2 = 0;

  for (const pk of match.penalties) {
    if (!pk.scored) continue;
    if (pk.team === match.team1) t1++;
    else if (pk.team === match.team2) t2++;
  }

  if (t1 === 0 && t2 === 0) return null;

  return { team1: t1, team2: t2 };
}


// Obtener goles de un equipo en un partido
export function getTotalGoals(match: Match): number {
  return (match.goals?.length ?? 0);
}

export function areThereScorers(match: Match): boolean {
  return (match.goals ?? []).every(goal => !!goal.player);
}

export function getAllMatchesByTeam(team: string, matches: Match[]): Match[] {
  return matches.filter(match => match.team1 === team || match.team2 === team);
}