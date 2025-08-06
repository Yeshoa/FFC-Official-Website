// Constantes de configuración del sistema de puntuación
export const SCORING_CONFIG = {
  // Límites máximos por categoría por porcentaje
  ROLEPLAY_PERCENTAGE: 30, // Porcentaje por rol
  EVENTS_PERCENTAGE: 50, // Porcentaje por eventos
  BONUS_PERCENTAGE: 20, // Porcentaje por bonus

  MAX_RAW_POINTS: 200, // Puntos brutos máximos
  // Límites individuales
  RP_MAX: 10, // Roleplay Points máximo
  EV_MAX: 20, // Event Points máximo
  BO_MAX: 20, // Bonus Points máximo

  // Límites por ediciones anteriores
  PRP_MAX: 20, // Previous Roleplay Points máximo
  PEV_MAX: 40, // Past Edition Events máximo
  PBO_MAX: 20, // Previous Bonus Points máximo
  PED_MAX: 40, // Previous Edition Results máximo

  // Maximo puntaje bruto antes de normalizar
  // RP_RAW_MAX: 20, // Roleplay Points bruto máximo
  // EV_RAW_MAX: 100, // Event Points bruto máximo
  // BO_RAW_MAX: 20, // Bonus Points bruto máximo

  // PRP_RAW_MAX: 20, // Previous Edition Results bruto máximo
  // PEV_RAW_MAX: 100, // Past Edition Events bruto máximo
  // PBO_RAW_MAX: 20, // Previous Bonus Points bruto máximo
  // PED_RAW_MAX: 20, // Previous Edition Results bruto máximo

  // Factor de decay por edición anterior
  DECAY_FACTORS: {
    1: 1.0, // Edición -1: 100%
    2: 0.5, // Edición -2: 50%
    3: 0.25, // Edición -3: 25%
    4: 0.1, // Edición -4: 10%
    // Ediciones más antiguas: 0%
  },
} as const

export const MAX_ROLEPLAY_POINTS = getCategoryMaxPoints(SCORING_CONFIG.ROLEPLAY_PERCENTAGE);
export const MAX_EVENTS_POINTS = getCategoryMaxPoints(SCORING_CONFIG.EVENTS_PERCENTAGE);
export const MAX_BONUS_POINTS = getCategoryMaxPoints(SCORING_CONFIG.BONUS_PERCENTAGE);

export const TIERS: Record<string, number> = {
  F: 0,
  E: 6,
  D: 16,
  C: 27,
  B: 40,
  A: 63,
  S: 93,
  SS: 126,
  X: 150,
};

export const getTotalColorClass = (total: number) => {
  if (total >= TIERS["X"]) return "bg-cyan-500/80 text-black font-bold";
  if (total >= TIERS["SS"]) return "bg-red-600/60 text-white font-bold";
  if (total >= TIERS["S"]) return "bg-orange-600/60 text-white font-bold";
  if (total >= TIERS["A"]) return "bg-yellow-600/80 text-white font-bold";
  if (total >= TIERS["B"]) return "bg-green-600/60 text-white font-bold";
  if (total >= TIERS["C"]) return "bg-blue-600/60 text-white font-bold";
  if (total >= TIERS["D"]) return "bg-purple-600/60 text-white font-bold";
  if (total >= TIERS["E"]) return "bg-pink-600/60 text-white font-bold";
  return "bg-gray-600/80 text-white font-bold";
};

export function normalizePoints(raw: number, rawMax: number, normMax: number): number {
  if (rawMax <= 0) return 0;
  return Math.ceil((raw / rawMax) * normMax);
}

export function getCategoryMaxPoints(percentage: number, maxRawPoints: number = SCORING_CONFIG.MAX_RAW_POINTS): number {
  return Math.ceil((percentage / 100) * maxRawPoints);
}