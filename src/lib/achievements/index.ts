import { getAchievements, getMatches, getTournaments, getMembers } from '@lib/collections';
import { hierarchy } from './utils';
import type {
  Achievement,
  AchievementContext,
  AchievementDefinition,
  AchievementResult,
  Member,
} from './types';

/** Registro central de definiciones (dinámicas). */
const definitions: AchievementDefinition[] = [];

export function register(def: AchievementDefinition): void {
  definitions.push(def);
}

export const dynamicDefs = definitions;

/** Logros por miembro, cacheados por nombre. Se invalida con clearAchievementsCache(). */
let memberAchievementsCache: Map<string, Achievement[]> | null = null;

export function clearAchievementsCache(): void {
  memberAchievementsCache = null;
}

/** Construye el contexto compartido de todas las evaluaciones. */
async function buildContext(): Promise<AchievementContext> {
  const [matches, tournaments, members, achievements] = await Promise.all([
    getMatches(),
    getTournaments(),
    getMembers(),
    getAchievements(),
  ]);
  return { matches, tournaments, members, achievements };
}

/** Evalúa una definición soportando evaluadores async. */
async function safeEvaluate(
  def: AchievementDefinition,
  context: AchievementContext,
  member: Member,
): Promise<AchievementResult | null> {
  return def.evaluate({ ...context, member });
}

/** Fusión definición + resultado: la UI consume el logro final. */
function merge(def: AchievementDefinition, result: AchievementResult): Achievement {
  const { evaluate, ...base } = def;
  return { ...base, ...result };
}

/** Identifica IDs únicos otorgados a más de un miembro (dinámicos). */
export async function findDuplicatedUniqueIds(context: AchievementContext): Promise<Set<string>> {
  const counts = new Map<string, number>();
  for (const member of context.members) {
    for (const def of definitions.filter(d => d.enabled)) {
      const result = await safeEvaluate(def, context, member);
      if (result?.achieved && def.unique) {
        counts.set(result.id, (counts.get(result.id) ?? 0) + 1);
      }
    }
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([id]) => id));
}

function applySuppressions(achievements: Achievement[]): Achievement[] {
  const suppressedIds = new Set<string>();
  for (const ach of achievements) {
    ach.suppresses?.forEach(id => suppressedIds.add(id));
  }
  return achievements.filter(ach => !suppressedIds.has(ach.id));
}

/** Logros obtenidos por el miembro, con jerarquías y supresiones aplicadas. */
export async function evaluateAchievements(
  member: Member,
  context: AchievementContext,
): Promise<Achievement[]> {
  const duplicatedUniques = await findDuplicatedUniqueIds(context);

  const enabledDefs = definitions.filter(d => d.enabled);
  const dynamic = (
    await Promise.all(enabledDefs.map(def => safeEvaluate(def, context, member)))
  )
    .map((result, i) => ({ def: enabledDefs[i], result }))
    .filter(({ result }) => !!result?.achieved)
    .filter(({ def, result }) => !(def.unique && duplicatedUniques.has(result!.id)))
    .map(({ def, result }) => merge(def, result!));

  const manualIds: string[] = member.data.manualAchievements || [];
  const manual = context.achievements
    .filter(a => manualIds.includes(a.data.id))
    .map(a => ({
      id:          a.data.id,
      achieved:    true,
      name:        a.data.name,
      icon:        a.data.icon,
      description: a.data.description,
      rarity:      a.data.rarity,
      category:    a.data.category,
      subcategory: a.data.subcategory,
      alignment:   a.data.alignment,
      unique:      a.data.unique,
      visible:     a.data.visible,
      enabled:     a.data.enabled,
      stars:       a.data.stars,
    }));

  let all = [...manual, ...dynamic];
  all = applySuppressions(all);

  const achievedIds = new Set(all.map(a => a.id));
  all = all.filter(a => {
    const superior = Object.entries(hierarchy)
      .find(([lower, higher]) => lower === a.id && higher && achievedIds.has(higher));
    return !superior && a.enabled;
  });

  all.sort((a, b) => {
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    if (a.stars !== b.stars) return (a.stars ?? 0) - (b.stars ?? 0);
    return a.name.localeCompare(b.name);
  });
  return all;
}

/** API pública por nombre (usada por las páginas). */
export async function getAchievementsForMember(name: string): Promise<Achievement[]> {
  if (memberAchievementsCache?.has(name)) {
    return memberAchievementsCache.get(name)!;
  }

  const context = await buildContext();
  const member = context.members.find(m => m.data.name === name);
  if (!member) return [];

  const achievements = await evaluateAchievements(member, context);
  memberAchievementsCache = new Map(memberAchievementsCache ?? []);
  memberAchievementsCache.set(name, achievements);
  return achievements;
}

/** Consulta inversa: miembros que tienen el logro (dinámico o manual). */
export async function getMembersWithAchievement(achievementId: string): Promise<Member[]> {
  const context = await buildContext();
  const result: Member[] = [];
  for (const member of context.members) {
    const dyn = (
      await Promise.all(definitions.map(def => safeEvaluate(def, context, member)))
    ).some(r => r?.achieved && r.id === achievementId);
    const manualIds: string[] = member.data.manualAchievements || [];
    const man = context.achievements.some(a => manualIds.includes(a.data.id) && a.data.id === achievementId);
    if (dyn || man) {
      result.push(member);
    }
  }
  return result;
}
