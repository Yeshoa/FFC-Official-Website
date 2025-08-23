import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';
import { getAllGoals, getAllMatchesByTeam, 
  getAllRedCards, getLossStreak, getMatchWinner,
   getNoGoalStreak, getNoWinStreak, getUnbeatenStreak, 
   getWinStreak, getMatchGoals } from 'src/utils/matchUtils';
import { type Category, CATEGORIES, type Subcategory, ALIGNMENTS, type Alignment } from '../utils';

const thisCategory = CATEGORIES[2];

// Función para contar cuántas veces se logró una racha de victorias
const countWinStreaks = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let streakCount = 0;
  let currentStreak = 0;
  for (const match of memberMatches) {
    if (getMatchWinner(match.data) === memberName) {
      currentStreak++;
    } else {
      if (currentStreak >= threshold) {
        streakCount++;
      }
      currentStreak = 0;
    }
  }
  
  if (currentStreak >= threshold) {
    streakCount++;
  }
  
  return streakCount;
};

// Función para contar cuántas veces se logró una racha de derrotas
const countLossStreaks = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const match of memberMatches) {
    if (getMatchWinner(match.data) !== memberName && getMatchWinner(match.data) !== null) {
      currentStreak++;
    } else {
      if (currentStreak >= threshold) {
        streakCount++;
      }
      currentStreak = 0;
    }
  }
  
  if (currentStreak >= threshold) {
    streakCount++;
  }
  
  return streakCount;
};

// Función para contar cuántas veces se logró una racha invicta
const countUnbeatenStreaks = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const match of memberMatches) {
    if (getMatchWinner(match.data) !== memberName && getMatchWinner(match.data) !== null) {
      if (currentStreak >= threshold) {
        streakCount++;
      }
      currentStreak = 0;
    } else {
      currentStreak++;
    }
  }
  
  if (currentStreak >= threshold) {
    streakCount++;
  }
  
  return streakCount;
};

// Función para contar cuántas veces se logró una racha sin marcar goles
const countNoGoalStreaks = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let streakCount = 0;
  let currentStreak = 0;
  for (const match of memberMatches) {
    const { gf } = getMatchGoals(match, memberName);
    if (gf === 0) {
      currentStreak++;
    } else {
      if (currentStreak >= threshold) {
        streakCount++;
      }
      currentStreak = 0;
    }
  }
  
  if (currentStreak >= threshold) {
    streakCount++;
  }
  
  return streakCount;
};

// Función para contar cuántas veces se logró una racha sin ganar
const countNoWinStreaks = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const match of memberMatches) {
    if (getMatchWinner(match.data) !== memberName) {
      currentStreak++;
    } else {
      if (currentStreak >= threshold) {
        streakCount++;
      }
      currentStreak = 0;
    }
  }
  
  if (currentStreak >= threshold) {
    streakCount++;
  }
  
  return streakCount;
};

// Función para contar cuántos partidos tuvo X+ goles
/* const countHighScoringMatches = (memberName, matches, tournaments, members, threshold) => {
  const memberMatches = getAllMatchesByTeam(memberName, matches);
  let count = 0;
  
  for (const match of memberMatches) {
    const goals = (match.data.team1 === memberName ? match.data.score1 : match.data.score2) || 0;
    if (goals >= threshold) {
      count++;
    }
  }
  
  return count;
}; */

// Función para contar cuántas veces se recibieron X+ tarjetas rojas
/* const countRedCards = (memberName, matches, tournaments, members, threshold) => {
  const totalRedCards = getAllRedCards(memberName, matches, tournaments, members);
  return Math.floor(totalRedCards / threshold); // Conteo basado en grupos de tarjetas
}; */

