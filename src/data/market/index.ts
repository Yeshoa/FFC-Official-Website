// Mercado FCL derivado de players.json (no hay market.json: es un subconjunto calculado).
// Marketable = NO retirado 100%. Tengan o no club activo: un jugador con club también es comprable.
// La elegibilidad por nacionalidad (mercado externo) se resuelve en el simulador según el club elegido.
// Precio = marketPrice (override manual) o computeMarketPrice (formula rating×edad×posicion×lesiones).
import { getAllPlayers, isPlayerRetired } from '@data/players';
import { computePlayerRating } from '@config/rating';
import { positionToRole } from '@config/positions';
import { computeMarketPrice } from '@config/market';
import type { MarketPlayer } from '@ty/market';

export function getMarketablePlayers(): MarketPlayer[] {
  return getAllPlayers()
    .filter((p) => !isPlayerRetired(p))
    .map((p) => {
      const rating = computePlayerRating(p.skills, p.position);
      const price =
        p.marketPrice ??
        computeMarketPrice({
          rating,
          age: p.age,
          position: p.position,
          injuryResistance: p.skills.injuryResistance,
        });
      const clubEntry = p.teams.find((t) => t.teamType === 'club' && t.status === 'active');
      return {
        id: `p-${p.id}`,
        playerId: p.id,
        name: p.name,
        position: p.position,
        role: positionToRole(p.position),
        nationality: p.nationality,
        club: clubEntry?.teamCode,
        age: p.age,
        price,
        skills: p.skills,
      };
    })
    .sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
}
