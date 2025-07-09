import { tournamentAchievements } from './tournament';
import { awardAchievements } from './awards';
import { streakAchievements } from './streaks';
import { rivalryAchievements } from './rivalry';
import { specialAchievements } from './special';
import { RARITIES, type Rarity, CATEGORIES, type Category } from '../utils';
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

// minor -> major
const achievementHierarchy: Record<string, string> = {
  'host': '', //host
  'champion': 'double-champion', //champion
  'double-champion': 'triple-champion', //double-champion
  'triple-champion': '', //triple-champion
  'unbeaten-champion': 'perfect-champion', //invictus
  'perfect-champion': 'ultimate-champion', //flawless
  'ultimate-champion': '', //puntaje perfecto + todos los premios
  'golden-ball': 'mvp-gg-gb', //mvp
  'golden-glove': 'mvp-gg-gb', //wall
  'golden-boot': 'mvp-gg-gb', //golden-boot
  'mvp-gg-gb': 'mvp-gg-gb-single', //awarded
  'mvp-gg-gb-single': '', //poker
  'no-goal': '', //goal-famine
  'ten-goals': 'twenty-goals', //
  'twenty-goals': 'thirty-goals', //
  'thirty-goals': 'forty-goals', //
  'forty-goals': 'fifty-goals', //
  'fifty-goals': '', //
  'all-time-scorer': '', //all-time-scorer
  '3-matches': '5-matches', //rivalry
  '5-matches': '7-matches', //classic
  '7-matches': '10-matches', //
  '10-matches': '', //
  '3-wins': '5-wins', //dominator
  '5-wins': '7-wins', //nemesis
  '7-wins': '10-wins', //
  '10-wins': '', //
  '3-loses': '5-loses', //underdog
  '5-loses': '7-loses', //prey
  '7-loses': '10-loses', //
  '10-loses': '', //
  '3-goal-difference': '5-goal-difference', //goal-difference
  '5-goal-difference': '7-goal-difference', //
  '7-goal-difference': '10-goal-difference', //
  '10-goal-difference': '', //
  'biggest-win': '', //biggest-win
  'biggest-loss': '', //biggest-loss
  'no-win': '', //winless
  'no-loss': '', //lossless
  '3-win-streak': '5-win-streak', //longest-win-streak
  '5-win-streak': '7-win-streak', //
  '7-win-streak': '10-win-streak', //
  '10-win-streak': '', //
  'longest-win-streak': '', //longest-win-streak
  '3-unbeaten-streak': '5-unbeaten-streak', //longest-unbeaten-streak
  '5-unbeaten-streak': '7-unbeaten-streak', //
  '7-unbeaten-streak': '10-unbeaten-streak', //
  '10-unbeaten-streak': '', //
  'longest-unbeaten-streak': '', //longest-unbeaten-streak
  '3-loss-streak': '5-loss-streak', //longest-loss-streak
  '5-loss-streak': '7-loss-streak', //
  '7-loss-streak': '10-loss-streak', //
  '10-loss-streak': '', //
  'longest-loss-streak': '', //longest-loss-streak
  '3-eliminations': '', //
};

export const dynamicDefs = [
  ...tournamentAchievements,
  ...awardAchievements,
  ...streakAchievements,
  ...rivalryAchievements,
  ...specialAchievements,
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

  // 1) Dynamic
  const dynamic = dynamicDefs
    .map(def => def.evaluate(matches, tournaments, member, members))
    .filter((a): a is Achievement => !!a);

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
    const superior = Object.entries(achievementHierarchy)
      .find(([lower, higher]) => lower === a.id && higher && achievedIds.has(higher));
    return !superior;
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
