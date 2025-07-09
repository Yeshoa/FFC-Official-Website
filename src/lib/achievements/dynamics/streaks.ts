import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { getLossStreak, getUnbeatenStreak, getWinStreak } from '@lib/matchUtils';

export const streakAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'longest-win-streak',
    rarity: 'Epic',
    name: 'Unstoppable',
    icon: Trophy,
    description: 'Awarded for achieving the longest win streak among all members.',
    evaluate: (matches, _, member, members) => {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getWinStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getWinStreak(member.data.name, matches);

      if (current === max) {
        return {
            id: 'longest-win-streak',
            name: 'Unstoppable',
            icon: Trophy,
            rarity: 'Epic',
            description: `Achieved a win streak of ${max} matches.`
          };
      }
      return null;
    }
  },
  {
    id: 'longest-unbeaten-streak',
    rarity: 'Ultra Rare',
    name: 'Invincible',
    icon: Trophy,
    description: 'Awarded for achieving the longest unbeaten streak among all members.',
    evaluate: (matches, _, member, members) => {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getUnbeatenStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getUnbeatenStreak(member.data.name, matches);
      if (current === max) {
        return {
            id: 'longest-unbeaten-streak',
            name: 'Invincible',
            icon: Trophy,
            rarity: 'Ultra Rare',
            description: `Stayed unbeaten for ${max} matches in a row.`
          };
      }
      return null;
    }
  },
  {
    id: 'longest-loss-streak',
    rarity: 'Ravaged',
    name: 'Hopeless',
    icon: Trophy,
    description: 'Awarded for suffering the longest losing streak among all members.',
    evaluate: (matches, _, member, members) => {
      const streaks = members.map(m => ({
        name: m.data.name,
        value: getLossStreak(m.data.name, matches)
      }));

      const max = Math.max(...streaks.map(s => s.value));
      const tied = streaks.filter(s => s.value === max);
      const current = getLossStreak(member.data.name, matches);

      if (current === max)
        return {
          id: 'longest-loss-streak',
          name: 'Hopeless',
          icon: Trophy,
          rarity: 'Cursed',
          description: `Lost ${max} matches in a row.`
        } 
       return null;
    }
  },
];