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
  return matches.filter(match => match.data.team1 === team || match.data.team2 === team)
  .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());
}

export function getMatchRedCards(match: Match): { team1: { player: string; minute: number }[]; team2: { player: string; minute: number }[] } {
  const team1: { player: string; minute: number }[] = [];
  const team2: { player: string; minute: number }[] = [];
  for (const card of match.cards || []) {
    if (card.type === 'red' && card.player) {
      if (card.team === match.team1) team1.push({ player: card.player, minute: card.minute });
      else if (card.team === match.team2) team2.push({ player: card.player, minute: card.minute });
    }
  }
  return { team1, team2 };
}

export function getAllRedCards(memberName: string, matches: Match[]) {
  let total = 0;
  for (const match of matches) {
    if (match.data.team1 === memberName) {
      total += getMatchRedCards(match.data).team1.length;
    }
    if (match.data.team2 === memberName) {
      total += getMatchRedCards(match.data).team2.length;
    }
  }
  return total;
}

export function getMatchGoals(match: Match, team: string): { gf: number, ga: number } {
  const goals = match.data.goals ?? [];
  const gf = goals.filter(g => g.team === team).length;
  const ga = goals.length - gf; // Total de goles menos los goles a favor
  return { gf, ga };
}

function getStreak(
  memberName: string,
  allMatches: Match[],
  condition: (gf: number, ga: number) => boolean
): number {
  let streak = 0;
  let maxStreak = 0;
  const playedMatches = allMatches
    .filter(m => [m.data.team1, m.data.team2].includes(memberName) && m.data.status === 'played')
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());
  for (const match of playedMatches) {
    const { gf, ga } = getMatchGoals(match, memberName);
    if (condition(gf, ga)) {
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 0;
    }
  }
  return maxStreak;
}

export function getLossStreak(memberName: string, allMatches: Match[]) {
  return getStreak(memberName, allMatches, (gf, ga) => gf < ga);
}

export function getUnbeatenStreak(memberName: string, allMatches: Match[]) {
  return getStreak(memberName, allMatches, (gf, ga) => gf >= ga);
}

export function getWinStreak(memberName: string, allMatches: Match[]) {
  return getStreak(memberName, allMatches, (gf, ga) => gf > ga);
}

export function getNoWinStreak(memberName: string, allMatches: Match[]) {
  return getStreak(memberName, allMatches, (gf, ga) => gf <= ga);
}

export function getNoGoalStreak(memberName: string, allMatches: Match[]): number {
  return getStreak(memberName, allMatches, (gf, ga) => gf === 0);
}

export function getWins(memberName: string) {
  let wins = 0;
  for (const match of allMatches) {
    const { gf, ga } = getMatchGoals(match, memberName);
    if (gf > ga) wins++;
  }
  return wins;
}

export function getAllGoals(memberName: string, allMatches: Match[]) {
  let goals = 0;
  for (const match of allMatches) {
    const { gf, ga } = getMatchGoals(match, memberName);
    goals += gf;
  }
  return goals;
}

// Encuentra el partido con más goles totales
export function getHighestScoringMatch(matches: Match[]): Match | null {
  if (matches.length === 0) return null;
  
  return matches.reduce((highest, current) => {
    const currentGoals = getTotalGoals(current);
    const highestGoals = getTotalGoals(highest);
    return currentGoals > highestGoals ? current : highest;
  });
}

// Encuentra la mayor goleada (diferencia de goles)
export function getBiggestBlowout(matches: Match[]): { match: Match; goalDifference: number } | null {
  if (matches.length === 0) return null;
  
  let biggestBlowout = { match: matches[0], goalDifference: 0 };
  
  matches.forEach(match => {
    const result = getMatchResult(match);
    const difference = Math.abs(result.team1 - result.team2);
    
    if (difference > biggestBlowout.goalDifference) {
      biggestBlowout = { match, goalDifference: difference };
    }
  });
  
  return biggestBlowout.goalDifference > 0 ? biggestBlowout : null;
}

