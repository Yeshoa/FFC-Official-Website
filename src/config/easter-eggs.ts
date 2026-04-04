import type { ImageMetadata } from 'astro';
import eggLum from '@images/eggs/egg-lum.webp';
import eggJut from '@images/eggs/egg-jut.webp';
import eggCTC from '@images/eggs/egg-ctc.webp';
import eggBil from '@images/eggs/egg-bil.webp';
import eggRui from '@images/eggs/egg-rui.webp';

export type EasterEggId = 'egg-1' | 'egg-2' | 'egg-3' | 'egg-4' | 'egg-5';

export interface EasterEggConfig {
  id: EasterEggId;
  title: string;
  secretCode: string;
  image: ImageMetadata;
}

export const EASTER_EGGS: Record<EasterEggId, EasterEggConfig> = {
  'egg-1': {
    id: 'egg-1',
    title: 'Lumiose',
    secretCode: 'EASYONEHUH',
    image: eggLum,
  },
  'egg-2': {
    id: 'egg-2',
    title: 'Jutsa',
    secretCode: 'WHOINVITEDMYFRIEND?',
    image: eggJut,
  },
  'egg-3': {
    id: 'egg-3',
    title: 'Clown Town City',
    secretCode: 'HONKYTONKY',
    image: eggCTC,
  },
  'egg-4': {
    id: 'egg-4',
    title: 'Bilsa',
    secretCode: 'SAYTANKSNOTHANKS',
    image: eggBil,
  },
  'egg-5': {
    id: 'egg-5',
    title: 'Ruinenlust',
    secretCode: 'EVILDICTATORSHIP',
    image: eggRui,
  },
};
