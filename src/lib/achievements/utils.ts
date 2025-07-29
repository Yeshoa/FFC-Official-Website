import StarIcon from '@images/icons/star-solid.svg';
import SkullIcon from '@images/icons/skull-crossbones-solid.svg';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export const CATEGORIES = [
  'Basic',
  'Tournament',
  'Streaks',
  'Rivalry',
  'Special',
  'Community',
  'Ranking'
] as const;
export const SUBCATEGORIES = [
  'Basic', // 0
  'Participation',
  'Champion Times', // 1
  'Champion Tiers', // 2
  'Prizes', // 3
  'Win Streaks', // 4
  'Unbeaten Streaks', // 5
  'Winless Streaks', // 6
  'Loss Streaks', // 7
  'Scoreless Streaks', // 8
  'Goals', // 9
  'Cards', // 10
  'Head-to-Head Played', // 11
  'Head-to-Head Won', // 12
  'Head-to-Head Lost', // 13
  'Head-to-Head Goal Difference', // 14
  'Head-to-Head Eliminations', 
  'Reached Tier', 
  'Beaten Higher Tier',
  'Sponsors',
] as const;


// minor : major
export const hierarchy: Record<string, string> = {
  // Tournament
  'host': '',
  'veteran': '',
  'champion': 'double-champion',
  'double-champion': 'triple-champion',
  'triple-champion': '',
  'unbeaten-champion': 'perfect-champion',
  'perfect-champion': 'ultimate-champion',
  'ultimate-champion': '', 
  'prize-winner-1': 'prize-winner-2',
  'prize-winner-2': 'prize-winner-3', 
  'prize-winner-3': 'prize-winner-4', 
  'prize-winner-4': '', 
  // Streaks
  '3-win-streak': '5-win-streak', //
  '5-win-streak': '7-win-streak', //
  '7-win-streak': '10-win-streak', //
  '10-win-streak': 'longest-win-streak', //
  'longest-win-streak': '', //
  '7-unbeaten-streak': '10-unbeaten-streak', //
  '10-unbeaten-streak': '15-unbeaten-streak', //
  '15-unbeaten-streak': '20-unbeaten-streak', //
  '20-unbeaten-streak': 'longest-unbeaten-streak', //
  'longest-unbeaten-streak': '', //
  '7-no-win': '10-no-win', //
  '10-no-win': '15-no-win', //
  '15-no-win': '20-no-win', //
  '20-no-win': 'longest-winless-streak', //
  'longest-winless-streak': '', //
  '3-loss-streak': '5-loss-streak', //
  '5-loss-streak': '7-loss-streak', //
  '7-loss-streak': '10-loss-streak', //
  '10-loss-streak': '15-loss-streak', //
  '15-loss-streak': 'longest-loss-streak', //
  'longest-loss-streak': '', //
  '5-scoreless-streak': '7-scoreless-streak', //
  '7-scoreless-streak': '10-scoreless-streak', //
  '10-scoreless-streak': '15-scoreless-streak', //
  '15-scoreless-streak': '20-scoreless-streak', //
  '20-scoreless-streak': 'longest-scoreless-streak', //
  'longest-scoreless-streak': '', //
  '10-goals': '20-goals', //
  '20-goals': '30-goals', //
  '30-goals': '40-goals', //
  '40-goals': '50-goals', //
  '50-goals': '75-goals', //
  '75-goals': '100-goals', //, 
  '100-goals': 'all-time-scorer', //
  'all-time-scorer': '', //
  'most-red-cards': '', //
  // Rivalry
  '3-matches': '5-matches', //rivalry
  '5-matches': '7-matches', //classic
  '7-matches': '10-matches', //
  '10-matches': '15-matches', //
  '15-matches': '', //
  '3-wins': '5-wins', //dominator
  '5-wins': '7-wins', //nemesis
  '7-wins': '10-wins', //
  '10-wins': '15-wins', //
  '15-wins': '', //
  '3-losses': '5-losses', //underdog
  '5-losses': '7-losses', //prey
  '7-losses': '10-losses', //
  '10-losses': '15-losses', //
  '15-losses': '', //
  '3-goal-difference': '5-goal-difference', //goal-difference
  '5-goal-difference': '6-goal-difference', //
  '6-goal-difference': '7-goal-difference', //
  '7-goal-difference': '8-goal-difference', //
  '8-goal-difference': '9-goal-difference', //
  '9-goal-difference': '10-goal-difference', //
  '10-goal-difference': 'biggest-win', //
  'biggest-win': '', //biggest-win
  // 'biggest-loss': '', //biggest-loss
  '3-eliminations': '5-eliminations', //
  '5-eliminations': '7-eliminations', //
  '7-eliminations': '10-eliminations', //
  '10-eliminations': '', //
  // Ranking
  'beat-tier-s': 'beat-tier-ss', //
  'beat-tier-ss': 'beat-tier-x', //
  'beat-tier-x': '', //
  'reached-tier-s': 'reached-tier-ss', //
  'reached-tier-ss': 'reached-tier-x', //
  'reached-tier-x': '', //
  '1-sponsor': '3-sponsor', //
  '3-sponsor': '5-sponsor', //
  '5-sponsor': '7-sponsor', //
  '7-sponsor': '10-sponsor', //
  '10-sponsor': '15-sponsor', //
  '15-sponsor': '20-sponsor', //
  '20-sponsor': '', //
  // '5-eliminations': '', //
};

