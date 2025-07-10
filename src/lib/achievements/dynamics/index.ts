import { tournamentAchievements } from './tournament';
import { awardAchievements } from './awards';
import { streakAchievements } from './streaks';
import { rivalryAchievements } from './rivalry';
import { specialAchievements } from './special';
import { RARITIES, type Rarity, CATEGORIES, type Category, hierarchy } from '../utils';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type Match = CollectionEntry<'matches'>;
type Tournament = CollectionEntry<'tournaments'>;
type Member = CollectionEntry<'members'>;
type StaticAch = CollectionEntry<'achievements'>;
export interface Achievement {
  id: string;
  name: string;
  icon: ImageMetadata;
  description: string;
  rarity: Rarity;
  category: Category;
  unique: boolean;
  visible: boolean; // This one is for when it is locked, not for enabled or disabled
  enabled: boolean;
}

const rarityOrder = RARITIES;

export const dynamicDefs = [
  ...tournamentAchievements,
  ...awardAchievements,
  ...streakAchievements,
  ...rivalryAchievements,
  // ...specialAchievements,

].sort((a, b) => {
  const rA = rarityOrder.findIndex(r => r.toLowerCase() === a.rarity.toLowerCase());
  const rB = rarityOrder.findIndex(r => r.toLowerCase() === b.rarity.toLowerCase());
  if (rA !== rB) return rA - rB;
  return a.name.localeCompare(b.name);
});

/**
 * Returns both manual (static) and dynamic achievements for a given member name.
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

  const duplicatedUniques = await findDuplicatedUniqueIds();

  // 1) Dynamic
  const dynamic = dynamicDefs
    .map(def => def.evaluate(matches, tournaments, member, members))
    .filter((a): a is Achievement => !!a)
    .filter(a => !(a.unique && duplicatedUniques.has(a.id)));

  // 2) Manual – suppose you have a field `member.data.manualAchievements: string[]`
  const manualIds: string[] = (member.data as any).manualAchievements || [];
  const manual = staticAch
    .filter(a => manualIds.includes(a.data.id))
    .map(a => ({
      id: a.id,
      name: a.data.name,
      icon: a.data.icon,
      description: a.data.description,
      rarity: a.data.rarity as Achievement['rarity'],
      category: a.data.category as Achievement['category'],
      unique: a.data.unique,
      visible: a.data.visible,
      enabled: a.data.enabled,
    }));

  // Unir y ordenar por rareza y nombre
  let all = [...manual, ...dynamic];
  const achievedIds = new Set(all.map(a => a.id));
  all = all.filter(a => {
    const superior = Object.entries(hierarchy)
      .find(([lower, higher]) => lower === a.id && higher && achievedIds.has(higher));
    return !superior && a.enabled;
  });
  all.sort((a, b) => {
    const rA = rarityOrder.findIndex(r => r.toLowerCase() === a.rarity.toLowerCase());
    const rB = rarityOrder.findIndex(r => r.toLowerCase() === b.rarity.toLowerCase());
    if (rA !== rB) return rA - rB;
    return a.name.localeCompare(b.name);
  });
  return all;
}

export async function getMembersWithAchievement(achievementId: string): Promise<Member[]> {
  // Obtener todas las colecciones necesarias
  const [members, matches, tournaments, staticAch] = await Promise.all([
    getCollection('members'),
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('achievements'),
  ]);

  const membersWithAchievement: Member[] = [];

  // Iterar sobre cada miembro
  for (const member of members) {
    // Evaluar logros dinámicos
    const dynamicAchievements = dynamicDefs
      .map(def => def.evaluate(matches, tournaments, member, members))
      .filter((a): a is Achievement => !!a);

    // Obtener logros manuales
    const manualIds: string[] = (member.data as any).manualAchievements || [];
    const manualAchievements = staticAch
      .filter(a => manualIds.includes(a.data.id))
      .map(a => ({
        id: a.data.id,
        name: a.data.name,
        icon: a.data.icon,
        description: a.data.description,
        rarity: a.data.rarity as Achievement['rarity'],
        category: a.data.category as Achievement['category'],
        unique: a.data.unique,
        visible: a.data.visible,
        enabled: a.data.enabled,
      }));

    // Combinar ambos tipos de logros
    const allAchievements = [...manualAchievements, ...dynamicAchievements];

    // Verificar si el logro específico está presente
    if (allAchievements.some(ach => ach.id === achievementId)) {
      membersWithAchievement.push(member);
    }
  }

  return membersWithAchievement;
}

async function findDuplicatedUniqueIds(): Promise<Set<string>> {
  const [matches, tournaments, members] = await Promise.all([
    getCollection('matches'),
    getCollection('tournaments'),
    getCollection('members'),
  ]);

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

