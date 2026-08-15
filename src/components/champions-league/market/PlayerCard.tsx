import { computePlayerRating, ratingToStars, ovrRatingColor } from '@config/rating';
import { SKILL_CATEGORIES, skillCategoryValue } from '@config/skills';
import { positionToRole } from '@config/positions';
import { formatPrice } from '@config/market';
import { getPerksByIds } from '@data/perks';
import type { MarketPlayer } from '@ty/market';

interface Props {
  player: MarketPlayer;
  usedPosition?: string; // posición donde se está usando (si difiere de su natural)
}

export default function PlayerCard({ player, usedPosition }: Props) {
  const pos = usedPosition ?? player.position;
  const rating = computePlayerRating(player.skills, pos);
  const stars = ratingToStars(rating);
  const ovr = ovrRatingColor(rating);
  const isGK = positionToRole(pos) === 'GK';
  const categories = SKILL_CATEGORIES.map((c) => ({
    ...c,
    value: skillCategoryValue(player.skills, c, isGK),
  }));
  const perks = getPerksByIds(player.perks);
  const firstName = (player.firstName ?? '').toUpperCase();
  const lastName = (player.lastName ?? '').toUpperCase();

  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.5;

  return (
    <div
      className="relative w-[150px] h-[225px] rounded-md overflow-hidden border text-white select-none"
      style={{
        background: `linear-gradient(160deg, ${ovr.bg} 0%, #050505 135%)`,
        borderColor: ovr.bg,
        boxShadow: `0 0 16px ${ovr.bg}55`,
      }}
    >
      {/* Módulo FCL: nodos circulares en las esquinas + marco fino */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 150 225"
        fill="none"
      >
        <path
          d="M5 5 L145 5 L145 220 L5 220 Z"
          stroke="rgba(149,255,0,0.30)"
          strokeWidth="1"
        />
        <path d="M5 5 L145 220 M145 5 L5 220" stroke="rgba(0,255,149,0.14)" strokeWidth="1" />
        {[
          [5, 5],
          [145, 5],
          [145, 220],
          [5, 220],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#95ff00" opacity="0.9" />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col h-full p-2.5">
        <div className="flex items-start justify-between">
          <span className="px-1 py-0.5 rounded bg-black/40 text-[10px] font-bold">{pos}</span>
          <div className="text-right">
            <span
              className="text-3xl font-black leading-none tabular-nums"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
            >
              {rating}
            </span>
            {player.age != null && (
              <div className="text-[8px] text-white/70 leading-none mt-0.5">{player.age}</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-center">
          {player.flagUrl ? (
            <img
              src={player.flagUrl}
              alt={player.nationality ?? ''}
              className="w-7 h-4 rounded-sm object-cover ring-1 ring-black/50"
            />
          ) : (
            <span className="text-[9px] text-white/40">—</span>
          )}
          {player.nationality && (
            <span className="text-[8px] tracking-[0.2em] text-white/80">
              {player.nationality.toUpperCase()}
            </span>
          )}
          <span className="text-[8px] tracking-[0.2em] text-white/70 leading-none">{firstName || ' '}</span>
          <span className="text-[12px] font-black leading-tight tracking-wide">{lastName || ' '}</span>
        </div>

        {/* Estrellitas (centradas sobre los stats) */}
        <div className="flex items-center justify-center gap-px text-[13px] leading-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < fullStars || (i === fullStars && hasHalf) ? 'text-yellow-300' : 'text-white/20'}
            >
              ★
            </span>
          ))}
        </div>

        {/* Categorías */}
        <div className="mt-1 grid grid-cols-3 gap-1">
          {categories.map((c) => (
            <div key={c.id} className="bg-black/35 rounded px-0.5 py-0.5 text-center">
              <div className="text-[7px] tracking-wider text-white/70">{c.id}</div>
              <div className="text-[10px] font-bold leading-tight tabular-nums">{c.value}</div>
            </div>
          ))}
        </div>

        {/* Perks */}
        {perks.length > 0 && (
          <div className="mt-1 flex items-center justify-center gap-1">
            {perks.map((pk) => (
              <span
                key={pk.id}
                title={`${pk.name} — ${pk.description}`}
                className="w-4 h-4 inline-block"
                dangerouslySetInnerHTML={{ __html: pk.image }}
              />
            ))}
          </div>
        )}

        <div className="mt-1 text-center text-[11px] font-bold text-cl-lime">{formatPrice(player.price)}</div>
      </div>
    </div>
  );
}
