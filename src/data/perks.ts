// Perks FCL: habilidades de carta sin funcionalidad de simulador (solo display + precio).
// Cada perk tiene un SVG hexagonal propio (módulos FCL). Ver docs/FFC-Website/11-migracion-jugadores-pes.
export interface Perk {
  id: number;
  name: string;
  image: string; // SVG inline (hexágono + dibujito)
  description: string;
}

const HEX = 'M24 3 L42.19 13.5 L42.19 34.5 L24 45 L5.81 34.5 L5.81 13.5 Z';

const hex = (inner: string, stroke: string = '#95ff00'): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><path d="${HEX}" fill="#0b0b0f" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>${inner}</svg>`;

export const PERKS: Perk[] = [
  {
    id: 1,
    name: 'Penalty Specialist',
    image: hex('<circle cx="24" cy="24" r="8" fill="#95ff00"/><circle cx="24" cy="24" r="2" fill="#0b0b0f"/>'),
    description: 'Deadly from the spot.',
  },
  {
    id: 2,
    name: 'Free Kick Specialist',
    image: hex(
      '<circle cx="20" cy="28" r="7" fill="#95ff00"/><path d="M27 20 C31 15 32 13 37 10" stroke="#00ff95" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M37 10 L31 11 M37 10 L36.5 16" stroke="#00ff95" stroke-width="2" stroke-linecap="round"/>',
    ),
    description: 'Dangerous on set pieces.',
  },
  {
    id: 3,
    name: 'Long Throw',
    image: hex(
      '<path d="M15 33 L33 15" stroke="#95ff00" stroke-width="3" stroke-linecap="round"/><path d="M27 15 L33 15 L33 21" stroke="#95ff00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
    description: 'Can launch the ball deep into the box.',
  },
  {
    id: 4,
    name: 'Aerial Threat',
    image: hex(
      '<circle cx="24" cy="19" r="7" fill="#95ff00"/><path d="M24 30 L18 24 M24 30 L30 24 M24 30 L24 41" stroke="#00ff95" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
    description: 'Dominant in the air, wins headers.',
  },
  {
    id: 5,
    name: 'Playmaker',
    image: hex(
      '<path d="M16 33 L32 33 L24 16 Z" stroke="#95ff00" stroke-width="2" fill="none" stroke-linejoin="round"/><circle cx="24" cy="16" r="2.5" fill="#00ff95"/><circle cx="16" cy="33" r="2.5" fill="#95ff00"/><circle cx="32" cy="33" r="2.5" fill="#95ff00"/>',
    ),
    description: 'Dictates the tempo, unlocks defences.',
  },
  {
    id: 6,
    name: 'Speed Demon',
    image: hex(
      '<path d="M28 8 L16 27 H23 L20 40 L34 20 H26 Z" fill="#95ff00"/>',
    ),
    description: 'Blistering pace to burn.',
  },
  {
    id: 7,
    name: 'Captain',
    image: hex(
      '<path d="M24 9 L34.5 14 V26 C34.5 33 29.5 38.5 24 40.5 C18.5 38.5 13.5 33 13.5 26 V14 Z" fill="none" stroke="#95ff00" stroke-width="2" stroke-linejoin="round"/><path d="M24 18 L25.8 22 L30 22.5 L26.9 25.4 L27.8 29.5 L24 27 L20.2 29.5 L21.1 25.4 L18 22.5 L22.2 22 Z" fill="#00ff95"/>',
    ),
    description: 'A natural leader on the pitch.',
  },
  {
    id: 8,
    name: 'Wall',
    image: hex(
      '<rect x="13" y="16" width="22" height="7" rx="1.5" fill="#95ff00"/><rect x="17" y="25" width="14" height="7" rx="1.5" fill="#00ff95"/>',
    ),
    description: 'An impassable last line of defence.',
  },
  {
    id: 9,
    name: 'Sniper',
    image: hex(
      '<circle cx="24" cy="24" r="8" fill="none" stroke="#95ff00" stroke-width="2"/><path d="M24 10 V14 M24 34 V38 M10 24 H14 M34 24 H38" stroke="#95ff00" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="24" r="2" fill="#00ff95"/>',
    ),
    description: 'Clinical finishing from anywhere.',
  },
  {
    id: 10,
    name: 'Engine',
    image: hex(
      '<path d="M24 40 C18 34 16 29 18 23 C20 17.5 23 14.5 24 9 C25 14.5 28 17.5 30 23 C32 29 30 34 24 40 Z" fill="#95ff00"/>',
    ),
    description: 'Endless stamina, covers every blade of grass.',
  },
];

const perkById = new Map(PERKS.map((p) => [p.id, p]));

export function getPerkById(id: number | undefined): Perk | null {
  if (id == null) return null;
  return perkById.get(id) ?? null;
}

export function getPerksByIds(ids: number[] | undefined): Perk[] {
  return (ids ?? []).map((id) => getPerkById(id)).filter((p): p is Perk => p !== null);
}
