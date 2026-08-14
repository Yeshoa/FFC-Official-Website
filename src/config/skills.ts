// Categorías de skill para las cartas de jugador (3 categorías).
// `skills` se usan siempre; `gkSkills` SOLO se suman cuando la carta es de un arquero,
// para no inflar a los jugadores de campo con habilidades de arquero.
import type { SkillId } from '@data/players/index';

export interface SkillCategory {
  id: 'PHY' | 'TEC' | 'TAC';
  label: string;
  skills: SkillId[];
  gkSkills?: SkillId[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'PHY',
    label: 'Physical',
    skills: ['pace', 'agility', 'stamina', 'jumping', 'power'],
    gkSkills: ['stretch'],
  },
  {
    id: 'TEC',
    label: 'Technical',
    skills: ['shortRange', 'mediumRange', 'longRange', 'heading', 'dribbling', 'fakes', 'ballControl'],
    gkSkills: ['catch', 'saveClose'],
  },
  {
    id: 'TAC',
    label: 'Tactical',
    skills: ['stability', 'positioning', 'vision', 'tackling', 'sliding', 'clearing'],
    gkSkills: ['gkPositioning', 'reflexes'],
  },
];

// Promedio 0-100 de una categoría (incluye gkSkills solo si el jugador es arquero).
export function skillCategoryValue(
  skills: Partial<Record<SkillId, number>>,
  category: SkillCategory,
  isGK: boolean,
): number {
  const ids = isGK ? [...category.skills, ...(category.gkSkills ?? [])] : category.skills;
  const values = ids
    .map((id) => skills[id])
    .filter((v): v is number => typeof v === 'number' && v > 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
