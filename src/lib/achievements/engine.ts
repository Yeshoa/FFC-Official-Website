import type { AchievementFamily, Achievement } from './types';
import type { CollectionEntry } from 'astro:content';

// Tipos de contenido base
type Member = CollectionEntry<'members'>;
type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;

/**
 * Un mapa que almacena las estadísticas pre-calculadas para todos los miembros.
 * La estructura es: Map<familyId, Map<memberName, statValue>>
 */
export type AllStats = Map<string, Map<string, number>>;

/**
 * Pre-calcula todas las estadísticas requeridas para todos los miembros y todas las familias de logros.
 * Esto evita tener que recalcular los mismos valores una y otra vez.
 */
export function calculateAllStats(
  families: AchievementFamily[],
  members: Member[],
  matches: Match[],
  tournaments: Tournament[],
): AllStats {
  const allStats: AllStats = new Map();

  for (const family of families) {
    // Si la familia de logros está deshabilitada, la saltamos.
    if (family.enabled === false) continue;

    const familyStats = new Map<string, number>();
    for (const member of members) {
      const statValue = family.getStat(member.data.name, matches, tournaments, members);
      familyStats.set(member.data.name, statValue);
    }
    allStats.set(family.id, familyStats);
  }

  return allStats;
}

/**
 * Evalúa una única familia de logros para un miembro específico usando las estadísticas pre-calculadas.
 * @returns Un objeto `Achievement` si el miembro alcanzó algún nivel, o `null` en caso contrario.
 */
export function evaluateAchievementFamily(
  family: AchievementFamily,
  member: Member,
  allStats: AllStats
): Achievement | null {
  const familyStats = allStats.get(family.id);
  if (!familyStats) return null;

  const memberStat = familyStats.get(member.data.name);
  if (memberStat === undefined) return null;

  // Encuentra el nivel (tier) más alto que el miembro ha alcanzado.
  // Se asume que `family.tiers` está ordenado de menor a mayor `threshold`.
  const achievedTier = family.tiers.reduce((highest, current) => {
    return memberStat >= current.threshold ? current : highest;
  }, null as any); // Se usa `as any` para evitar problemas con el tipo inicial `null`

  if (!achievedTier) {
    return null; // El miembro no ha alcanzado ningún nivel en esta familia.
  }

  // Si se debe rastrear al poseedor máximo, lo comprobamos ahora.
  let isMaxHolder = false;
  if (family.trackMaxHolder) {
    const allValues = Array.from(familyStats.values());
    const maxValue = Math.max(...allValues);
    if (memberStat === maxValue && maxValue > 0) { // Solo se es max holder si el valor es positivo
      isMaxHolder = true;
    }
  }

  // Construimos el objeto final del logro.
  const achievement: Achievement = {
    id: `${family.id}-${achievedTier.threshold}`,
    name: achievedTier.name,
    description: achievedTier.description,
    rarity: achievedTier.rarity,
    icon: achievedTier.icon,
    stars: achievedTier.stars,
    category: family.category,
    subcategory: family.subcategory,
    alignment: family.alignment,
    unique: family.unique ?? false,
    visible: family.visible ?? true,
    enabled: family.enabled ?? true,
    isMaxHolder: isMaxHolder,
  };

  return achievement;
}
