import Trophy from '@images/achievements/king.webp';
import type { Achievement } from './index';

export const tournamentAchievements: {
  id: string;
  rarity: Achievement['rarity'];
  name: string;
  icon: ImageMetadata;
  description: string;
  evaluate: (...args: any[]) => Achievement | null;
}[] = [
  {
    id: 'host',
    rarity: 'Uncommon',
    name: 'Host',
    icon: Trophy,
    description: 'Awarded for hosting a Forest Cup edition.',
    evaluate: (matches, tournaments, member) => {
      const h = tournaments.find(t => t.data.host === member.data.name);
      return h
        ? {
            id: 'host',
            name: 'Host',
            icon: Trophy,
            rarity: 'Uncommon',
            description: `Hosted the Forest Cup ${h.data.edition}.`
          }
        : null;
    }
  },
  {
    id: 'double-champion',
    rarity: 'Legendary',
    name: 'Dynasty',
    icon: Trophy,
    description: 'Awarded for winning two Forest Cups.',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length === 2) {
        const years = won.map(w => w.data.edition).join(', ');
        return {
          id: 'double-champion',
          name: 'Dynasty',
          icon: Trophy,
          rarity: 'Legendary',
          description: `Won two Forest Cups (${years}).`
        };
      }
      return null;
    }
  },
  {
    id: 'triple-champion',
    rarity: 'Ultra',
    name: 'Overlord',
    icon: Trophy,
    description: 'Awarded for winning three Forest Cups.',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      if (won.length === 3) {
        const years = won.map(w => w.data.edition).join(', ');
        return {
          id: 'triple-champion',
          name: 'Overlord',
          icon: Trophy,
          rarity: 'Ultra',
          description: `Won three Forest Cups (${years}).`
        };
      }
      return null;
    }
  },
  {
    id: 'invictus',
    rarity: 'Epic',
    name: 'Invictus',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup without losing a single match.',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const lost = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf < ga;
        }).length;
        if (lost === 0 && played.length > 0)
          return {
            id: 'invictus',
            name: 'Invictus',
            icon: Trophy,
            rarity: 'Epic',
            description: `Won Forest Cup ${t.data.edition} without losing a match.`
          };
      }
      return null;
    }
  },
  {
    id: 'perfect-champion',
    rarity: 'Legendary',
    name: 'Flawless',
    icon: Trophy,
    description: 'Awarded for winning a Forest Cup with a perfect record (all wins).',
    evaluate: (matches, tournaments, member) => {
      const won = tournaments.filter(t => t.data.champion === member.data.name);
      for (const t of won) {
        const played = matches.filter(m => m.data.tournament_id === t.data.id && [m.data.team1, m.data.team2].includes(member.data.name));
        const wins = played.filter(m => {
          const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
          const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
          return gf > ga;
        }).length;
        if (wins === played.length && played.length > 0)
          return {
            id: 'perfect-champion',
            name: 'Flawless',
            icon: Trophy,
            rarity: 'Legendary',
            description: `Won Forest Cup ${t.data.edition} with a perfect record (${wins}-0).`
          };
      }
      return null;
    }
  },
  /* {
    id: 'winless',
    rarity: 'Cursed',
    name: 'Winless',
    icon: Trophy,
    description: 'Participated in Forest Cups but never won a match.',
    evaluate: (matches, tournaments, member) => {
      const played = matches.filter(m => [m.data.team1, m.data.team2].includes(member.data.name));
      const wins = played.filter(m => {
        const gf = m.data.goals?.filter(g => g.team === member.data.name).length ?? 0;
        const ga = m.data.goals?.filter(g => g.team !== member.data.name).length ?? 0;
        return gf > ga;
      }).length;
      if (played.length > 0 && wins === 0)
        return {
          id: 'winless',
          name: 'Winless',
          icon: Trophy,
          rarity: 'Cursed',
          description: 'Participated in Forest Cups but never won a match.'
        };
      return null;
    }
  } */
];