import { tournamentAchievements } from './tournament';
import { awardAchievements }      from './awards';
import { streakAchievements }     from './streaks';
import { rivalryAchievements }    from './rivalry';
import { specialAchievements }    from './special';
import { RARITIES, levelFromRarity, rarityFromLevel, CATEGORIES, type Category, hierarchy } from '../utils';
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
  unique: boolean;
  visible: boolean;
  enabled: boolean;
}

// Orden de rareza para sorting: usamos índices de RARITIES
const rarityOrderLevels = RARITIES.map((_, idx) => idx);

/** Concatena todos los logros dinámicos y los ordena por nivel y luego nombre */
export const dynamicDefs = [
  ...tournamentAchievements,
  ...awardAchievements,
  ...streakAchievements,
  ...rivalryAchievements,
  ...specialAchievements,
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
    .filter(a => manualIds.includes(a.data.id))
    .map(a => ({
      id:          a.id,
      name:        a.data.name,
      icon:        a.data.icon,
      description: a.data.description,
      rarity:      a.data.rarity,
      category:    a.data.category as Category,
      unique:      a.data.unique,
      visible:     a.data.visible,
      enabled:     a.data.enabled,
    }))
    .sort((a, b) => {  // Ordenar los logros manuales
      if (a.rarity !== b.rarity) return a.rarity - b.rarity;
      return a.name.localeCompare(b.name);
    });

  // 3) Unir, filtrar por jerarquía y enabled, y ordenar
  let all = [...manual, ...dynamic];
  const achievedIds = new Set(all.map(a => a.id));
  all = all.filter(a => {
    const superior = Object.entries(hierarchy)
      .find(([lower, higher]) => lower === a.id && higher && achievedIds.has(higher));
    return !superior && a.enabled;
  });
  all.sort((a, b) => {
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
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
        unique:      a.data.unique,
        visible:     a.data.visible,
        enabled:     a.data.enabled,
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
async function findDuplicatedUniqueIds(
  matches: Match[],
  tournaments: Tournament[],
  members: Member[]
): Promise<Set<string>> {
  const counts = new Map<string, number>();
  for (const member of members) {
    for (const def of dynamicDefs) {
      const ach = def.evaluate(matches, tournaments, member, members);
      if (ach && def.unique) {
        counts.set(ach.id, (counts.get(ach.id) ?? 0) + 1);
      }
    }
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
  );
}
