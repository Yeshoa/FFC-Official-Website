import Trophy from '@images/achievements/king.webp';
import type { AchievementDefinition, AchievementResult } from '../types';
import { getMemberById } from 'src/utils/memberUtils';
import { getMatchGoals, getMatchWinnerIncludingPenaltiesId } from 'src/utils/matchUtils';
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
      const memberId = member.data.id;
      const played = matches.filter(m =>
        m.data.team1Id === memberId || m.data.team2Id === memberId
      );

      const goals = played.reduce((acc, m) => {
        return acc + getMatchGoals(m, memberId).gf;
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
      const memberId = member.data.id;
      const eliminations: Record<number, number> = {};

      for (const m of matches) {
        if (m.data.stage !== 'knockout') continue;
        if (m.data.status !== 'played') continue;

        const winnerId = getMatchWinnerIncludingPenaltiesId(m.data);
        if (winnerId === null) continue;
        const loserId = winnerId === m.data.team1Id ? m.data.team2Id : m.data.team1Id;

        if (loserId === memberId) {
          eliminations[winnerId] = (eliminations[winnerId] ?? 0) + 1;
        }
      }

      const rivals = Object.entries(eliminations).filter(([, count]) => count >= 2);
      if (!rivals.length) return null;

      const rivalNames = rivals.map(([id]) => {
        const rival = getMemberById(Number(id));
        return rival?.data.name ?? `#${id}`;
      });
      return achieved(this, {
        description: `Eliminated 2+ times by: ${rivalNames.join(', ')}.`,
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
