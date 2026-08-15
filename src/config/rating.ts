import type { Player, SkillId } from '@data/players/index';
import { positionToRole, type Role } from '@config/positions';

// Las 22 skills de rendimiento (injuryResistance NO entra al rating; pesa en el mercado).
export const PERFORMANCE_SKILLS: SkillId[] = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
];

// Pesos por rol: TODAS las skills cuentan (las periféricas con peso bajo).
// Se normalizan a 100 por rol → todas las posiciones con la misma sumatoria
// de pesos, para que los overalls sean comparables entre posiciones.
const ROLE_WEIGHTS: Record<Role, Partial<Record<SkillId, number>>> = {
  GK: {
    reflexes: 12, gkPositioning: 12, stretch: 10, saveClose: 11, catch: 12,
    positioning: 6, pace: 5, agility: 4, jumping: 4, power: 4, stamina: 3,
    heading: 3, stability: 2, vision: 2, clearing: 2,
    longRange: 1, shortRange: 1, mediumRange: 1, dribbling: 1, fakes: 1,
    ballControl: 1, tackling: 1, sliding: 1,
  },
  DEF: {
    tackling: 13, clearing: 13, sliding: 12, positioning: 12, heading: 10,
    pace: 8, power: 5, agility: 5, stamina: 5, jumping: 4,
    vision: 2, stability: 3, ballControl: 2,
    shortRange: 1, mediumRange: 1, longRange: 1, dribbling: 1, fakes: 1,
    reflexes: 0.5, gkPositioning: 0.5, stretch: 0.5, saveClose: 0.5, catch: 0.5,
  },
  MID: {
    ballControl: 12, shortRange: 10, vision: 10, positioning: 10, stability: 8,
    dribbling: 8, mediumRange: 8, longRange: 6, pace: 6, agility: 5, fakes: 5,
    stamina: 4, power: 2, heading: 2, tackling: 2,
    clearing: 1, sliding: 1, jumping: 1,
    reflexes: 0.5, gkPositioning: 0.5, stretch: 0.5, saveClose: 0.5, catch: 0.5,
  },
  FWD: {
    shortRange: 14, dribbling: 12, fakes: 10, pace: 10, mediumRange: 9,
    longRange: 8, agility: 8, heading: 7, positioning: 6, stability: 6,
    ballControl: 5, stamina: 3, vision: 3, power: 2, jumping: 2,
    tackling: 1, clearing: 1, sliding: 1,
    reflexes: 0.5, gkPositioning: 0.5, stretch: 0.5, saveClose: 0.5, catch: 0.5,
  },
};

// Normaliza los pesos de cada rol a una sumatoria de 100.
const NORMALIZED: Record<Role, Partial<Record<SkillId, number>>> = (() => {
  const out = {} as Record<Role, Partial<Record<SkillId, number>>>;
  for (const role of Object.keys(ROLE_WEIGHTS) as Role[]) {
    const weights = ROLE_WEIGHTS[role];
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const scaled: Partial<Record<SkillId, number>> = {};
    for (const [skill, w] of Object.entries(weights)) {
      scaled[skill as SkillId] = (w / total) * 100;
    }
    out[role] = scaled;
  }
  return out;
})();

// Peso neutral (posición no reconocida): todas las skills por igual.
const DEFAULT_WEIGHT: Partial<Record<SkillId, number>> = Object.fromEntries(
  PERFORMANCE_SKILLS.map((s) => [s, 100 / PERFORMANCE_SKILLS.length]),
) as Partial<Record<SkillId, number>>;

// Curva de escala: raw (promedio pesado de skills 10-90) → rating visible.
// Banda media honesta (promedio ~35-40) + estiramiento del tope (superestrellas
// 80-89); 90+ queda libre/reservado. Editable a mano (anclas).
const RATING_CURVE: [number, number][] = [
  [10, 8], [20, 15], [30, 24], [38, 34], [45, 42], [50, 48], [55, 52],
  [60, 58], [65, 64], [70, 72], [74, 80], [76, 85], [77, 88], [78, 89],
  [80, 92], [85, 95], [90, 97], [95, 99], [100, 100],
];

