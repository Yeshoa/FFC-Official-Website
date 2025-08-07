import type { AchievementFamily } from '../types';
import {
  getAllGoals,
  getWinStreak,
  getLossStreak,
  getUnbeatenStreak,
  getNoGoalStreak,
  getNoWinStreak,
  getAllRedCards,
} from '@lib/matchUtils';
import { CATEGORIES, SUBCATEGORIES, ALIGNMENTS } from '../utils';
import Trophy from '@images/achievements/king.webp';

const winStreakFamily: AchievementFamily = {
  id: 'win-streak',
  name: 'Win Streak',
  category: CATEGORIES[2], // Streaks
  subcategory: SUBCATEGORIES[4], // Win Streaks
  alignment: ALIGNMENTS[0], // Neutral
  getStat: getWinStreak,
  trackMaxHolder: true,
  tiers: [
    { threshold: 3, name: 'Heated', description: 'Won 3+ matches in a row.', rarity: 1, icon: Trophy },
    { threshold: 5, name: 'On Fire', description: 'Won 5+ matches in a row.', rarity: 2, icon: Trophy },
    { threshold: 7, name: 'Unstoppable', description: 'Won 7+ matches in a row.', rarity: 3, icon: Trophy },
    { threshold: 10, name: 'Rampant', description: 'Won 10+ matches in a row.', rarity: 4, icon: Trophy },
  ],
};

const unbeatenStreakFamily: AchievementFamily = {
  id: 'unbeaten-streak',
  name: 'Unbeaten Streak',
  category: CATEGORIES[2],
  subcategory: SUBCATEGORIES[5], // Unbeaten Streaks
  alignment: ALIGNMENTS[0],
  getStat: getUnbeatenStreak,
  trackMaxHolder: true,
  tiers: [
    { threshold: 7, name: 'Solid', description: '7+ matches unbeaten.', rarity: 1, icon: Trophy },
    { threshold: 10, name: 'Resilient', description: '10+ matches unbeaten.', rarity: 2, icon: Trophy },
    { threshold: 15, name: 'Fortress', description: '15+ matches unbeaten.', rarity: 3, icon: Trophy },
    { threshold: 20, name: 'Machine', description: '20+ matches unbeaten.', rarity: 4, icon: Trophy },
  ],
};

const noWinStreakFamily: AchievementFamily = {
  id: 'no-win-streak',
  name: 'Winless Streak',
  category: CATEGORIES[2],
  subcategory: SUBCATEGORIES[6], // Winless Streaks
  alignment: ALIGNMENTS[1], // Evil
  getStat: getNoWinStreak,
  trackMaxHolder: true,
  tiers: [
    { threshold: 7, name: 'Winless', description: '7+ matches without a win.', rarity: 2, icon: Trophy },
    { threshold: 10, name: 'Jinxed', description: '10+ matches without a win.', rarity: 3, icon: Trophy },
    { threshold: 15, name: 'Cursed', description: '15+ matches without a win.', rarity: 4, icon: Trophy },
    { threshold: 20, name: 'Hopeless', description: '20+ matches without a win.', rarity: 5, icon: Trophy },
  ],
};

const lossStreakFamily: AchievementFamily = {
  id: 'loss-streak',
  name: 'Losing Streak',
  category: CATEGORIES[2],
  subcategory: SUBCATEGORIES[7], // Loss Streaks
  alignment: ALIGNMENTS[1],
  getStat: getLossStreak,
  trackMaxHolder: true,
  tiers: [
    { threshold: 3, name: 'Bad Run', description: 'Lost 3+ matches in a row.', rarity: 1, icon: Trophy },
    { threshold: 5, name: 'Slump', description: 'Lost 5+ matches in a row.', rarity: 2, icon: Trophy },
    { threshold: 7, name: 'In a Rut', description: 'Lost 7+ matches in a row.', rarity: 3, icon: Trophy },
    { threshold: 10, name: 'Crisis', description: 'Lost 10+ matches in a row.', rarity: 4, icon: Trophy },
    { threshold: 15, name: 'Free Fall', description: 'Lost 15+ matches in a row.', rarity: 5, icon: Trophy },
  ],
};

const scorelessStreakFamily: AchievementFamily = {
  id: 'scoreless-streak',
  name: 'Scoreless Streak',
  category: CATEGORIES[2],
  subcategory: SUBCATEGORIES[8], // Scoreless Streaks
  alignment: ALIGNMENTS[1],
  getStat: getNoGoalStreak,
  trackMaxHolder: true,
  tiers: [
    { threshold: 5, name: 'Dry Spell', description: '5+ matches without scoring.', rarity: 1, icon: Trophy },
    { threshold: 7, name: 'Goal Shy', description: '7+ matches without scoring.', rarity: 2, icon: Trophy },
    { threshold: 10, name: 'Blunted Attack', description: '10+ matches without scoring.', rarity: 3, icon: Trophy },
    { threshold: 15, name: 'Goal Drought', description: '15+ matches without scoring.', rarity: 4, icon: Trophy },
    { threshold: 20, name: 'The Void', description: '20+ matches without scoring.', rarity: 5, icon: Trophy },
  ],
};

const goalsScoredFamily: AchievementFamily = {
    id: 'goals-scored',
    name: 'Goals Scored',
    category: CATEGORIES[2],
    subcategory: SUBCATEGORIES[9], // Goals
    alignment: ALIGNMENTS[0],
    getStat: getAllGoals,
    trackMaxHolder: true,
    tiers: [
        { threshold: 10, name: 'Striker', description: 'Scored 10+ goals in total.', rarity: 0, icon: Trophy, stars: 1 },
        { threshold: 20, name: 'Finisher', description: 'Scored 20+ goals in total.', rarity: 1, icon: Trophy, stars: 2 },
        { threshold: 30, name: 'Sharpshooter', description: 'Scored 30+ goals in total.', rarity: 2, icon: Trophy, stars: 3 },
        { threshold: 40, name: 'Goal Machine', description: 'Scored 40+ goals in total.', rarity: 3, icon: Trophy, stars: 4 },
        { threshold: 50, name: 'Android', description: 'Scored 50+ goals in total.', rarity: 4, icon: Trophy, stars: 5 },
        { threshold: 75, name: 'Juggernaut', description: 'Scored 75+ goals in total.', rarity: 5, icon: Trophy, stars: 7 },
        { threshold: 100, name: 'All Star', description: 'Scored 100+ goals in total.', rarity: 6, icon: Trophy, stars: 10 },
    ],
};

const redCardsFamily: AchievementFamily = {
    id: 'red-cards',
    name: 'Red Cards',
    category: CATEGORIES[2],
    subcategory: SUBCATEGORIES[10], // Cards
    alignment: ALIGNMENTS[1],
    getStat: getAllRedCards,
    trackMaxHolder: true,
    tiers: [
        { threshold: 1, name: 'Hothead', description: 'Received 1+ red cards.', rarity: 1, icon: Trophy },
        { threshold: 3, name: 'Aggressive', description: 'Received 3+ red cards.', rarity: 2, icon: Trophy },
        { threshold: 5, name: 'Enforcer', description: 'Received 5+ red cards.', rarity: 3, icon: Trophy },
        { threshold: 10, name: 'Red Imp', description: 'Received 10+ red cards.', rarity: 4, icon: Trophy },
    ],
};


export const streakAchievementFamilies: AchievementFamily[] = [
  winStreakFamily,
  unbeatenStreakFamily,
  noWinStreakFamily,
  lossStreakFamily,
  scorelessStreakFamily,
  goalsScoredFamily,
  redCardsFamily,
];
