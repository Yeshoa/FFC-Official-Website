import type { SkillId } from '@data/players/index';

// Vocabulario canónico de posiciones (Fase B3). Siglas en inglés, cerradas.
export type Position =
  | 'GK' | 'CB' | 'LB' | 'RB'
  | 'CM' | 'DM' | 'AM' | 'RM' | 'LM'
  | 'CF' | 'LW' | 'RW';

export const CANONICAL_POSITIONS: Position[] = [
  'GK', 'CB', 'LB', 'RB',
  'CM', 'DM', 'AM', 'RM', 'LM',
  'CF', 'LW', 'RW',
];

export type Role = 'GK' | 'DEF' | 'MID' | 'FWD';

// Mapa explícito posición → rol (reemplaza la heurística, que clasificaba mal DM/LW/RW/CF).
// Incluye siglas legacy (`FWD`/`ST`) para la transición hasta normalizar la data.
const POSITION_ROLE: Record<string, Role> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CM: 'MID', DM: 'MID', AM: 'MID', RM: 'MID', LM: 'MID',
  CF: 'FWD', LW: 'FWD', RW: 'FWD',
  FWD: 'FWD', ST: 'FWD',
};

export function positionToRole(position: string): Role {
  const p = (position || '').trim().toUpperCase();
  return POSITION_ROLE[p] ?? 'FWD';
}

export const ROLE_ORDER: Record<Role, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

// Colores de badge por rol (clases estáticas para que Tailwind las detecte).
export const ROLE_STYLE: Record<Role, string> = {
  GK: 'bg-yellow-400 text-black',
  DEF: 'bg-sky-500 text-white',
  MID: 'bg-emerald-500 text-white',
  FWD: 'bg-red-500 text-white',
};

// Lista canónica de TODAS las habilidades: todos los jugadores, sin importar su
// posición, deben tenerlas todas asignadas (regla validada por `players:link`).
export const ALL_SKILLS: SkillId[] = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
  'injuryResistance',
];