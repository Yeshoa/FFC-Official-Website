import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { getAllGoals, getAllMatchesByTeam, getAllRedCards, getLossStreak, getMatchWinner, getNoGoalStreak, getNoWinStreak, getUnbeatenStreak, getWinStreak } from '@lib/matchUtils';
import { type Category, CATEGORIES } from '../utils';

const thisCategory = CATEGORIES[2];

const maxStreakAchievements: {
  id: string;
  name: string;
  icon: ImageMetadata;
  description: string;
  rarity: number;
  category: Category;
  stars?: number;
  skulls?: number;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'longest-win-streak',
    rarity: 4,
    name: 'Unstoppable',
    icon: Trophy,
    description: 'Awarded for achieving the longest win streak among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getWinStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getWinStreak(member.data.name, matches);

      // Same for everyone
      if (current !== max) return null;
      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Longest win streak of ${max} matches.`,
      };
    }
  },
  {
    id: 'longest-unbeaten-streak',
    rarity: 3,
    name: 'Invincible',
    icon: Trophy,
    description: 'Awarded for achieving the longest unbeaten streak among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getUnbeatenStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getUnbeatenStreak(member.data.name, matches);

      if (current !== max) return null;
      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Longest unbeaten streak for ${max} matches in a row.`,
      };
    }
  },
  {
    id: 'longest-loss-streak',
    rarity: -6,
    name: 'Hopeless',
    icon: Trophy,
    description: 'Awarded for suffering the longest losing streak among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getLossStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getLossStreak(member.data.name, matches);

      if (current !== max) return null;

      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Longest losing streak of ${max} matches in a row.`,
      };
    }
  },
  {
    id: 'longest-scoreless-streak',
    rarity: -6,
    name: 'Scoreless',
    icon: Trophy,
    description: 'Awarded for achieving the longest scoreless streak among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getNoGoalStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getNoGoalStreak(member.data.name, matches);

      if (current !== max) return null;
      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Longest scoreless streak of ${max} matches in a row.`,
      };
    }
  },
  {
    id: 'longest-winless-streak',
    rarity: -6,
    name: 'Winless',
    icon: Trophy,
    description: 'Awarded for achieving the longest winless streak among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getNoWinStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getNoWinStreak(member.data.name, matches);

      if (current !== max) return null;
      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Longest winless streak of ${max} matches in a row.`,
      };
    }
  },
  {
    id: 'most-red-cards',
    rarity: -6,
    name: 'Red Cards',
    icon: Trophy,
    description: 'Awarded for achieving the most red cards among all members.',
    category: thisCategory,
    visible: false,
    unique: true,
    enabled: true,
    evaluate: function (matches, _, member, members) {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getAllRedCards(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getAllRedCards(member.data.name, matches);

      if (current !== max) return null;
      const { evaluate, ...base } = this;

      return {
        ...base,
        description: `Most red cards: ${max}.`,
      };
    }
  },
  {
    id: 'all-time-scorer',
    rarity: 3,
    name: 'All‑Time Scorer',
    icon: Trophy,
    description: 'Awarded for being the top all-time scorer.',
    category: thisCategory,
    visible: true,
    unique: true,
    enabled: true,
    evaluate: function (matches, tournaments, member) {
      // Sum goals per team
      const teamGoals = new Map<string, number>();
      for (const m of matches) {
        for (const g of m.data.goals ?? []) {
          teamGoals.set(g.team, (teamGoals.get(g.team) ?? 0) + 1);
        }
      }
      // Find max
      const top = [...teamGoals.entries()].sort((a,b) => b[1]-a[1])[0];

      if (!top || top[0] !== member.data.name ) return null;

      const { evaluate, ...base } = this;
      return {
        ...base,
        description: `Has scored the most goals ever: ${top[1]} goals.`,
      };
    }
  },
];

/* STREAKS */
const makeWinStreakAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minWins: number,
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const maxWinstreak = getWinStreak(member.data.name, matches);
    if (maxWinstreak < minWins) return null;
    
    return {
      ...base,
      description: `Won ${minWins}+ matches in a row.`
    };
  }
});
const makeNoWinStreakAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minMatches: number
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const played = getAllMatchesByTeam(member.data.name, matches);
    const wins = played.filter(m => getMatchWinner(m.data) === member.data.name);
    if (wins.length > 0 || played.length < minMatches) return null;
    
    return {
      ...base,
      description: `Never won in ${minMatches}+ matches.`
    };
  }
});

const makeUnbeatenStreakAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minMatches: number
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const unbeaten = getUnbeatenStreak(member.data.name, matches);
    if (unbeaten < minMatches) return null;
    
    return {
      ...base,
      description: `Stayed unbeaten for ${minMatches}+ matches in a row.`
    };
  }
});

const makeLossStreakAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minLosses: number
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const losses = getLossStreak(member.data.name, matches);
    if (losses <= minLosses) return null;
    
    return {
      ...base,
      description: `Lost ${minLosses}+ matches in a row.`
    };
  }
});

const makeScorelessStreakAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minMatches: number
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const scoreless = getNoGoalStreak(member.data.name, matches);
    if (scoreless < minMatches) return null;
    
    return {
      ...base,
      description: `Scoreless in ${minMatches}+ matches.`
    };
  }
});

const makeGoalsAchievement = (
  id: string,
  name: string,
  icon: ImageMetadata,
  description: string,
  rarity: number,
  minGoals: number
) => ({
  id,
  name,
  icon,
  description,
  category: thisCategory,
  rarity: rarity,
  unique: false,
  visible: true,
  enabled: true,
  evaluate: function (matches, _, member) {
    const { evaluate, ...base } = this;
    const goals = getAllGoals(member.data.name, matches);
    if (goals < minGoals) return null;
    
    return {
      ...base,
      description: `Scored ${minGoals}+ goals.`
    };
  }
});
const goalsAchievements: Achievement[] = [
  makeGoalsAchievement('10-goals', 'Striker', Trophy, 'Scored 10+ goals.', 0, 10),
  makeGoalsAchievement('20-goals', 'Finisher', Trophy, 'Scored 20+ goals.', 1, 20),
  makeGoalsAchievement('30-goals', 'Sharpshooter', Trophy, 'Scored 30+ goals.', 2, 30),
  makeGoalsAchievement('40-goals', '40 Goals', Trophy, 'Scored 40+ goals.', 3, 40),
  makeGoalsAchievement('50-goals', 'Android', Trophy, 'Scored 50+ goals.', 4, 50),
  makeGoalsAchievement('75-goals', 'Juggernaut', Trophy, 'Scored 75+ goals.', 5, 75),
  makeGoalsAchievement('100-goals', 'All Star', Trophy, 'Scored 100+ goals.', 6, 100),
];

const winStreakAchievements: Achievement[] = [
  makeWinStreakAchievement('3-win-streak', 'Heated', Trophy, 'Won 3 matches in a row.', 1, 3),
  makeWinStreakAchievement('5-win-streak', '5-Win Streak', Trophy, 'Won 5 matches in a row.', 2, 5),
  makeWinStreakAchievement('7-win-streak', '7-Win Streak', Trophy, 'Won 7 matches in a row.', 3, 7),
  makeWinStreakAchievement('10-win-streak', 'Rampant', Trophy, 'Won 10 matches in a row.', 4, 10),
];

const unbeatenStreakAchievements: Achievement[] = [
  makeUnbeatenStreakAchievement('7-unbeaten-streak', '7-Unbeaten Streak', Trophy, 'Stayed unbeaten for 7+ matches in a row.', 1, 7),
  makeUnbeatenStreakAchievement('10-unbeaten-streak', '10-Unbeaten Streak', Trophy, 'Stayed unbeaten for 10+ matches in a row.', 2, 10),
  makeUnbeatenStreakAchievement('15-unbeaten-streak', '15-Unbeaten Streak', Trophy, 'Stayed unbeaten for 15+ matches in a row.', 3, 15),
  makeUnbeatenStreakAchievement('20-unbeaten-streak', 'Machine', Trophy, 'Stayed unbeaten for 20+ matches in a row.', 4, 20),
];

const noWinStreakAchievements: Achievement[] = [
  makeNoWinStreakAchievement('no-win-20', '20-Winless', Trophy, 'Played +20 matches but never won.', -5, 20),
  makeNoWinStreakAchievement('no-win-15', '15-Winless', Trophy, 'Played +15 matches but never won.', -4, 15),
  makeNoWinStreakAchievement('no-win-10', 'Jinxed', Trophy, 'Played +10 matches but never won.', -3, 10),
  makeNoWinStreakAchievement('no-win-7', 'Winless', Trophy, 'Played +7 matches but never won.', -2, 7),
];

const lossStreakAchievements: Achievement[] = [
  makeLossStreakAchievement('3-loss-streak', '3-Loss Streak', Trophy, 'Lost 3+ matches in a row.', -1, 3),
  makeLossStreakAchievement('5-loss-streak', '5-Loss Streak', Trophy, 'Lost 5+ matches in a row.', -2, 5),
  makeLossStreakAchievement('7-loss-streak', '7-Loss Streak', Trophy, 'Lost 7+ matches in a row.', -3, 7),
  makeLossStreakAchievement('10-loss-streak', '10-Loss Streak', Trophy, 'Lost 10+ matches in a row.', -4, 10),
  makeLossStreakAchievement('15-loss-streak', '15-Loss Streak', Trophy, 'Lost 15+ matches in a row.', -5, 15),
]

const scorelessStreakAchievements: Achievement[] = [
  makeScorelessStreakAchievement('5-scoreless-streak', '5-Scoreless Streak', Trophy, 'Scoreless in 5+ matches.', -1, 5),
  makeScorelessStreakAchievement('10-scoreless-streak', '10-Scoreless Streak', Trophy, 'Scoreless in 10+ matches.', -2, 10),
  makeScorelessStreakAchievement('15-scoreless-streak', '15-Scoreless Streak', Trophy, 'Scoreless in 15+ matches.', -3, 15),
  makeScorelessStreakAchievement('20-scoreless-streak', '20-Scoreless Streak', Trophy, 'Scoreless in 20+ matches.', -4, 20),
]

export const streakAchievements = [
  ...maxStreakAchievements, 
  ...winStreakAchievements, 
  ...noWinStreakAchievements,
  ...unbeatenStreakAchievements,
  ...lossStreakAchievements,
  ...scorelessStreakAchievements,
  ...goalsAchievements
];