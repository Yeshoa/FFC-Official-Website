import { computePlayerRating, ratingToStars, ovrRatingColor } from '@config/rating';
import { SKILL_CATEGORIES, skillCategoryValue } from '@config/skills';
import { positionToRole } from '@config/positions';
import { formatPrice } from '@config/market';
import { getPerksByIds } from '@data/perks';
import type { MarketPlayer } from '@ty/market';

interface Props {
  player: MarketPlayer;
  usedPosition?: string; // posición donde se está usando (si difiere de su natural)
  compact?: boolean; // variante reducida para la cancha
}

export default function PlayerCard({ player, usedPosition, compact = false }: Props) {
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

  const box = compact
    ? 'relative w-[96px] h-[144px] rounded-md overflow-hidden border text-white select-none'
    : 'relative w-[150px] h-[225px] rounded-md overflow-hidden border text-white select-none';
  const inner = compact ? 'relative z-10 flex flex-col h-full p-1' : 'relative z-10 flex flex-col h-full p-2.5';

  return (
    <div
      className={box}
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

      <div className={inner}>
        <div className="flex items-start justify-between">
          <span className="px-1 py-0.5 rounded bg-black/40 text-[10px] font-bold">{pos}</span>
          <div className="text-right">
            <span
              className={`font-black leading-none tabular-nums ${compact ? 'text-xl' : 'text-3xl'}`}
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
              className={`rounded-sm object-cover ring-1 ring-black/50 ${compact ? 'w-5 h-3' : 'w-7 h-4'}`}
            />
          ) : (
            <span className="text-[9px] text-white/40">—</span>
          )}
          {!compact && player.nationality && (
            <span className="text-[8px] tracking-[0.2em] text-white/80">
              {player.nationality.toUpperCase()}
            </span>
          )}
          {!compact && (
            <span className="text-[8px] tracking-[0.2em] text-white/70 leading-none">{firstName || ' '}</span>
          )}
          <span
            className={`font-black leading-tight tracking-wide ${compact ? 'text-[9px]' : 'text-[12px]'}`}
          >
            {lastName || ' '}
          </span>
        </div>

        {/* Estrellitas (centradas sobre los stats) */}
        <div className="flex items-center justify-center gap-px text-[13px] leading-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`${compact ? 'text-[10px]' : 'text-[13px]'} ${i < fullStars || (i === fullStars && hasHalf) ? 'text-yellow-300' : 'text-white/20'}`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Categorías */}
        <div className={`grid grid-cols-3 ${compact ? 'mt-0.5 gap-0.5' : 'mt-1 gap-1'}`}>
          {categories.map((c) => (
            <div key={c.id} className="bg-black/35 rounded px-0.5 py-0.5 text-center">
              <div className={`tracking-wider text-white/70 ${compact ? 'text-[6px]' : 'text-[7px]'}`}>{c.id}</div>
              <div className={`font-bold leading-tight tabular-nums ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Perks */}
        {perks.length > 0 && !compact && (
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

        <div className={`text-center font-bold text-cl-lime ${compact ? 'mt-0.5 text-[9px]' : 'mt-1 text-[11px]'}`}>
          {formatPrice(player.price)}
        </div>
      </div>
    </div>
  );
}