// Función utilitaria para achievements de estadísticas/streaks
function createStatAchievement(
  id,
  name,
  icon,
  description,
  subcategory,
  alignment,
  rarity,
  threshold,
  statFunction,
  options = {}
) {
  const {
    descriptionTemplate = "${threshold}+",
    verb = "achieved",
    category = thisCategory,
    visible = true,
    unique = false,
    enabled = true,
    comparator = ">=",
    countFunction = null,
    stars = 1, // Estrellas opcionales
  } = options;

  return {
    id,
    name,
    icon,
    description,
    rarity,
    category,
    subcategory,
    alignment,
    unique,
    visible,
    enabled,
    stars,
    evaluate: function (matches, tournaments, member, members) {
      const { evaluate, ...base } = this;
      const currentValue = statFunction(member.data.name, matches, tournaments, members);
      
      let meetsThreshold = false;
      switch (comparator) {
        case ">=": meetsThreshold = currentValue >= threshold; break;
        case ">": meetsThreshold = currentValue > threshold; break;
        case "<=": meetsThreshold = currentValue <= threshold; break;
        case "<": meetsThreshold = currentValue < threshold; break;
        case "===": meetsThreshold = currentValue === threshold; break;
      }
      
      if (!meetsThreshold) return null;
      
      let newDescription = descriptionTemplate;
      newDescription = newDescription.replace("${threshold}", threshold);
      newDescription = newDescription.replace("${value}", currentValue);
      newDescription = newDescription.replace("${verb}", verb);
      let newStars = stars;
      if (newStars === 1 && countFunction) {
        newStars = countFunction(member.data.name, matches, tournaments, members, threshold);
      }
      
      return {
        ...base,
        stars: newStars,
        description: newDescription
      };
    }
  };
}

// Función específica para achievements "max"
function createMaxStatAchievement(
  id,
  name,
  icon,
  description,
  subcategory,
  alignment,
  rarity,
  statFunction,
  achievementsList,
  options = {}
) {
  const {
    descriptionTemplate = "${verb} ${value}.",
    verb = "achieved",
    category = thisCategory,
    visible = false,
    unique = true,
    enabled = true,
    starDivisor = 1,
    stars = 1,
  } = options;

  return {
    id,
    name,
    icon,
    description,
    rarity,
    category,
    subcategory,
    alignment,
    unique,
    visible,
    enabled,
    stars,
    evaluate: function (matches, tournaments, member, members) {
      const { evaluate, ...base } = this;
      
      const stats = members.map(m => ({
        name: m.data.name,
        value: statFunction(m.data.name, matches, tournaments, members)
      }));

      const max = Math.max(...stats.map(s => s.value));
      const current = statFunction(member.data.name, matches, tournaments, members);

      if (current !== max) return null;

      let newDescription = descriptionTemplate;
      newDescription = newDescription.replace("${value}", max);
      newDescription = newDescription.replace("${verb}", verb);

      // Si no hay achievementsList o no es iterable, usar valores por defecto
      if (!achievementsList || !Array.isArray(achievementsList)) {
        return {
          ...base,
          description: newDescription,
          stars: max,
          suppresses: [] // Sin supresión si no hay lista válida
        };
      }

      // Asegurar que los logros tengan el formato correcto
      const formattedAchievements = achievementsList.map(ach => ({
        id: ach.id,
        name: ach.name,
        rarity: ach.rarity,
        threshold: parseInt(ach.id.split('-')[0], 10) || ach.threshold // Extraer umbral del id o usar threshold
      }));
      const maxThreshold = Math.max(...formattedAchievements.map(ach => ach.threshold));
      // Encontrar el logro correspondiente al valor máximo y los suprimidos
      let selectedAchievement = null;
      let suppresses = [];
      let newName = this.name;
      if (max <= maxThreshold) {
        for (const ach of formattedAchievements) {
          if (max >= ach.threshold) {
            selectedAchievement = ach;
            suppresses.push(ach.id);
          } else {
            newName = ach.name; // Usar el nombre del logro siguiente
            break;
          }
        }
      }
      // for (const ach of formattedAchievements) {
      //   if (max >= ach.threshold) {
      //     selectedAchievement = ach;
      //     suppresses.push(ach.id);
      //   } else {
      //     break; // Lista ordenada, si no se alcanza el umbral, se detiene
      //   }
      // }

      // Si no se alcanza ningún umbral, no se otorga logro
      if (!selectedAchievement) return null;
      const newRarity = selectedAchievement.rarity + 1;
      let newStars = current 
      if(starDivisor > 0) newStars = Math.floor(current/starDivisor);
      return {
        ...base,
        name: newName,
        rarity: newRarity,
        description: newDescription,
        stars: newStars, // Estrellas basadas en el valor máximo
        suppresses: suppresses 
      };
    }
  };
}

