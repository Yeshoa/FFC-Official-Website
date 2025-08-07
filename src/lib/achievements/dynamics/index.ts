// import { tournamentAchievements } from './tournament';
// import { awardAchievements }      from './awards';
import { streakAchievementFamilies }     from './streaks';
// import { rivalryAchievements }    from './rivalry';
// import { specialAchievements }    from './special';
// import { rankingAchievements } from './ranking';
// import { communityAchievements } from './community';

import { getMembers, getAchievements, getMatches, getTournaments } from '@lib/generalUtils';
import type { CollectionEntry } from 'astro:content';
import type { Achievement, AchievementFamily } from '../types';
import { calculateAllStats, evaluateAchievementFamily } from '../engine';

// Tipos de contenido
type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type StaticAch = CollectionEntry<'achievements'>;

/**
 * Array que contiene todas las definiciones de familias de logros dinámicos.
 * A medida que se refactoricen más archivos de logros, se añadirán aquí.
 */
export const dynamicFamilies: AchievementFamily[] = [
  ...streakAchievementFamilies,
  // ...tournamentAchievementFamilies,
  // ...etc
];

/**
 * Obtiene todos los logros (dinámicos y manuales) para un miembro específico.
 * Utiliza el nuevo motor de evaluación de logros.
 */
export async function getAchievementsForMember(name: string): Promise<Achievement[]> {
  // 1) Obtener todos los datos necesarios
  const [staticAch, matches, tournaments, members] = await Promise.all([
    getAchievements(),
    getMatches(),
    getTournaments(),
    getMembers(),
  ]);
  const member = members.find(m => m.data.name === name);
  if (!member) return [];

  // 2) Pre-calcular todas las estadísticas para un rendimiento óptimo
  const allStats = calculateAllStats(dynamicFamilies, members, matches, tournaments);

  // 3) Descubrir logros únicos que tienen más de un dueño
  const duplicatedUniques = findDuplicatedUniqueIds(members, allStats);

  // 4) Evaluar logros dinámicos para el miembro actual
  const dynamic = dynamicFamilies
    .map(family => evaluateAchievementFamily(family, member, allStats))
    .filter((a): a is Achievement => !!a) // Filtrar nulos (logros no obtenidos)
    .filter(a => !(a.unique && duplicatedUniques.has(a.id))); // Filtrar únicos duplicados

  // 5) Obtener logros manuales (sin cambios en esta lógica)
  const manualIds: string[] = (member.data as any).manualAchievements || [];
  const manual = staticAch
    .filter(a => a.data && manualIds.includes(a.data.id))
    .map(a => ({
      ...a.data,
      id: a.data.id,
      isMaxHolder: false, // Los logros manuales no pueden ser 'max holder'
    } as Achievement));

  // 6) Unir ambos tipos de logros
  let all = [...manual, ...dynamic];

  // 7) Filtrar los que estén deshabilitados y ordenar
  all = all.filter(a => a.enabled);
  all.sort((a, b) => {
    if (a.rarity !== b.rarity) return b.rarity - a.rarity; // Mayor rareza primero
    if ((a.stars ?? 0) !== (b.stars ?? 0)) return (b.stars ?? 0) - (a.stars ?? 0); // Mayor estrellas primero
    return a.name.localeCompare(b.name);
  });

  return all;
}

/**
 * Identifica los IDs de logros marcados como `unique` que han sido otorgados a más de un miembro.
 * Adaptado para funcionar con el nuevo sistema de familias de logros.
 */
function findDuplicatedUniqueIds(
  members: Member[],
  allStats: ReturnType<typeof calculateAllStats>
): Set<string> {
  // TODO: Implementar un sistema de caché si el rendimiento es un problema.
  const counts = new Map<string, number>();

  for (const member of members) {
    for (const family of dynamicFamilies) {
      // Solo nos interesan las familias de logros únicos que no sean de 'max holder'
      if (family.unique && !family.trackMaxHolder) {
        const ach = evaluateAchievementFamily(family, member, allStats);
        if (ach) {
          counts.set(ach.id, (counts.get(ach.id) ?? 0) + 1);
        }
      }
    }
  }

  const duplicated = new Set<string>();
  for (const [id, count] of counts.entries()) {
    if (count > 1) {
      duplicated.add(id);
    }
  }

  return duplicated;
}

// TODO: La función getMembersWithAchievement necesita ser refactorizada también
// si se va a seguir utilizando. Por ahora, se deja como está pero es probable que
// no funcione correctamente con el nuevo sistema.
export async function getMembersWithAchievement(achievementId: string): Promise<Member[]> {
    return [];
}
