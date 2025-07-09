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
  'Ultra'    // Ultra
] as const;

export const CATEGORIES = [
  'Tournament',
  'Awards',
  'Streaks',
  'Rivalry',
  'Special'
] as const;

export type Category = typeof CATEGORIES[number];

export type Rarity = typeof RARITIES[number];