// 1. Goals achievements
const createGoalsAchievement = (id, name, icon, description, subcategory, alignment, rarity, minGoals, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minGoals, getAllGoals, {
    descriptionTemplate: "Scored ${threshold}+ goals.",
    // countFunction: countHighScoringMatches,
    stars
  });

// 2. Win streak achievements
const createWinStreakAchievement = (id, name, icon, description, subcategory, alignment, rarity, minWins, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minWins, getWinStreak, {
    descriptionTemplate: "Won ${threshold}+ matches in a row.",
    countFunction: countWinStreaks,
    stars
  });

// 3. Loss streak achievements
const createLossStreakAchievement = (id, name, icon, description, subcategory, alignment, rarity, minLosses, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minLosses, getLossStreak, {
    descriptionTemplate: "Lost ${threshold}+ matches in a row.",
    countFunction: countLossStreaks,
    stars
  });

// 4. Unbeaten streak achievements
const createUnbeatenStreakAchievement = (id, name, icon, description, subcategory, alignment, rarity, minMatches, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minMatches, getUnbeatenStreak, {
    descriptionTemplate: "Stayed unbeaten for ${threshold}+ matches in a row.",
    countFunction: countUnbeatenStreaks,
    stars
  });

// 5. Scoreless streak achievements
const createScorelessStreakAchievement = (id, name, icon, description, subcategory, alignment, rarity, minMatches, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minMatches, getNoGoalStreak, {
    descriptionTemplate: "Scoreless in ${threshold}+ matches.",
    countFunction: countNoGoalStreaks,
    stars
  });

// 6. No win achievements
const createNoWinAchievement = (id, name, icon, description, subcategory, alignment, rarity, minMatches, stars = 1) =>
  createStatAchievement(id, name, icon, description, subcategory, alignment, rarity, minMatches, 
    (memberName, matches) => {
      const played = getAllMatchesByTeam(memberName, matches);
      const wins = played.filter(m => getMatchWinner(m.data) === memberName);
      return wins.length === 0 ? played.length : 0;
    }, {
      descriptionTemplate: "Never won in ${threshold}+ matches.",
      countFunction: countNoWinStreaks,
      stars
    });
    
    const winStreakAchievements = [
      createWinStreakAchievement('3-win-streak', 'Heated', Trophy, 'Won 3 matches in a row.', 'Win Streaks', ALIGNMENTS[0], 1, 3),
      createWinStreakAchievement('5-win-streak', '5-Win Streak', Trophy, 'Won 5 matches in a row.', 'Win Streaks', ALIGNMENTS[0], 2, 5),
      createWinStreakAchievement('7-win-streak', '7-Win Streak', Trophy, 'Won 7 matches in a row.', 'Win Streaks', ALIGNMENTS[0], 3, 7),
      createWinStreakAchievement('10-win-streak', 'Rampant', Trophy, 'Won 10 matches in a row.', 'Win Streaks', ALIGNMENTS[0], 4, 10),
    ];
    
    const unbeatenStreakAchievements = [
  createUnbeatenStreakAchievement('7-unbeaten-streak', '7-Unbeaten Streak', Trophy, 'Stayed unbeaten for 7+ matches in a row.', 'Unbeaten Streaks', ALIGNMENTS[0], 1, 7),
  createUnbeatenStreakAchievement('10-unbeaten-streak', '10-Unbeaten Streak', Trophy, 'Stayed unbeaten for 10+ matches in a row.', 'Unbeaten Streaks', ALIGNMENTS[0], 2, 10),
  createUnbeatenStreakAchievement('15-unbeaten-streak', '15-Unbeaten Streak', Trophy, 'Stayed unbeaten for 15+ matches in a row.', 'Unbeaten Streaks', ALIGNMENTS[0], 3, 15),
  createUnbeatenStreakAchievement('20-unbeaten-streak', 'Machine', Trophy, 'Stayed unbeaten for 20+ matches in a row.', 'Unbeaten Streaks', ALIGNMENTS[0], 4, 20),
];

