export const RARITIES = [
  'Ravaged', // -6
  'Doomed',    // -5
  'Cursed',    // -4
  'Broken',    // -3
  'Worn',      // -2
  'Mundane',   // -1
  'Common',    // 0
  'Uncommon',  // 1
  'Rare',      // 2
  'Ultra Rare',// 3
  'Epic',      // 4
  'Legendary', // 5
  'Ultimate'    // 6
] as const;

export const COMMON_INDEX = RARITIES.indexOf('Common');

export function rarityFromLevel(level: number): Rarity {
  const idx = Math.min(
    RARITIES.length - 1,
    Math.max(0, level + COMMON_INDEX)
  );
  return RARITIES[idx];
}

export function levelFromRarity(r: Rarity): number {
  return RARITIES.indexOf(r) - COMMON_INDEX;
}

export const CATEGORIES = [
  'Tournament',
  'Awards',
  'Streaks',
  'Rivalry',
  'Special',
  'Community',
  'Ranking'
] as const;
// minor : major
export const hierarchy: Record<string, string> = {
  // Tournament
  'host': '',
  'champion': 'double-champion',
  'double-champion': 'triple-champion',
  'triple-champion': '',
  'unbeaten-champion': 'perfect-champion',
  'perfect-champion': 'ultimate-champion',
  'ultimate-champion': '', 
  'prize-winner-1': 'prize-winner-2',
  'prize-winner-2': 'prize-winner-3', 
  'prize-winner-3': 'prize-winner-4', 
  'prize-winner-4': '', 
  // Streaks
  '3-win-streak': '5-win-streak', //
  '5-win-streak': '7-win-streak', //
  '7-win-streak': '10-win-streak', //
  '10-win-streak': 'longest-win-streak', //
  'longest-win-streak': '', //
  '3-unbeaten-streak': '5-unbeaten-streak', //
  '5-unbeaten-streak': '7-unbeaten-streak', //
  '7-unbeaten-streak': '10-unbeaten-streak', //
  '10-unbeaten-streak': 'longest-unbeaten-streak', //
  'longest-unbeaten-streak': '', //
  'no-win-7': 'no-win-10', //
  'no-win-10': 'no-win-15', //
  'no-win-15': 'no-win-20', //
  'no-win-20': 'longest-winless-streak', //
  'longest-winless-streak': '', //
  '3-loss-streak': '5-loss-streak', //
  '5-loss-streak': '7-loss-streak', //
  '7-loss-streak': '10-loss-streak', //
  '10-loss-streak': 'longest-loss-streak', //
  'longest-loss-streak': '', //
  '5-scoreless-streak': '10-scoreless-streak', //
  '10-scoreless-streak': '15-scoreless-streak', //
  '15-scoreless-streak': '20-scoreless-streak', //
  '20-scoreless-streak': 'longest-scoreless-streak', //
  'longest-scoreless-streak': '', //
  '10-goals': '20-goals', //
  '20-goals': '30-goals', //
  '30-goals': '40-goals', //
  '40-goals': '50-goals', //
  '50-goals': '75-goals', //
  '75-goals': '100-goals', //, 
  'all-time-scorer': '', //
  'most-red-cards': '', //
  // Rivalry
  '3-matches': '5-matches', //rivalry
  '5-matches': '7-matches', //classic
  '7-matches': '10-matches', //
  '10-matches': '', //
  '3-wins': '5-wins', //dominator
  '5-wins': '7-wins', //nemesis
  '7-wins': '10-wins', //
  '10-wins': '', //
  '3-loses': '5-loses', //underdog
  '5-loses': '7-loses', //prey
  '7-loses': '10-loses', //
  '10-loses': '', //
  '3-goal-difference': '5-goal-difference', //goal-difference
  '5-goal-difference': '6-goal-difference', //
  '6-goal-difference': '7-goal-difference', //
  '7-goal-difference': '8-goal-difference', //
  '8-goal-difference': '9-goal-difference', //
  '9-goal-difference': '10-goal-difference', //
  '10-goal-difference': '', //
  'biggest-win': '', //biggest-win
  'biggest-loss': '', //biggest-loss
  '3-eliminations': '5-eliminations', //
  '5-eliminations': '7-eliminations', //
  '7-eliminations': '10-eliminations', //
  '10-eliminations': '', //
};

export type Category = typeof CATEGORIES[number];

export type Rarity = typeof RARITIES[number];