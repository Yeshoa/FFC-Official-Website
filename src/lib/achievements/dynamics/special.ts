import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import { getMemberByName } from 'src/utils/memberUtils';
import { getGoalsByTeam, getMatchWinner, getMatchWinnerIncludingPenalties } from 'src/utils/matchUtils';
import type { Category } from '../utils';
import { ALIGNMENTS, type Subcategory } from '../utils';

const thisCategory = 'Special';

export const specialAchievements: AchievementDefinition[] = [
  {
    id: 'goal-famine',
    rarity: -4,
    name: 'Dry Spell',
    icon: Trophy,
    description: 'Never scored a single goal in Forest Cup history.',
    category: thisCategory as Category,
    subcategory: "Goals" as Subcategory,
    alignment: ALIGNMENTS[1],
    visible: true,
    unique: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { matches, member } = context;
      const played = matches.filter(m =>
        [m.data.team1, m.data.team2].includes(member.data.name)
      );

      const goals = played.reduce((acc, m) => {
        return acc + (m.data.goals?.filter(g => g.team === member.data.name).length ?? 0);
      }, 0);

      if (!played.length || goals !== 0) return null;

      return achieved(this, {
        description: `Never scored a single goal in Forest Cup history.`,
      })
    }
  },
  {
    id: 'enemy',
    rarity: -1,
    name: 'Enemy',
    icon: Trophy,
    description: 'Eliminated 2+ times by the same rival.',
    category: thisCategory as Category,
    subcategory: "Head-to-Head Eliminations" as Subcategory,
    alignment: ALIGNMENTS[1],
    visible: false,
    unique: false,
    enabled: false,
    stars: 1,
    evaluate: function (context) {
      const { matches, member } = context;
      const eliminations: Record<string, number> = {};

      for (const m of matches) {
        if (m.data.stage !== 'knockout') continue;
        if (m.data.status !== 'played') continue;

        let winner = getMatchWinnerIncludingPenalties(m.data);
        const loser = winner === m.data.team1 ? m.data.team2 : m.data.team1;

        if (loser === member.data.name) {
          eliminations[winner] = (eliminations[winner] ?? 0) + 1;
        }
      }

      const rivals = Object.entries(eliminations).filter(([, count]) => count >= 2);
      if (!rivals.length) return null;

      return achieved(this, {
        description: `Eliminated 2+ times by: ${rivals.map(([r]) => r).join(', ')}.`,
        current: rivals.length,
        target: 1,
        progress: 100,
      })
    }
  }
];

/** Marca un resultado como logrado, preservando la visibilidad de la definición. */
function achieved(def: AchievementDefinition, overrides: Partial<AchievementResult>): AchievementResult {
  return {
    id: def.id,
    achieved: true,
    visible: def.visible,
    ...overrides,
  };
}
