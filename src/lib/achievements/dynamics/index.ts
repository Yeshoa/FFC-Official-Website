import { tournamentAchievements } from './tournament';
// import { awardAchievements } from './awards';
import { streakAchievements } from './streaks';
import { rivalryAchievements } from './rivalry';
// import { specialAchievements } from './special';
import { rankingAchievements } from './ranking';
import { communityAchievements } from './community';
import { register } from '../index';
import type { AchievementDefinition } from '../types';

const dynamicAchievements: AchievementDefinition[] = [
  ...tournamentAchievements,
  // ...awardAchievements,
  ...streakAchievements,
  ...rivalryAchievements,
  // ...specialAchievements,
  ...rankingAchievements,
  ...communityAchievements,
];

for (const def of dynamicAchievements) {
  register(def);
}

export {
  getAchievementsForMember,
  getMemberAchievementsDetailed,
  getMembersWithAchievement,
  findDuplicatedUniqueIds,
  clearAchievementsCache,
  dynamicDefs,
} from '../index';

export type {
  Achievement,
  AchievementResult,
  AchievementContext,
  AchievementDefinition,
  AchievementEvaluate,
  MemberAchievementsDetail,
} from '../types';

export { CATEGORIES, SUBCATEGORIES, ALIGNMENTS, hierarchy } from '../utils';
