import type { Player, SkillId } from '@data/players/index';
import { positionToRole } from '@config/positions';

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

// skills vacías → rating 0; con skills → media ponderada por posición (escala 0-100).
export function computePlayerRating(
  skills: Partial<Record<SkillId, number>>,
  position: string
): number {
  const role = positionToRole(position);
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

// Poderío de equipo = agregación del plantel activo (media de ratings de jugadores, 0-100).
// Jugadores sin skills no arrastran la media; sin datos → 0.
export function computeTeamRating(players: Player[]): number {
  const ratings = players
    .map((p) => computePlayerRating(p.skills, p.position))
    .filter((r) => r > 0);

  if (ratings.length === 0) return 0;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(avg);
}

// Tabla de poderío del EQUIPO (tabla del dueño, columna "Rating 2", escalada a 0-100 /1.6).
// Ajustable a mano: cambiar `min`/`stars` aquí alcanza.
export const TEAM_RATING_TO_STARS: StarsThreshold[] = [
  { min: 0, stars: 0.5 },
  { min: 4, stars: 1 },
  { min: 8, stars: 1.5 },
  { min: 12, stars: 2 },
  { min: 17, stars: 2.5 },
  { min: 25, stars: 3 },
  { min: 35, stars: 3.5 },
  { min: 46, stars: 4 },
  { min: 57, stars: 4.5 },
  { min: 68, stars: 5 },
  { min: 80, stars: 5.5 },
  { min: 100, stars: 6 },
];

export function teamRatingToStars(teamRating: number): number {
  let result = 0.5;
  for (const t of TEAM_RATING_TO_STARS) {
    if (teamRating >= t.min) result = t.stars;
  }
  return result;
}

export interface OvrColorThreshold {
  min: number;
  bg: string; // color de fondo del badge OVR (a mayor rating, más llamativo)
  text: string;
}

// Tabla de colores del badge de OVR del jugador. Editable a mano (el dueño
// define thresholds y colores cuando los quiera).
export const OVR_RATING_COLORS: OvrColorThreshold[] = [
  { min: 0, bg: '#475569', text: '#f8fafc' }, // slate-600
  { min: 40, bg: '#78716c', text: '#fafaf9' }, // stone-500
  { min: 50, bg: '#b91c1c', text: '#ffffff' }, // red-700
  { min: 60, bg: '#d97706', text: '#ffffff' }, // amber-600
  { min: 70, bg: '#16a34a', text: '#ffffff' }, // green-600
  { min: 80, bg: '#2563eb', text: '#ffffff' }, // blue-600
  { min: 90, bg: '#7c3aed', text: '#ffffff' }, // violet-600
  { min: 98, bg: '#db2777', text: '#ffffff' }, // pink-600
];

export function ovrRatingColor(rating: number): OvrColorThreshold {
  let color = OVR_RATING_COLORS[0];
  for (const t of OVR_RATING_COLORS) {
    if (rating >= t.min) color = t;
  }
  return color;
}
