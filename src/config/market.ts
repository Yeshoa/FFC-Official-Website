// Precios de mercado (FCL). Client-safe (no depende del server).
// Fórmula: precio = base(rating) × factorEdad(age) × factorPosición(position) × factorLesiones(injuryResistance).
// Todo editable a mano (tablas abajo). Precio mínimo: 1K.
import { positionToRole } from '@config/positions';
import type { MarketRole } from '@ty/market';

export const MIN_PRICE = 0.001; // 1K en millones

// Base por overall (thresholds ajustables, escala nueva de rating).
export const RATING_PRICE: { min: number; price: number }[] = [
  { min: 0, price: 0.001 },
  { min: 20, price: 0.5 },
  { min: 28, price: 1.5 },
  { min: 35, price: 4 },
  { min: 42, price: 7 },
  { min: 48, price: 11 },
  { min: 54, price: 16 },
  { min: 60, price: 24 },
  { min: 66, price: 34 },
  { min: 72, price: 48 },
  { min: 78, price: 65 },
  { min: 84, price: 85 },
  { min: 90, price: 110 },
  { min: 95, price: 140 },
  { min: 100, price: 180 },
];

// Curva de edad: joven con potencial sale caro, pico 23-27, declive después.
export function ageFactor(age: number | null | undefined): number {
  const a = age ?? 25;
  if (a <= 18) return 1.0;
  if (a <= 22) return 1.2;
  if (a <= 27) return 1.15;
  if (a === 28) return 1.0;
  if (a === 29) return 0.9;
  if (a === 30) return 0.8;
  if (a === 31) return 0.7;
  if (a === 32) return 0.55;
  if (a === 33) return 0.45;
  if (a === 34) return 0.35;
  if (a === 35) return 0.25;
  return 0.15;
}

// Ajuste menor por rol.
export const POSITION_FACTOR: Record<MarketRole, number> = {
  GK: 0.9,
  DEF: 0.95,
  MID: 1.0,
  FWD: 1.05,
};

// InjuryResistance (skill 0-100): 0 → 0.9, 100 → 1.1.
export function injuryFactor(injuryResistance: number | undefined): number {
  const v = typeof injuryResistance === 'number' && injuryResistance > 0 ? injuryResistance : 50;
  return 0.9 + v / 500;
}

// Form (0-100): 0 → 0.9, 100 → 1.1 (factor de forma actual).
export const FORM_PRICE_RANGE = 0.2; // rango total (0.9-1.1), ajustable a mano
export function formFactor(form: number | undefined): number {
  if (typeof form !== 'number' || Number.isNaN(form)) return 1;
  const f = Math.min(100, Math.max(0, form));
  return 0.9 + (f / 100) * FORM_PRICE_RANGE;
}

// Perks: cada perk suma un % fijo al precio (boost configurable).
export const PERK_PRICE_BOOST = 0.03; // +3% por perk
export function perkFactor(perks: number[] | undefined): number {
  return 1 + (perks?.length ?? 0) * PERK_PRICE_BOOST;
}

export interface MarketPriceInput {
  rating: number;
  age?: number | null;
  position: string;
  injuryResistance?: number;
  form?: number;
  perks?: number[];
}

// Calcula el precio en millones (mínimo 1K, pasos de 50K).
export function computeMarketPrice({ rating, age, position, injuryResistance, form, perks }: MarketPriceInput): number {
  const role = positionToRole(position);
  let base = RATING_PRICE[0].price;
  for (const t of RATING_PRICE) if (rating >= t.min) base = t.price;
  const raw =
    base *
    ageFactor(age) *
    (POSITION_FACTOR[role] ?? 1) *
    injuryFactor(injuryResistance) *
    formFactor(form) *
    perkFactor(perks);
  return Math.max(MIN_PRICE, Math.round(raw * 20) / 20);
}

// Formatea millones a K/M: 0.001 → "1K", 0.95 → "950K", 1.3 → "1.3M", 15 → "15M".
export function formatPrice(millions: number): string {
  if (millions >= 1) {
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  return `${Math.max(1, Math.round(millions * 1000))}K`;
}

// Parsea un input de precio (millones): acepta "950K", "15M" o un número (se asume M).
// Devuelve millones o null si es inválido/negativo.
export function parsePriceInput(str: string): number | null {
  const s = str.trim().toUpperCase();
  if (!s) return null;
  let n: number;
  if (s.endsWith('K')) n = Number(s.slice(0, -1)) / 1000;
  else if (s.endsWith('M')) n = Number(s.slice(0, -1));
  else n = Number(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
