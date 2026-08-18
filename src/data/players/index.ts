import playersData from './players.json';
import type { Position } from '@config/positions';

export type SkillId =
  | 'shortRange' | 'mediumRange' | 'longRange'
  | 'heading'
  | 'pace' | 'agility' | 'stamina' | 'jumping'
  | 'dribbling' | 'fakes' | 'ballControl'
  | 'stability' | 'positioning' | 'vision'
  | 'tackling' | 'sliding' | 'clearing' | 'power'
  | 'reflexes' | 'gkPositioning' | 'stretch' | 'saveClose' | 'catch'
  | 'injuryResistance';

export interface PlayerTeamEntry {
  teamCode: string;
  teamType: 'national' | 'club';
  teamId?: number; // id global del equipo (miembro o club, fuente de verdad)
  number?: number | null;
  from?: string;
  to?: string;
  status: 'active' | 'retired' | 'transferred';
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  nationality: string;
  nationalityId?: number; // id global del miembro (fuente de verdad)
  birthdate?: string | null;
  age?: number; // para precios de mercado (fallback si no hay birthdate)
  birthplace?: { city?: string | null; state?: string | null };
  height?: number; // centímetros (puede modular el juego aéreo en el simulador)
  foot?: 'left' | 'right'; // pierna buena
  form?: number; // 0-100, forma actual (factor de precio)
  playingStyle?: string; // estilo de juego (nombre)
  positions?: Position[]; // posiciones secundarias (incluye la principal)
  perks?: number[]; // ids de perks (ver @data/perks)
  pesId?: number; // id PES original (trazabilidad de la migración)
  skills: Partial<Record<SkillId, number>>;
  teams: PlayerTeamEntry[];
  stars?: { overall: number };
  marketPrice?: number; // override manual del precio de mercado (millones)
  transferListed?: boolean; // en venta a pesar de tener club
  retired?: boolean; // retirado 100% (fuera del mercado de pases)
}

const players: Player[] = playersData as Player[];

const byId = new Map<number, Player>();
const byTeam = new Map<string, Player[]>();

for (const player of players) {
  byId.set(player.id, player);
  for (const team of player.teams) {
    if (team.status !== 'active') continue;
    const code = team.teamCode.trim().toLowerCase();
    const list = byTeam.get(code) ?? [];
    list.push(player);
    byTeam.set(code, list);
  }
}

export function getPlayerById(id: number | string): Player | null {
  if (id === null || id === undefined || id === '') return null;
  const num = typeof id === 'number' ? id : Number(id);
  if (Number.isNaN(num)) return null;
  return byId.get(num) ?? null;
}

// Nombre compuesto "Nombre Apellido" (antes campo `name`; ahora derivado).
export function getPlayerName(player: Pick<Player, 'firstName' | 'lastName'>): string {
  return [player.firstName, player.lastName].filter(Boolean).join(' ');
}

// Retirado 100% = flag explícito `retired` o ninguna entrada de teams[] con status 'active'.
export function isPlayerRetired(player: Player): boolean {
  return !!player.retired || !player.teams.some((t) => t.status === 'active');
}

export function loadCurrentSquad(teamCode: string): Player[] {
  return byTeam.get(teamCode.trim().toLowerCase()) ?? [];
}

// Plantel activo resolviendo por id global de equipo (fuente de verdad de la Fase D).
export function loadCurrentSquadByTeamId(teamId: number): Player[] {
  return players.filter((player) =>
    player.teams.some((t) => t.status === 'active' && t.teamId === teamId),
  );
}

export function loadHistoricalSquad(_teamCode: string): Player[] {
  return [];
}

export function getAllPlayers(): Player[] {
  return players;
}
