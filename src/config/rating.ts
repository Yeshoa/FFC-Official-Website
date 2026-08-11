import type { SkillId } from '@data/players/index';

const SKILL_ORDER: SkillId[] = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
];

// Ponderación por grupo de habilidades según la posición principal.
const WEIGHT: Record<string, { field: SkillId[]; gk: SkillId[] }> = {
  GK: { field: [], gk: ['reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch'] },
  DEF: {
    field: ['tackling', 'sliding', 'clearing', 'heading', 'power', 'agility', 'pace'],
    gk: [],
  },
  MID: {
    field: ['shortRange', 'mediumRange', 'longRange', 'vision', 'ballControl', 'dribbling', 'positioning', 'stability', 'pace'],
    gk: [],
  },
  FWD: {
    field: ['shortRange', 'mediumRange', 'longRange', 'dribbling', 'fakes', 'pace', 'agility', 'vision', 'heading', 'stability'],
    gk: [],
  },
};

// Peso neutral por defecto si la posición no está reconocida.
const DEFAULT_WEIGHT: SkillId[] = SKILL_ORDER.filter((s) => !s.startsWith('gk'));

function detectRole(position: string): keyof typeof WEIGHT {
  const p = (position || '').toUpperCase();
  if (p === 'GK') return 'GK';
  if (p.includes('B') || p.includes('D') || p.includes('W')) return 'DEF';
  if (p.includes('M') || p.includes('F')) return 'MID';
  return 'FWD';
}

// skills vacías → rating 0; con skills → media ponderada por posición (escala 0-100).
export function computePlayerRating(
  skills: Partial<Record<SkillId, number>>,
  position: string
): number {
  const role = detectRole(position);
  const ids = [...WEIGHT[role].field, ...WEIGHT[role].gk];
  const used = ids.length > 0 ? ids : DEFAULT_WEIGHT;
  const values = used
    .map((id) => skills[id])
    .filter((v): v is number => typeof v === 'number' && v > 0);

  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

export interface StarsThreshold {
  min: number;
  stars: number;
}

// Tabla ajustable: rating 0-100 → estrellitas (0.5-6, pasos de 0.5).
export const RATING_TO_STARS: StarsThreshold[] = [
  { min: 0, stars: 0.5 },
  { min: 21, stars: 1 },
  { min: 36, stars: 1.5 },
  { min: 51, stars: 2 },
  { min: 61, stars: 2.5 },
  { min: 71, stars: 3 },
  { min: 79, stars: 3.5 },
  { min: 86, stars: 4 },
  { min: 92, stars: 4.5 },
  { min: 96, stars: 5 },
  { min: 100, stars: 5.5 },
];

export function ratingToStars(rating: number): number {
  let result = 0.5;
  for (const t of RATING_TO_STARS) {
    if (rating >= t.min) result = t.stars;
  }
  return result;
}