const noWinStreakAchievements = [
  createNoWinAchievement('7-no-win', 'Winless', Trophy, 'Played +7 matches without winning.', 'Winless Streaks', ALIGNMENTS[1], 2, 7),
  createNoWinAchievement('10-no-win', 'Jinxed', Trophy, 'Played +10 matches without winning.', 'Winless Streaks', ALIGNMENTS[1], 3, 10),
  createNoWinAchievement('15-no-win', '15-Winless', Trophy, 'Played +15 matches without winning.', 'Winless Streaks', ALIGNMENTS[1], 4, 15),
  createNoWinAchievement('20-no-win', '20-Winless', Trophy, 'Played +20 matches without winning.', 'Winless Streaks', ALIGNMENTS[1], 5, 20),
];

const lossStreakAchievements = [
  createLossStreakAchievement('3-loss-streak', '3-Loss Streak', Trophy, 'Lost 3+ matches in a row.', 'Loss Streaks', ALIGNMENTS[1], 1, 3),
  createLossStreakAchievement('5-loss-streak', '5-Loss Streak', Trophy, 'Lost 5+ matches in a row.', 'Loss Streaks', ALIGNMENTS[1], 2, 5),
  createLossStreakAchievement('7-loss-streak', '7-Loss Streak', Trophy, 'Lost 7+ matches in a row.', 'Loss Streaks', ALIGNMENTS[1], 3, 7),
  createLossStreakAchievement('10-loss-streak', '10-Loss Streak', Trophy, 'Lost 10+ matches in a row.', 'Loss Streaks', ALIGNMENTS[1], 4, 10),
  createLossStreakAchievement('15-loss-streak', '15-Loss Streak', Trophy, 'Lost 15+ matches in a row.', 'Loss Streaks', ALIGNMENTS[1], 5, 15),
];

const scorelessStreakAchievements = [
  createScorelessStreakAchievement('5-scoreless-streak', '5-Scoreless Streak', Trophy, 'Scoreless in 5+ matches.', 'Scoreless Streaks', ALIGNMENTS[1], 1, 5),
  createScorelessStreakAchievement('7-scoreless-streak', '7-Scoreless Streak', Trophy, 'Scoreless in 7+ matches.', 'Scoreless Streaks', ALIGNMENTS[1], 2, 7),
  createScorelessStreakAchievement('10-scoreless-streak', '10-Scoreless Streak', Trophy, 'Scoreless in 10+ matches.', 'Scoreless Streaks', ALIGNMENTS[1], 3, 10),
  createScorelessStreakAchievement('15-scoreless-streak', '15-Scoreless Streak', Trophy, 'Scoreless in 15+ matches.', 'Scoreless Streaks', ALIGNMENTS[1], 4, 15),
  createScorelessStreakAchievement('20-scoreless-streak', '20-Scoreless Streak', Trophy, 'Scoreless in 20+ matches.', 'Scoreless Streaks', ALIGNMENTS[1], 5, 20),
];

const goalsAchievements = [
  createGoalsAchievement('10-goals', 'Striker', Trophy, 'Scored 10+ goals.', 'Goals', ALIGNMENTS[0], 0, 10, 1),
  createGoalsAchievement('20-goals', 'Finisher', Trophy, 'Scored 20+ goals.', 'Goals', ALIGNMENTS[0], 1, 20, 2),
  createGoalsAchievement('30-goals', 'Sharpshooter', Trophy, 'Scored 30+ goals.', 'Goals', ALIGNMENTS[0], 2, 30, 3),
  createGoalsAchievement('40-goals', '40 Goals', Trophy, 'Scored 40+ goals.', 'Goals', ALIGNMENTS[0], 3, 40, 4),
  createGoalsAchievement('50-goals', 'Android', Trophy, 'Scored 50+ goals.', 'Goals', ALIGNMENTS[0], 4, 50, 5),
  createGoalsAchievement('75-goals', 'Juggernaut', Trophy, 'Scored 75+ goals.', 'Goals', ALIGNMENTS[0], 5, 75, 7),
  createGoalsAchievement('100-goals', 'All Star', Trophy, 'Scored 100+ goals.', 'Goals', ALIGNMENTS[0], 6, 100, 10), // Ejemplo con estrellas fijas
];