export const tiers = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'X'] as const;

export type Category = typeof CATEGORIES[number];

export type Subcategory = typeof SUBCATEGORIES[number];

export type Alignment = typeof ALIGNMENTS[number];

type IconComponent = AstroComponentFactory;

export const ALIGNMENTS = [
  'Neutral',
  'Evil',
  'Negative',
  'Easter Egg',
  'Special',
] as const;
const rarityNamesByAlignment: Record<Alignment, Record<number, string>> = {
  Neutral: {
    0: 'Common',
    1: 'Uncommon',
    2: 'Rare',
    3: 'Ultra Rare',
    4: 'Epic',
    5: 'Legendary',
    6: 'Ultimate',
  },
  Evil: {
    1: 'Tainted',
    2: 'Corrupted',
    3: 'Cursed',
    4: 'Doomed',
    5: 'Ravage',
    6: 'Infernal',
  },
  'Easter Egg': {
    0: 'Hidden',
    1: 'Secret',
    2: 'Arcane',
  },
  Negative: {
    1: 'Unlucky',
    2: 'Jinxed',
    3: 'Haunted',
  },
  Special: {
    0: 'Special',
    1: 'Mythic',
  },
};

interface RarityStyle {
  label: string;
  color: string;
  fullColor: string;
  border: string;
  text: string;
  name: string;
  shadow: string;
  glow: string;
  sparkle: string;
  icons: {
    component: IconComponent;
    color: string;
  };
  animationComponent?: string;
}


