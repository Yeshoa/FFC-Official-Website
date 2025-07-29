import { tournamentAchievements } from './tournament';
import { awardAchievements }      from './awards';
import { streakAchievements }     from './streaks';
import { rivalryAchievements }    from './rivalry';
import { specialAchievements }    from './special';
import { rankingAchievements } from './ranking';
import { communityAchievements } from './community';
import { CATEGORIES, SUBCATEGORIES, ALIGNMENTS, type Category, hierarchy, type Subcategory, type Alignment } from '../utils';
import { getCollection }          from 'astro:content';
import type { CollectionEntry }   from 'astro:content';
import type { ImageMetadata }     from 'astro';

// Tipos de contenido
type Match      = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member     = CollectionEntry<'members'>;
type StaticAch  = CollectionEntry<'achievements'>;

// Interfaz de salida: rarity ahora es número
export interface Achievement {
  id: string;
  name: string;
  icon: ImageMetadata;
  description: string;
  rarity: number;         // nivel: -6 .. +6
  category: Category;
  subcategory: Subcategory;
  alignment: Alignment;
  unique: boolean;
  visible: boolean;
  enabled: boolean;
  stars?: number;
  suppresses?: string[];
}

/** Concatena todos los logros dinámicos y los ordena por nivel y luego nombre */
export const dynamicDefs = [
  ...tournamentAchievements,
  // ...awardAchievements,
  ...streakAchievements,
  ...rivalryAchievements,
  // ...specialAchievements,
  ...rankingAchievements,
  ...communityAchievements
].sort((a, b) => {
  if (a.rarity !== b.rarity) return a.rarity - b.rarity;
  return a.name.localeCompare(b.name);
});

/**
 * Obtiene logros dinámicos y manuales para un miembro,
 * filtrando únicos duplicados y jerarquías.
 */
export async function getAchievementsForMember(name: string): Promise<Achievement[]> {
  const [staticAch, matches, tournaments, members] = await Promise.all([
    getCollection('achievements'),
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('members'),
  ]);
  const member = members.find(m => m.data.name === name);
  if (!member) return [];

  // Descubrir logros únicos que tienen más de un dueño
  const duplicatedUniques = await findDuplicatedUniqueIds(matches, tournaments, members);

  // 1) Dinámicos
  const dynamic = dynamicDefs
    .map(def => def.evaluate(matches, tournaments, member, members))
    .filter((a): a is Achievement => !!a)
    .filter(a => !(a.unique && duplicatedUniques.has(a.id)));

  // 2) Manuales
  const manualIds: string[] = (member.data as any).manualAchievements || [];
  const manual = staticAch
    .filter(a => a.data && manualIds.includes(a.data.id))
    .map(a => ({
      id:          a.data.id,
      name:        a.data.name,
      icon:        a.data.icon,
      description: a.data.description,
      rarity:      a.data.rarity,
      category:    a.data.category as Category,
      subcategory: a.data.subcategory as Subcategory,
      alignment:   a.data.alignment as Alignment,
      unique:      a.data.unique,
      visible:     a.data.visible,
      enabled:     a.data.enabled,
      stars:       a.data.stars,
    }))
    .sort((a, b) => {  // Ordenar los logros manuales
      if (a.rarity !== b.rarity) return a.rarity - b.rarity;
      return a.name.localeCompare(b.name);
    });

  // 3) Unir, filtrar por jerarquía y enabled, y ordenar
  let all = [...manual, ...dynamic];

  // 4) Aplicar supresiones
  all = applySuppressions(all);

  // 5) Filtrar por jerarquía y enabled
  const achievedIds = new Set(all.map(a => a.id));
  all = all.filter(a => {
    const superior = Object.entries(hierarchy)
      .find(([lower, higher]) => lower === a.id && higher && achievedIds.has(higher));
    return !superior && a.enabled;
  });
  // 6) Ordenar por rareza, estrellas y nombre
  all.sort((a, b) => {
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    if (a.stars !== b.stars) return a.stars - b.stars;
    return a.name.localeCompare(b.name);
  });
  return all;
}