// 8. Max stat achievements
const createMaxWinStreakAchievement = () =>
  createMaxStatAchievement('longest-win-streak', 'Unstoppable', Trophy, 
    'Awarded for achieving the longest win streak among all members.', 'Win Streaks', ALIGNMENTS[0], 6, getWinStreak, 
    winStreakAchievements,
    {
    descriptionTemplate: "Longest win streak of ${value} matches.",
    }
  );

const createMaxUnbeatenStreakAchievement = () =>
  createMaxStatAchievement('longest-unbeaten-streak', 'Invincible', Trophy, 
    'Awarded for achieving the longest unbeaten streak among all members.', 'Unbeaten Streaks', ALIGNMENTS[0], 6, getUnbeatenStreak, 
    unbeatenStreakAchievements,
    {
    descriptionTemplate: "Longest unbeaten streak for ${value} matches in a row.",
  });

const createMaxLossStreakAchievement = () =>
  createMaxStatAchievement('longest-loss-streak', 'Hopeless', Trophy, 
    'Awarded for suffering the longest losing streak among all members.', 'Loss Streaks', ALIGNMENTS[1], 6, getLossStreak, 
    lossStreakAchievements,
    {
    descriptionTemplate: "Longest losing streak of ${value} matches in a row.",
  });

const createMaxScorelessStreakAchievement = () =>
  createMaxStatAchievement('longest-scoreless-streak', 'Scoreless', Trophy, 
    'Awarded for achieving the longest scoreless streak among all members.', 'Scoreless Streaks', ALIGNMENTS[1], 6, getNoGoalStreak, 
    scorelessStreakAchievements,
    {
    descriptionTemplate: "Longest scoreless streak of ${value} matches in a row.",
  });

const createMaxWinlessStreakAchievement = () =>
  createMaxStatAchievement('longest-winless-streak', 'Winless', Trophy, 
    'Awarded for achieving the longest winless streak among all members.', 'Winless Streaks', ALIGNMENTS[1], 6, getNoWinStreak, 
    noWinStreakAchievements,
    {
    descriptionTemplate: "Longest winless streak of ${value} matches in a row.",
  });

const createMaxRedCardsAchievement = () =>
  createMaxStatAchievement('most-red-cards', 'Red Imp', Trophy, 
    'Awarded for achieving the most red cards among all members.', 'Cards', ALIGNMENTS[1], 6, getAllRedCards, {
    descriptionTemplate: "Most red cards: ${value}."
  });

const createAllTimeScorerAchievement = () =>
  createMaxStatAchievement('all-time-scorer', 'All‑Time Scorer', Trophy, 
    'Awarded for being the top all-time scorer.', 'Goals', ALIGNMENTS[0], 6, getAllGoals, 
    goalsAchievements,
    {
      descriptionTemplate: "Has scored the most goals ever: ${value} goals.",
      visible: true,
      starDivisor: 10 // ESTO DIVIDE POR 10 LA CANTIDAD DE ESTRELLAS QUE HABRÍA NORMALMENTE
    }
);
  
const maxStreakAchievements = [
  createMaxWinStreakAchievement(),
  createMaxUnbeatenStreakAchievement(),
  createMaxLossStreakAchievement(),
  createMaxScorelessStreakAchievement(),
  createMaxWinlessStreakAchievement(),
  createMaxRedCardsAchievement(),
  createAllTimeScorerAchievement(),
];

export const streakAchievements = [
  ...maxStreakAchievements, 
  ...winStreakAchievements, 
  ...noWinStreakAchievements,
  ...unbeatenStreakAchievements,
  ...lossStreakAchievements,
  ...scorelessStreakAchievements,
  ...goalsAchievements
];