/**
 * Player Utilities
 * 
 * Helper functions for working with player data in components and pages.
 * Supports both current squad lookups and historical tournament data.
 */

import type { CollectionEntry } from 'astro:content';
import { getPlayerById, getPlayerName } from '@data/players/index';

export type Match = CollectionEntry<'matches'>['data'];

/**
 * Get player name from a goal entry
 * Prefiere el perfil (playerId → firstName/lastName); cae al nombre guardado solo si no hay id.
 * @param goal Goal object from match data
 * @returns Player name or empty string
 */
export function getGoalPlayerName(goal: Match['goals'][0]): string {
  if (goal.playerId) {
    const player = getPlayerById(goal.playerId);
    if (player) return getPlayerName(player);
  }

  return goal.player ?? '';
}

// Nombre de un ganador de premio (prizes de torneo): perfil si hay playerId, si no el guardado.
export function getPrizePlayerName(prize: { player?: string; playerId?: number }): string {
  if (prize.playerId != null) {
    const player = getPlayerById(prize.playerId);
    if (player) return getPlayerName(player);
  }
  return prize.player ?? '';
}

/**
 * Get player stats for a specific player across all matches
 * @param playerId Player ID
 * @param teamCode Team code
 * @param matches All matches to search
 * @returns Player statistics
 */
export function getPlayerStats(playerId: string, teamCode: string, matches: Match[]): {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  starterAppearances: number;
  benchAppearances: number;
} {
  const stats = {
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    starterAppearances: 0,
    benchAppearances: 0
  };
  
  for (const match of matches) {
    // Skip if match hasn't been played
    if (match.status !== 'played') continue;
    
    // Count goals
    if (match.goals) {
      stats.goals += match.goals.filter(g => 
        g.playerId === playerId || (g.player && g.player.includes(playerId))
      ).length;
      
      stats.assists += match.goals.filter(g =>
        (g.assistId === playerId || g.assist?.includes(playerId)) && g.assist
      ).length;
    }
    
    // Count cards
    if (match.cards) {
      const playerCards = match.cards.filter(c =>
        c.playerId === playerId || (c.player && c.player.includes(playerId))
      );
      
      stats.yellowCards += playerCards.filter(c => c.type === 'yellow').length;
      stats.redCards += playerCards.filter(c => c.type === 'red').length;
    }
    
    // Count appearances from lineup
    if (match.lineup) {
      const allPlayers = [
        ...(match.lineup.team1?.players || []),
        ...(match.lineup.team2?.players || [])
      ];
      
      const playerInLineup = allPlayers.find(p =>
        p.playerId === playerId || (p.name && p.name.includes(playerId))
      );
      
      if (playerInLineup) {
        stats.appearances++;
        if (playerInLineup.starter !== false) {
          stats.starterAppearances++;
        } else {
          stats.benchAppearances++;
        }
      }
    }
    
    // Count appearances from activity (fallback if no lineup data)
    if (!match.lineup || (match.lineup.team1?.players?.length || 0) === 0) {
      const playedInMatch = 
        (match.goals?.some(g => g.playerId === playerId)) ||
        (match.cards?.some(c => c.playerId === playerId)) ||
        (match.substitutions?.some(s => s.playerOutId === playerId || s.playerInId === playerId));
      
      if (playedInMatch) {
        stats.appearances++;
      }
    }
  }
  
  return stats;
}

/**
 * Get all goals by a specific player
 * @param playerId Player ID
 * @param matches Matches to search
 * @returns Array of goal objects
 */
export function getPlayerGoals(playerId: string, matches: Match[]): Array<{
  match: Match;
  goal: Match['goals'][0];
  minute: number;
  penalty: boolean;
}> {
  const goals: Array<{
    match: Match;
    goal: Match['goals'][0];
    minute: number;
    penalty: boolean;
  }> = [];
  
  for (const match of matches) {
    if (!match.goals || match.status !== 'played') continue;
    
    for (const goal of match.goals) {
      if (goal.playerId === playerId) {
        goals.push({
          match,
          goal,
          minute: goal.minute || 0,
          penalty: goal.penalty || false
        });
      }
    }
  }
  
  return goals.sort((a, b) => a.minute - b.minute);
}

/**
 * Get top scorers from a list of matches
 * @param matches Matches to analyze
 * @param limit Number of top scorers to return
 * @returns Array of top scorers
 */
export function getTopScorers(matches: Match[], limit: number = 10): Array<{
  playerId?: string;
  playerName: string;
  goals: number;
}> {
  const scorers = new Map<string, { playerId?: string; playerName: string; goals: number }>();
  
  for (const match of matches) {
    if (!match.goals || match.status !== 'played') continue;
    
    for (const goal of match.goals) {
      if (!goal.player && !goal.playerId) continue;
      
      const key = goal.playerId || goal.player;
      
      if (scorers.has(key)) {
        const existing = scorers.get(key)!;
        existing.goals++;
      } else {
        scorers.set(key, {
          playerId: goal.playerId,
          playerName: getGoalPlayerName(goal),
          goals: 1
        });
      }
    }
  }
  
  return Array.from(scorers.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
}

/**
 * Verify if all players in a match have IDs assigned
 * Useful for validation and migration tracking
 * @param match Match to check
 * @returns { isComplete: boolean; missing: string[] }
 */
export function verifyPlayerIds(match: Match): { isComplete: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Check goals
  if (match.goals) {
    for (const goal of match.goals) {
      if (goal.player && !goal.playerId) {
        missing.push(`Goal: ${goal.player}`);
      }
    }
  }
  
  // Check cards
  if (match.cards) {
    for (const card of match.cards) {
      if (card.player && !card.playerId) {
        missing.push(`Card: ${card.player}`);
      }
    }
  }
  
  // Check substitutions
  if (match.substitutions) {
    for (const sub of match.substitutions) {
      if (sub.playerOut && !sub.playerOutId) {
        missing.push(`Substitution out: ${sub.playerOut}`);
      }
      if (sub.playerIn && !sub.playerInId) {
        missing.push(`Substitution in: ${sub.playerIn}`);
      }
    }
  }
  
  // Check lineups
  if (match.lineup) {
    if (match.lineup.team1?.players) {
      for (const player of match.lineup.team1.players) {
        if (player.name && !player.playerId) {
          missing.push(`Lineup: ${player.name}`);
        }
      }
    }
    if (match.lineup.team2?.players) {
      for (const player of match.lineup.team2.players) {
        if (player.name && !player.playerId) {
          missing.push(`Lineup: ${player.name}`);
        }
      }
    }
  }
  
  return {
    isComplete: missing.length === 0,
    missing
  };
}