export function mapRating(raw: number): number {
  if (raw <= 0) return 0;
  const curve = RATING_CURVE;
  if (raw <= curve[0][0]) return curve[0][1];
  for (let i = 0; i < curve.length - 1; i++) {
    const [a, b] = curve[i];
    const [c, d] = curve[i + 1];
    if (raw >= a && raw <= c) return Math.round(b + ((raw - a) / (c - a)) * (d - b));
  }
  return curve[curve.length - 1][1];
}

// skills vacías → rating 0; con skills → promedio pesado por rol (todas las
// skills cuentan, pesos normalizados a 100) mapeado por la curva.
export function computePlayerRating(
  skills: Partial<Record<SkillId, number>>,
  position: string
): number {
  const role = positionToRole(position);
  const weights = NORMALIZED[role] ?? DEFAULT_WEIGHT;
  let sum = 0;
  let present = 0;
  for (const [skill, weight] of Object.entries(weights)) {
    const v = skills[skill as SkillId];
    if (typeof v === 'number' && v > 0) {
      sum += v * weight;
      present += weight;
    }
  }

  if (present === 0) return 0;
  return mapRating(sum / present);
}

export interface StarsThreshold {
  min: number;
  stars: number;
}

// Tabla ajustable: rating → estrellitas (0.5-6, pasos de 0.5).
export const RATING_TO_STARS: StarsThreshold[] = [
  { min: 0, stars: 0.5 },
  { min: 20, stars: 1 },
  { min: 30, stars: 1.5 },
  { min: 40, stars: 2 },
  { min: 50, stars: 2.5 },
  { min: 60, stars: 3 },
  { min: 70, stars: 3.5 },
  { min: 80, stars: 4 },
  { min: 87, stars: 4.5 },
  { min: 93, stars: 5 },
  { min: 98, stars: 5.5 },
  { min: 100, stars: 6 },
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
  { min: 10, stars: 1 },
  { min: 18, stars: 1.5 },
  { min: 25, stars: 2 },
  { min: 30, stars: 2.5 },
  { min: 35, stars: 3 },
  { min: 40, stars: 3.5 },
  { min: 46, stars: 4 },
  { min: 52, stars: 4.5 },
  { min: 58, stars: 5 },
  { min: 65, stars: 5.5 },
  { min: 75, stars: 6 },
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

// Tabla de colores del badge de OVR del jugador. Bandas casi lineales (cada ~10).
// Editable a mano (el dueño define thresholds y colores cuando los quiera).
export const OVR_RATING_COLORS: OvrColorThreshold[] = [
  { min: 0, bg: '#475569', text: '#f8fafc' }, // slate-600
  { min: 15, bg: '#78716c', text: '#fafaf9' }, // stone-500
  { min: 25, bg: '#57534e', text: '#fafaf9' }, // stone-600
  { min: 35, bg: '#b91c1c', text: '#ffffff' }, // red-700
  { min: 45, bg: '#c2410c', text: '#ffffff' }, // orange-700
  { min: 55, bg: '#d97706', text: '#ffffff' }, // amber-600
  { min: 65, bg: '#ca8a04', text: '#ffffff' }, // yellow-600
  { min: 75, bg: '#16a34a', text: '#ffffff' }, // green-600
  { min: 85, bg: '#2563eb', text: '#ffffff' }, // blue-600
  { min: 92, bg: '#7c3aed', text: '#ffffff' }, // violet-600
  { min: 98, bg: '#db2777', text: '#ffffff' }, // pink-600
];

export function ovrRatingColor(rating: number): OvrColorThreshold {
  let color = OVR_RATING_COLORS[0];
  for (const t of OVR_RATING_COLORS) {
    if (rating >= t.min) color = t;
  }
  return color;
}
