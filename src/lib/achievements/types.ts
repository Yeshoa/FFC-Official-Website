import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import type { Category, Subcategory, Alignment } from './utils';

export type Member = CollectionEntry<'members'>;
export type Match = CollectionEntry<'matches'>;
export type Tournament = CollectionEntry<'tournaments'>;
export type StaticAchievement = CollectionEntry<'achievements'>;

/** Datos compartidos que toda evaluación necesita (sin el miembro, se inyecta aparte). */
export interface AchievementContext {
  matches: Match[];
  tournaments: Tournament[];
  members: Member[];
  achievements: StaticAchievement[];
}

/** Resultado de evaluar una definición para un miembro (separado del display). */
export interface AchievementResult {
  id: string;
  achieved: boolean;
  progress?: number;   // 0..100
  current?: number;    // valor actual
  target?: number;     // valor objetivo
  earnedAt?: string;
  visible: boolean;    // false = secreto
  name?: string;
  description?: string;
  stars?: number;
  rarity?: number;
  suppresses?: string[];
}

/** Evaluador puro: recibe el contexto + miembro e indica si se logró y con qué progreso. */
export type AchievementEvaluate = (
  this: AchievementDefinition,
  context: AchievementContext & { member: Member },
) => AchievementResult | null;

/** Definición registrable: datos estáticos + evaluador. */
export interface AchievementDefinition {
  id: string;
  name: string;
  icon: ImageMetadata;
  description: string;
  rarity: number;
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;
  unique: boolean;
  visible: boolean;
  enabled: boolean;
  stars?: number;
  suppresses?: string[];
  evaluate: AchievementEvaluate;
}

/** Logro final del pipeline: definición + resultado fusionados (para la UI). */
export type Achievement = Omit<AchievementDefinition, 'evaluate'> & AchievementResult;

/** Computa el progreso porcentual a partir de current/target. */
export function computeProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/** Resultado de un logro NO logrado con progreso medible (para la barra de los locked). */
export function lockedResult(
  def: { id: string; visible?: boolean },
  current: number,
  target: number,
  extra: Partial<AchievementResult> = {},
): AchievementResult {
  return {
    id: def.id,
    achieved: false,
    visible: def.visible ?? true,
    current,
    target,
    progress: computeProgress(current, target),
    ...extra,
  };
}
