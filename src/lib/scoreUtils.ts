// Constantes de configuración del sistema de puntuación
export const SCORING_CONFIG = {
  // Límites máximos por categoría
  MAX_HISTORY_POINTS: 100,
  MAX_PREV_EDITION_POINTS: 150,
  MAX_EVENT_POINTS: 100,

  // Límites individuales
  H_MAX: 100, // History Points máximo
  E_MAX: 150, // Past Edition Results máximo
  EV_MAX: 100, // Event Points máximo

  // Factor de decay por edición anterior
  DECAY_FACTORS: {
    1: 1.0, // Edición -1: 100%
    2: 0.5, // Edición -2: 50%
    3: 0.25, // Edición -3: 25%
    4: 0.1, // Edición -4: 10%
    // Ediciones más antiguas: 0%
  },
} as const