const rarityStylesByAlignment: Record<Alignment, Record<number, RarityStyle>> = {
  Neutral: {
    0: { label: rarityNamesByAlignment.Neutral[0], color: 'bg-slate-500', fullColor: 'via-slate-500 text-slate-300', border: 'border-gray-400', text: 'text-slate-200', name: 'text-slate-200 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-slate-400/60', glow: 'group-hover:shadow-slate-400/80', sparkle: 'bg-slate-400/20', icons: { component: StarIcon, color: 'fill-slate-300' }, },
    1: { label: rarityNamesByAlignment.Neutral[1], color: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700', fullColor: 'via-emerald-600 text-slate-200', border: 'border-emerald-400', text: 'text-emerald-100', name: 'text-emerald-100 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-emerald-400/60', glow: 'group-hover:shadow-emerald-400/80', sparkle: 'bg-emerald-400/20', icons: { component: StarIcon, color: 'fill-slate-200' }, },
    2: { label: rarityNamesByAlignment.Neutral[2], color: 'bg-gradient-to-br from-blue-500 via-sky-400 to-blue-600', fullColor: 'via-sky-400 text-yellow-400', border: 'border-sky-400', text: 'text-sky-100', name: 'text-sky-100 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-sky-400/60', glow: 'group-hover:shadow-sky-400/80', sparkle: 'bg-sky-400/20', icons: { component: StarIcon /* 2 */, color: 'fill-yellow-400' }, animationComponent: 'Rare', },
    3: { label: rarityNamesByAlignment.Neutral[3], color: 'bg-gradient-to-br from-sky-500 via-violet-600 to-fuchsia-600', fullColor: 'via-violet-600 text-sky-300', border: 'border-violet-400', text: 'text-cyan-300', name: 'text-violet-100 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-violet-400/60', glow: 'group-hover:shadow-violet-400/80', sparkle: 'bg-violet-400', icons: { component: StarIcon/* 3 */, color: 'fill-sky-300' }, animationComponent: 'UltraRare', },
    4: { label: rarityNamesByAlignment.Neutral[4], color: 'bg-gradient-to-br from-red-950 via-red-700 from-20% via-65% to-amber-600', fullColor: 'via-red-900 text-amber-300', border: 'border-amber-300', text: 'text-amber-200', name: 'text-amber-200 font-black text-shadow-xs text-shadow-amber-400', shadow: 'shadow-red-500/60', glow: 'group-hover:shadow-red-600/80', sparkle: 'bg-amber-300', icons: { component: StarIcon /* 4 */, color: 'fill-yellow-300' }, animationComponent: 'Epic', },
    5: { label: rarityNamesByAlignment.Neutral[5], color: 'bg-gradient-to-bl from-yellow-600 via-amber-900 to-yellow-700', fullColor: 'via-amber-900 text-yellow-200', border: 'border-yellow-200', text: 'text-white', name: 'text-yellow-100 text-shadow-xs text-shadow-yellow-300', shadow: 'shadow-yellow-400/60', glow: 'group-hover:shadow-yellow-300/80', sparkle: 'bg-yellow-200', icons: { component: StarIcon /* 5 */, color: 'fill-yellow-200' }, animationComponent: 'Legendary', },
    6: { label: rarityNamesByAlignment.Neutral[6], color: 'bg-gradient-to-t from-blue-900 via-purple-950 to-black', fullColor: 'via-purple-950 text-yellow-300', border: 'border-cyan-300', text: 'text-cyan-200', name: 'text-white text-shadow-md text-shadow-cyan-300', shadow: 'shadow-purple-600/50', glow: 'group-hover:shadow-cyan-500/70', sparkle: 'bg-white', icons: { component: StarIcon /* 6 */, color: 'fill-cyan-300' }, animationComponent: 'Ultimate', },
  },
  Evil: {
    1: { label: rarityNamesByAlignment.Evil[1], color: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950', fullColor: 'via-zinc-800 text-zinc-400', border: 'border-zinc-700', text: 'text-zinc-400', name: 'text-zinc-300 font-bold', shadow: 'shadow-zinc-800/50', glow: 'group-hover:shadow-zinc-700/60', sparkle: 'bg-zinc-500', icons: { component: SkullIcon, color: 'fill-zinc-400' }, },
    2: { label: rarityNamesByAlignment.Evil[2], color: 'bg-gradient-to-br from-red-900 via-red-900 to-red-950', fullColor: 'via-red-900 text-red-600', border: 'border-red-800', text: 'text-red-600', name: 'text-red-600 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-red-700/50', glow: 'group-hover:shadow-red-600/60', sparkle: 'bg-red-500', icons: { component: SkullIcon, color: 'fill-red-600' }, animationComponent: 'Toxic' },
    3: { label: rarityNamesByAlignment.Evil[3], color: 'bg-gradient-to-br from-gray-900 via-red-950 to-black', fullColor: 'via-red-950 text-red-500', border: 'border-red-900', text: 'text-red-700', name: 'text-red-700 font-bold', shadow: 'shadow-red-900/50', glow: 'group-hover:shadow-red-800/60', sparkle: 'bg-red-700', icons: { component: SkullIcon, color: 'fill-red-700' }, animationComponent: 'Curse', },
    4: { label: rarityNamesByAlignment.Evil[4], color: 'bg-gradient-to-br from-black via-gray-900 to-red-950', fullColor: 'via-orange-700 text-orange-300', border: 'border-orange-700', text: 'text-orange-500', name: 'text-orange-700 font-bold', shadow: 'shadow-gray-900/30', glow: 'group-hover:shadow-red-950/40', sparkle: 'bg-red-950', icons: { component: SkullIcon, color: 'fill-orange-700' }, animationComponent: 'Doom', },
    5: { label: rarityNamesByAlignment.Evil[5], color: 'bg-gradient-to-b from-black via-red-950 via-65% to-red-900', 
      fullColor: 'via-black text-red-500', border: 'border-black', text: 'text-red-600', 
      name: 'text-black font-bold', shadow: 'shadow-red-950/30', 
      glow: 'group-hover:shadow-orange-800/60', sparkle: 'bg-orange-600', 
      icons: { component: SkullIcon, color: 'fill-black' }, animationComponent: 'Ravage', },
    6: { 
      label: rarityNamesByAlignment.Evil[6], // Infernal
      color: 'bg-gradient-to-b from-red-950 via-orange-900 to-yellow-800', 
      fullColor: 'via-orange-900 text-yellow-400', 
      border: 'border-amber-600', 
      text: 'text-yellow-500', 
      name: 'text-black font-bold', 
      shadow: 'shadow-orange-900/50', 
      glow: 'group-hover:shadow-yellow-600/70', 
      sparkle: 'bg-yellow-400', 
      icons: { component: SkullIcon, color: 'fill-black' },
      animationComponent: 'Infernal',
    },
  },
  'Easter Egg': {
    1: { label: 'Mundane', color: 'bg-gradient-to-br from-lime-900 via-lime-900 to-lime-950', fullColor: 'via-lime-900 text-lime-600', border: 'border-lime-800', text: 'text-lime-600', name: 'text-lime-600 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-lime-700/50', glow: 'group-hover:shadow-lime-600/60', sparkle: 'bg-lime-500', animationComponent: 'Mundane', icons: { component: SkullIcon, color: 'fill-lime-600' }, },
    2: { label: 'Worn', color: 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900', fullColor: 'via-stone-700 text-stone-400', border: 'border-stone-600', text: 'text-stone-300', name: 'text-stone-400 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-stone-700/50', glow: 'group-hover:shadow-stone-600/60', sparkle: 'bg-stone-500', icons: { component: SkullIcon/* 2 */, color: 'fill-stone-400' }, },
    3: { label: 'Broken', color: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900', fullColor: 'via-gray-700 text-gray-400', border: 'border-gray-600', text: 'text-gray-300', name: 'text-gray-500 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-gray-700/50', glow: 'group-hover:shadow-gray-600/60', sparkle: 'bg-gray-500', icons: { component: SkullIcon, color: 'fill-gray-500' }, animationComponent: 'Broken', },
  },
  Negative: {
    1: { label: 'Mundane', color: 'bg-gradient-to-br from-lime-900 via-lime-900 to-lime-950', fullColor: 'via-lime-900 text-lime-600', border: 'border-lime-800', text: 'text-lime-600', name: 'text-lime-600 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-lime-700/50', glow: 'group-hover:shadow-lime-600/60', sparkle: 'bg-lime-500', animationComponent: 'Mundane', icons: { component: SkullIcon, color: 'fill-lime-600' }, },
    2: { label: 'Worn', color: 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900', fullColor: 'via-stone-700 text-stone-400', border: 'border-stone-600', text: 'text-stone-300', name: 'text-stone-400 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-stone-700/50', glow: 'group-hover:shadow-stone-600/60', sparkle: 'bg-stone-500', icons: { component: SkullIcon/* 2 */, color: 'fill-stone-400' }, },
    3: { label: 'Broken', color: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900', fullColor: 'via-gray-700 text-gray-400', border: 'border-gray-600', text: 'text-gray-300', name: 'text-gray-500 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-gray-700/50', glow: 'group-hover:shadow-gray-600/60', sparkle: 'bg-gray-500', icons: { component: SkullIcon, color: 'fill-gray-500' }, animationComponent: 'Broken', },
  },
  Special: {
    1: { label: 'Mundane', color: 'bg-gradient-to-br from-lime-900 via-lime-900 to-lime-950', fullColor: 'via-lime-900 text-lime-600', border: 'border-lime-800', text: 'text-lime-600', name: 'text-lime-600 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-lime-700/50', glow: 'group-hover:shadow-lime-600/60', sparkle: 'bg-lime-500', animationComponent: 'Mundane', icons: { component: SkullIcon, color: 'fill-lime-600' }, },
    2: { label: 'Worn', color: 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900', fullColor: 'via-stone-700 text-stone-400', border: 'border-stone-600', text: 'text-stone-300', name: 'text-stone-400 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-stone-700/50', glow: 'group-hover:shadow-stone-600/60', sparkle: 'bg-stone-500', icons: { component: SkullIcon/* 2 */, color: 'fill-stone-400' }, },
    3: { label: 'Broken', color: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900', fullColor: 'via-gray-700 text-gray-400', border: 'border-gray-600', text: 'text-gray-300', name: 'text-gray-500 font-bold text-shadow-xs text-shadow-black', shadow: 'shadow-gray-700/50', glow: 'group-hover:shadow-gray-600/60', sparkle: 'bg-gray-500', icons: { component: SkullIcon, color: 'fill-gray-500' }, animationComponent: 'Broken', },
  },
};

export function getRarityName(level: number, alignment: Alignment): string {
  const names = rarityNamesByAlignment[alignment];
  return names[level] ?? rarityNamesByAlignment.Neutral[0];
}

/** Devuelve el estilo de la rareza según level + alignment */
export function getRarityStyle(level: number, alignment: Alignment): RarityStyle {
  const styles = rarityStylesByAlignment[alignment];
  return styles[level] ?? rarityStylesByAlignment.Neutral[0];
}
