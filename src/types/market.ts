// Tipos del simulador de mercado de pases (FCL).
import type { SkillId } from '@data/players/index';

export type MarketRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface MarketPlayer {
  id: string; // id dentro del mercado
  playerId?: number; // id global en players.json si el jugador existe
  name: string; // nombre compuesto (display en listas)
  firstName?: string;
  lastName?: string;
  position: string; // posición natural
  role: MarketRole; // derivado de position
  nationality?: string; // código de federación (bandera)
  flagUrl?: string; // URL servida de la bandera (resuelta en frontmatter)
  club?: string; // club actual (display)
  age?: number;
  form?: number; // 0-100, factor de precio
  perks?: number[]; // ids de perks (ver @data/perks)
  price: number; // precio de compra (millones)
  skills: Partial<Record<SkillId, number>>;
}

export interface MarketClub {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  colors?: { primary: string; secondary: string };
  budget: number; // presupuesto FCL preasignado (millones)
}

// Federación (miembro) con sus clubes ordenados por su última liga (fallback alfabético).
export interface FederationGroup {
  id: number;
  code: string;
  name: string;
  flagUrl?: string;
  clubs: MarketClub[];
}

// Nacionalidad para el filtro (bandera + code + nombre para búsqueda).
export interface MarketNationality {
  code: string;
  name: string;
  flagUrl?: string;
  allowsForeignMarket?: boolean; // true = sus jugadores pueden ser fichados por clubes extranjeros
}

export interface MarketData {
  season: number;
  players: MarketPlayer[];
}