/**
 * Lista de miembros que tienen el logro dado (dinámico o manual).
 */
export async function getMembersWithAchievement(achievementId: string): Promise<Member[]> {
  const [members, matches, tournaments, staticAch] = await Promise.all([
    getCollection('members'),
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('achievements'),
  ]);
  const result: Member[] = [];
  for (const member of members) {
    // Evaluar dinámicos
    const dyn = dynamicDefs
      .map(def => def.evaluate(matches, tournaments, member, members))
      .filter((a): a is Achievement => !!a);
    // Evaluar manuales
    const manualIds: string[] = (member.data as any).manualAchievements || [];
    const man = staticAch
      .filter(a => manualIds.includes(a.data.id))
      .map(a => ({
        id:          a.data.id,
        name:        a.data.name,
        icon:        a.data.icon,
        description: a.data.description,
        rarity:      a.data.rarity,
        category:    a.data.category as Category,
        subcategory: a.data.subcategory as Subcategory,
        alignment:   a.data.alignment as Alignment,
        unique:      a.data.unique,
        visible:     a.data.visible,
        enabled:     a.data.enabled,
        stars:       a.data.stars,
      }));
    const allAchievements = [...dyn, ...man];
    if (allAchievements.some(ach => ach.id === achievementId)) {
      result.push(member);
    }
  }
  return result;
}

/**
 * Identifica los IDs únicos que están duplicados entre miembros.
 */
let duplicatedUniqueIdsCache: Set<string> | null = null;

export async function findDuplicatedUniqueIds(
  matches: Match[],
  tournaments: Tournament[],
  members: Member[]
): Promise<Set<string>> {
  if (duplicatedUniqueIdsCache) {
    console.log('[Logros] Reutilizando cache de IDs únicos duplicados');
    console.log(duplicatedUniqueIdsCache);
    return duplicatedUniqueIdsCache;
  }

  console.time('[Logros] Cálculo de IDs únicos duplicados');

  const counts = new Map<string, number>();
  for (const member of members) {
    for (const def of dynamicDefs) {
      const ach = def.evaluate(matches, tournaments, member, members);
      if (ach && def.unique) {
        counts.set(ach.id, (counts.get(ach.id) ?? 0) + 1);
      }
    }
  }

  const duplicated = new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
  );

  duplicatedUniqueIdsCache = duplicated;

  console.timeEnd('[Logros] Cálculo de IDs únicos duplicados');

  return duplicated;
}

// Reinicia la cache de IDs únicos duplicados
export function clearDuplicatedUniqueIdsCache() {
  duplicatedUniqueIdsCache = null;
}


/**
 * Dado un array de Achievement (con optional stars),
 * devuelve un array donde, de cada grupo con el mismo `id`,
 * sólo se conserva el que tenga más `stars`.
 */
function dedupeByMaxStars(achs: Achievement[]): Achievement[] {
  const bestById = new Map<string, Achievement>();

  for (const ach of achs) {
    const prev = bestById.get(ach.id);
    const currStars = ach.stars ?? 0;
    const prevStars = prev?.stars ?? 0;

    // Si no había ninguno, o éste tiene más estrellas, lo guardamos/reemplazamos
    if (!prev || currStars > prevStars) {
      bestById.set(ach.id, ach);
    }
  }

  // Map mantiene el orden de inserción de keys, así que respetarás
  // el "primer" orden que hayas construido tu array original (antes del dedupe).
  return Array.from(bestById.values());
}

function applySuppressions(achievements: Achievement[]): Achievement[] {
  const suppressedIds = new Set<string>();
  // Recolectar todos los IDs que están en las propiedades `suppresses`
  for (const ach of achievements) {
    if (ach.suppresses) {
      ach.suppresses.forEach(id => suppressedIds.add(id));
    }
  }
  // Filtrar los logros, excluyendo aquellos cuyos IDs estén en suppressedIds
  return achievements.filter(ach => !suppressedIds.has(ach.id));
}
