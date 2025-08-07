import type { Category, Subcategory, Alignment } from './utils';
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

// Tipos de contenido base de Astro
type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;

/**
 * Interfaz para un logro ya evaluado y listo para ser mostrado.
 * Este es el objeto que el motor de evaluación producirá.
 */
export interface Achievement {
  id: string; // ID final, ej: 'win-streak-5'
  name: string;
  description: string;
  icon: ImageMetadata;
  rarity: number;
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;
  unique: boolean;
  visible: boolean;
  enabled: boolean;
  stars?: number;
  isMaxHolder?: boolean; // Flag para el poseedor máximo
}

/**
 * Define un único nivel (tier) dentro de una familia de logros.
 */
export interface AchievementTier {
  threshold: number;
  name: string;
  description: string;
  rarity: number;
  icon: ImageMetadata;
  stars?: number;
}

/**
 * Define una "familia" de logros que comparten la misma lógica de evaluación pero tienen diferentes umbrales.
 * Por ejemplo, "Racha de Victorias" es una familia con niveles para 3, 5, 7 victorias, etc.
 */
export interface AchievementFamily {
  id: string; // ID base de la familia, ej: 'win-streak'
  name: string; // Nombre para mostrar de la familia
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;

  /**
   * Función que calcula el valor numérico de la estadística para un miembro.
   * @returns El valor de la estadística (p. ej., la racha de victorias actual).
   */
  getStat: (
    memberName: string,
    matches: Match[],
    tournaments: Tournament[],
    members: Member[]
  ) => number;

  /**
   * Array de los diferentes niveles que se pueden alcanzar en esta familia de logros.
   * Debe estar ORDENADO de menor a mayor `threshold`.
   */
  tiers: AchievementTier[];

  /**
   * Si es `true`, el motor de evaluación identificará al miembro con el valor más alto
   * en esta estadística y marcará su logro con `isMaxHolder: true`.
   */
  trackMaxHolder: boolean;

  /**
   * Opcional. Si es `true`, el logro es único y solo puede ser obtenido por una persona.
   * Usado para logros especiales que no son de "máximo poseedor".
   */
  unique?: boolean;

  /**
   * Opcional. Si es `true`, esta familia de logros está activa y será evaluada.
   * Por defecto es `true`.
   */
  enabled?: boolean;

  /**
   * Opcional. Si es `true`, el logro no será visible en la interfaz de usuario.
   * Por defecto es `true`.
   */
  visible?: boolean;
}