// Encuentra el partido con más penales ejecutados
export function getMatchWithMostPenalties(matches: Match[]): { match: Match; penaltyCount: number } | null {
  if (matches.length === 0) return null;
  
  let maxPenalties = { match: matches[0], penaltyCount: 0 };
  
  matches.forEach(match => {
    const penaltyCount = match.data.penalties?.length || 0;
    
    if (penaltyCount > maxPenalties.penaltyCount) {
      maxPenalties = { match, penaltyCount };
    }
  });
  
  return maxPenalties.penaltyCount > 0 ? maxPenalties : null;
}

// Encuentra la mayor remontada (equipo que iba perdiendo y terminó ganando)
export function getBiggestComeback(matches: Match[]): { match: Match; comebackSize: number } | null {
  if (matches.length === 0) return null;
  
  let biggestComeback = { match: matches[0], comebackSize: 0 };
  
  matches.forEach(match => {
    if (!match.data.goals || match.data.goals.length === 0) return;
    
    const finalResult = getMatchResult(match);
    const goals = [...match.data.goals].sort((a, b) => (a.minute || 0) - (b.minute || 0));
    
    let team1Score = 0;
    let team2Score = 0;
    let maxDeficit = 0;
    let comebackTeam = null;
    
    goals.forEach(goal => {
      if (goal.team === match.data.team1) {
        team1Score++;
      } else {
        team2Score++;
      }
      
      const currentDeficit = Math.abs(team1Score - team2Score);
      const leadingTeam = team1Score > team2Score ? match.data.team1 : match.data.team2;
      
      if (currentDeficit > maxDeficit) {
        maxDeficit = currentDeficit;
        comebackTeam = leadingTeam === match.data.team1 ? match.data.team2 : match.data.team1;
      }
    });
    
    // Verificar si hubo remontada
    const winner = finalResult.team1 > finalResult.team2 ? match.data.team1 : 
                   finalResult.team2 > finalResult.team1 ? match.data.team2 : null;
    
    if (winner === comebackTeam && maxDeficit > biggestComeback.comebackSize) {
      biggestComeback = { match, comebackSize: maxDeficit };
    }
  });
  
  return biggestComeback.comebackSize > 0 ? biggestComeback : null;
}

// Encuentra el jugador con más goles en un solo partido
export function getPlayerWithMostGoalsInMatch(matches: Match[]): { match: Match; player: string; goals: number } | null {
  if (matches.length === 0) return null;
  
  let maxGoalsInMatch = { match: matches[0], player: '', goals: 0 };
  
  matches.forEach(match => {
    const goalScorers = getGoalScorers(match);
    
    Object.entries(goalScorers).forEach(([player, goals]) => {
      if (goals > maxGoalsInMatch.goals) {
        maxGoalsInMatch = { match, player, goals };
      }
    });
  });
  
  return maxGoalsInMatch.goals > 0 ? maxGoalsInMatch : null;
}

// Encuentra partidos de final por tipo de torneo
export function getFinalMatches(matches: Match[]): Match[] {
  return matches.filter(match => {
    const matchFixture = match.data.fixture.toLowerCase();
    return matchFixture.includes('final') && !matchFixture.includes('semi') && !matchFixture.includes('quarter');
  });
}

// Encuentra el partido con más tarjetas
export function getMatchWithMostCards(matches: Match[]): { match: Match; cardCount: number } | null {
  if (matches.length === 0) return null;
  
  let maxCards = { match: matches[0], cardCount: 0 };
  
  matches.forEach(match => {
    const cardCount = match.data.cards?.length || 0;
    
    if (cardCount > maxCards.cardCount) {
      maxCards = { match, cardCount };
    }
  });
  
  return maxCards.cardCount > 0 ? maxCards : null;
}