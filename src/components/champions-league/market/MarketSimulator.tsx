import { useEffect, useMemo, useRef, useState } from 'react';
import { computePlayerRating, ratingToStars } from '@config/rating';
import { FORMATIONS, getFormationPositions } from '@config/formations';
import { positionToRole } from '@config/positions';
import { formatPrice, parsePriceInput } from '@config/market';
import type { FederationGroup, MarketNationality, MarketPlayer, MarketRole } from '@ty/market';
import PlayerCard from './PlayerCard';

interface Props {
  federations: FederationGroup[];
  players: MarketPlayer[];
  season: number;
  nationalities: MarketNationality[];
}

const STARTERS = 11;
const BENCH_SIZE = 12;
const RESERVA_SIZE = 9;

const ROLE_BADGE: Record<MarketRole, string> = {
  GK: 'bg-yellow-400 text-black',
  DEF: 'bg-sky-500 text-white',
  MID: 'bg-emerald-500 text-white',
  FWD: 'bg-red-500 text-white',
};

// Bordes inactivos de los botones de posición, del color del rol (activo = lime).
const ROLE_POS_BORDER: Record<MarketRole, string> = {
  GK: 'border-yellow-400/40 text-yellow-300 hover:border-yellow-400/80',
  DEF: 'border-sky-500/40 text-sky-300 hover:border-sky-500/80',
  MID: 'border-emerald-500/40 text-emerald-300 hover:border-emerald-500/80',
  FWD: 'border-red-500/40 text-red-300 hover:border-red-500/80',
};

// Cuadro de posiciones estilo cancha (3 columnas); null = hueco.
const POSITION_ROWS: (string | null)[][] = [
  ['LW', 'CF', 'RW'],
  [null, 'CAM', null],
  ['LM', 'CM', 'RM'],
  [null, 'CDM', null],
  ['LB', 'CB', 'RB'],
  [null, 'GK', null],
];

type Slot = { kind: 'starter' | 'bench' | 'reserva'; index: number };

export default function MarketSimulator({ federations, players, season, nationalities }: Props) {
  const [fedCode, setFedCode] = useState<string | null>(federations[0]?.code ?? null);
  const [clubId, setClubId] = useState<number | null>(null);
  const [formation, setFormation] = useState<string>('4-4-2');
  const [starters, setStarters] = useState<(MarketPlayer | null)[]>(() => Array(STARTERS).fill(null));
  const [bench, setBench] = useState<(MarketPlayer | null)[]>(() => Array(BENCH_SIZE).fill(null));
  const [reservas, setReservas] = useState<(MarketPlayer | null)[]>(() => Array(RESERVA_SIZE).fill(null));
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [query, setQuery] = useState('');
  const [natQuery, setNatQuery] = useState('');
  const [filterNat, setFilterNat] = useState<string>('ALL');
  const [showPosFilter, setShowPosFilter] = useState(false);
  const [showNatFilter, setShowNatFilter] = useState(false);
  const natPanelRef = useRef<HTMLDivElement | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [maxRating, setMaxRating] = useState<string>('');
  const [message, setMessage] = useState('');
  const [exported, setExported] = useState('');

  const fed = federations.find((f) => f.code === fedCode) ?? null;
  const club = fed?.clubs.find((c) => c.id === clubId) ?? null;

  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const natRules = useMemo(
    () => new Map(nationalities.map((n) => [n.code.toUpperCase(), n])),
    [nationalities],
  );
  const formationPositions = getFormationPositions(formation);

  const spent = useMemo(
    () => [...starters, ...bench, ...reservas].reduce((s, p) => s + (p?.price ?? 0), 0),
    [starters, bench, reservas],
  );
  const budget = club?.budget ?? 0;
  const remaining = budget - spent;
  const spentPct = budget > 0 ? (spent / budget) * 100 : 0;

  const slotPlayer = (s: Slot): MarketPlayer | null =>
    s.kind === 'starter' ? starters[s.index] : s.kind === 'bench' ? bench[s.index] : reservas[s.index];

  const findPlayerSlot = (pid: string): Slot | null => {
    const i = starters.findIndex((p) => p?.id === pid);
    if (i !== -1) return { kind: 'starter', index: i };
    const j = bench.findIndex((p) => p?.id === pid);
    if (j !== -1) return { kind: 'bench', index: j };
    const k = reservas.findIndex((p) => p?.id === pid);
    if (k !== -1) return { kind: 'reserva', index: k };
    return null;
  };

  // Slots que exigen arquero: posición GK de la cancha (slot 0) y primer slot de la banca.
  const isGkLocked = (s: Slot) => (s.kind === 'starter' || s.kind === 'bench') && s.index === 0;

  const usedPositionFor = (s: Slot, p: MarketPlayer) =>
    s.kind === 'starter' ? formationPositions[s.index] : p.position;

  const place = (s: Slot, playerId: string) => {
    const p = playerById.get(playerId);
    if (!p) return;
    if (isGkLocked(s) && p.role !== 'GK') {
      setMessage(`${p.name} (${p.role}) can't go into a goalkeeper slot`);
      return;
    }
    const occupant = slotPlayer(s);
    const cur = findPlayerSlot(playerId);
    const alreadyIn = cur !== null;
    const newSpent = spent - (occupant?.price ?? 0) + (alreadyIn ? 0 : p.price);
    if (newSpent > budget) {
      setMessage(`Over budget: needs $${newSpent}M, available $${budget}M`);
      return;
    }

    let ns = starters;
    let nb = bench;
    let nr = reservas;
    const mutate = (slot: Slot, value: MarketPlayer | null) => {
      if (slot.kind === 'starter') ns = ns.map((x, i) => (i === slot.index ? value : x));
      else if (slot.kind === 'bench') nb = nb.map((x, i) => (i === slot.index ? value : x));
      else nr = nr.map((x, i) => (i === slot.index ? value : x));
    };
    if (alreadyIn && !(cur!.kind === s.kind && cur!.index === s.index)) mutate(cur!, null);
    mutate(s, p);
    setStarters(ns);
    setBench(nb);
    setReservas(nr);
    setSelectedPlayerId(null);
    setSelectedSlot(null);
    setMessage('');
  };

  const remove = (s: Slot) => {
    if (s.kind === 'starter') setStarters(starters.map((x, i) => (i === s.index ? null : x)));
    else if (s.kind === 'bench') setBench(bench.map((x, i) => (i === s.index ? null : x)));
    else setReservas(reservas.map((x, i) => (i === s.index ? null : x)));
    setMessage('');
  };

  const clearFilters = () => {
    setFilterPos('ALL');
    setFilterNat('ALL');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxRating('');
    setQuery('');
    setNatQuery('');
  };

  // Cierra el panel flotante de nacionalidades al hacer click fuera.
  useEffect(() => {
    if (!showNatFilter) return;
    const onClick = (e: MouseEvent) => {
      if (natPanelRef.current && !natPanelRef.current.contains(e.target as Node)) setShowNatFilter(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showNatFilter]);

  const selectPlayer = (pid: string) => {
    const p = playerById.get(pid);
    if (!p) return;
    const alreadyIn = findPlayerSlot(pid) !== null;
    if (!alreadyIn && p.price > remaining) return;
    setSelectedPlayerId(pid);
    setSelectedSlot(null);
    setMessage('');
  };

  const selectSlot = (s: Slot) => {
    if (selectedPlayerId) {
      place(s, selectedPlayerId);
      return;
    }
    setSelectedSlot((prev) => (prev?.kind === s.kind && prev.index === s.index ? null : s));
    setMessage('');
  };

  const slotLock = selectedSlot ? isGkLocked(selectedSlot) : false;
  const selectedPlayer = selectedPlayerId ? (playerById.get(selectedPlayerId) ?? null) : null;

  const natQ = natQuery.trim().toLowerCase().replace(/\s+/g, '');
  const visibleNationalities =
    natQ === ''
      ? nationalities
      : nationalities.filter((n) => {
          const name = n.name.toLowerCase();
          // Contiene + tolera letras transpuestas ("BLISA" encuentra "Bilsa").
          return name.includes(natQ) || [...natQ].every((ch) => name.includes(ch));
        });

  // Regla de mercado externo: un jugador aparece para un club extranjero solo si su federación
  // lo permite (allowsForeignMarket); para un club de su misma federación aparece siempre.
  // Sin club elegido se muestra todo (modo exploración).
  const foreignAllowed = (p: MarketPlayer): boolean => {
    if (!club) return true;
    const nat = p.nationality?.toUpperCase();
    if (!nat) return true; // sin nacionalidad no hay regla
    const rule = natRules.get(nat);
    if (!rule) return true; // nacionalidad desconocida → se muestra
    return rule.allowsForeignMarket === true || nat === fed?.code?.toUpperCase();
  };

  const num = (v: string) => {
    const n = Number(v);
    if (v.trim() === '' || Number.isNaN(n) || n < 0) return null; // sin negativos
    return n;
  };
  const filtered = players.filter((p) => {
    if (!foreignAllowed(p)) return false;
    if (filterPos !== 'ALL' && p.position !== filterPos) return false;
    if (filterNat !== 'ALL' && p.nationality !== filterNat) return false;
    const mp = parsePriceInput(minPrice);
    const xp = parsePriceInput(maxPrice);
    if (mp != null && p.price < mp) return false;
    if (xp != null && p.price > xp) return false;
    const rating = computePlayerRating(p.skills, p.position);
    const mr = num(minRating);
    const xr = num(maxRating);
    if (mr != null && rating < mr) return false;
    if (xr != null && rating > xr) return false;
    if (query.trim() !== '' && !p.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  const isDisabled = (p: MarketPlayer) => {
    const alreadyIn = findPlayerSlot(p.id) !== null;
    if (!alreadyIn && p.price > remaining) return true;
    if (slotLock && p.role !== 'GK') return true;
    return false;
  };

  const gkInStarters = starters[0]?.role === 'GK';
  const gkInBench = bench[0]?.role === 'GK';

  const buildExport = () => {
    const ref = (s: Slot) => {
      const p = slotPlayer(s);
      if (!p) return null;
      const used = usedPositionFor(s, p);
      return {
        playerId: p.playerId ?? null,
        name: p.name,
        position: p.position,
        usedAs: used,
        rating: computePlayerRating(p.skills, used),
        price: p.price,
      };
    };
    const startersOut = starters.map((_, i) => ref({ kind: 'starter', index: i }));
    const benchOut = bench.map((_, i) => ref({ kind: 'bench', index: i }));
    const reservasOut = reservas.map((_, i) => ref({ kind: 'reserva', index: i }));
    const signings = [...startersOut, ...benchOut, ...reservasOut].filter(Boolean);
    return {
      season,
      club: club ? { id: club.id, code: club.code, name: club.name } : null,
      formation,
      budget: { total: budget, spent, remaining },
      signings,
      starters: startersOut,
      bench: benchOut,
      reservas: reservasOut,
    };
  };

  const runExport = (mode: 'copy' | 'download') => {
    if (!gkInStarters) {
      setMessage('The starting XI needs a goalkeeper in the GK slot');
      return;
    }
    if (!gkInBench) {
      setMessage('The bench needs a goalkeeper in the first bench slot');
      return;
    }
    const json = JSON.stringify(buildExport(), null, 2);
    setExported(json);
    if (mode === 'copy') {
      navigator.clipboard
        .writeText(json)
        .then(() => setMessage('Copied to clipboard'))
        .catch(() => setMessage('Copy failed — use the text area below'));
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-${club?.code ?? 'club'}-${season}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const displayRows: { role: MarketRole; indices: number[] }[] = [
    { role: 'FWD', indices: [] },
    { role: 'MID', indices: [] },
    { role: 'DEF', indices: [] },
    { role: 'GK', indices: [] },
  ];
  formationPositions.forEach((pos, i) => {
    const row = displayRows.find((r) => r.role === positionToRole(pos));
    if (row) row.indices.push(i);
  });

  const renderSlot = (s: Slot, label: string) => {
    const p = slotPlayer(s);
    const pos = s.kind === 'starter' ? formationPositions[s.index] : p?.position ?? '—';
    const locked = isGkLocked(s);
    const dimmed = locked && selectedPlayer != null && selectedPlayer.role !== 'GK';
    const isSelectedSlot = selectedSlot?.kind === s.kind && selectedSlot.index === s.index;
    return (
      <div
        key={`${s.kind}-${s.index}`}
        onClick={() => (p ? remove(s) : selectSlot(s))}
        title={p ? 'Click to remove' : `${label}${locked ? ' · Goalkeeper required' : ''}`}
        className={`relative rounded-md transition-transform hover:scale-[1.02] cursor-pointer ${dimmed ? 'opacity-25' : ''} ${
          isSelectedSlot ? 'ring-2 ring-cl-lime' : ''
        }`}
      >
        {p ? (
          <PlayerCard player={p} usedPosition={s.kind === 'starter' ? formationPositions[s.index] : p.position} />
        ) : (
          <div className="w-[150px] h-[225px] rounded-md border-2 border-dashed border-cl-lime/30 bg-black/20 flex flex-col items-center justify-center gap-1 text-center">
            <span className="px-1 py-0.5 rounded bg-cl-lime/15 text-cl-lime text-[10px] font-bold">{pos}</span>
            <span className="text-[9px] uppercase tracking-widest text-text-muted">{label}</span>
            {locked && <span className="text-[8px] text-yellow-400">GK required</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Instructivo */}
      <p className="text-xs text-text-muted bg-cl-lime/5 border border-cl-lime/20 rounded-lg px-3 py-2">
        How it works: <strong className="text-cl-lime">1</strong> pick a club ·{' '}
        <strong className="text-cl-lime">2</strong> click a player (preview on the right) ·{' '}
        <strong className="text-cl-lime">3</strong> click a slot to place them. Click a placed card to remove. The GK
        slot and the first bench slot require a goalkeeper.
      </p>

      {message && (
        <p className="text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{message}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start">
        {/* Mercado */}
        <aside className="bg-surface/40 rounded-2xl border border-cl-lime/20 p-4 flex flex-col gap-3 sticky top-[72px] self-start h-[calc(100vh-72px)] overflow-hidden">
          {/* Federación y club */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={fedCode ?? ''}
              onChange={(e) => {
                setFedCode(e.target.value);
                setClubId(null);
              }}
              className="bg-black/40 border border-cl-lime/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cl-lime"
            >
              {federations.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {fed?.clubs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClubId(c.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    c.id === clubId
                      ? 'bg-cl-lime text-black border-cl-lime'
                      : 'border-cl-lime/40 text-cl-lime hover:bg-cl-lime/10'
                  }`}
                >
                  {c.name}
                </button>
              ))}
              {fed && fed.clubs.length === 0 && (
                <span className="text-text-muted text-sm italic">No clubs in this federation.</span>
              )}
            </div>
          </div>

          {club && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-text-muted">Budget</span>
                <span className="font-bold text-cl-lime">{formatPrice(budget)}</span>
                <span className="text-text-muted">Spent</span>
                <span className="font-bold text-white">{formatPrice(spent)}</span>
                <span className="text-text-muted">Remaining</span>
                <span className={`font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatPrice(remaining)}
                </span>
              </div>
              {budget > 0 && (
                <div>
                  <div className="h-2.5 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        spentPct > 100 ? 'bg-red-500' : spentPct > 80 ? 'bg-amber-400' : 'bg-cl-lime'
                      }`}
                      style={{ width: `${Math.min(100, spentPct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                    <span>{Math.round(spentPct)}% used</span>
                    <span>{remaining < 0 ? 'Over budget' : `${formatPrice(remaining)} left`}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <h3 className="text-lg font-bold text-cl-lime">Market · Season {season}</h3>
          <div className="space-y-2">
            {/* Toggles de filtros: posición y nacionalidades */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPosFilter((v) => !v)}
                title="Toggle position filter"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                  showPosFilter || filterPos !== 'ALL'
                    ? 'bg-cl-lime/15 text-cl-lime border-cl-lime'
                    : 'border-cl-lime/30 text-cl-lime/80 hover:border-cl-lime/60'
                }`}
              >
                Position
                {filterPos !== 'ALL' && <span className="px-1 rounded bg-cl-lime text-black text-[10px]">{filterPos}</span>}
                <span className="text-[9px]">{showPosFilter ? '▾' : '▸'}</span>
              </button>
              <div ref={natPanelRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowNatFilter((v) => !v)}
                  title="Toggle nationality filter"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    showNatFilter || filterNat !== 'ALL'
                      ? 'bg-cl-lime/15 text-cl-lime border-cl-lime'
                      : 'border-cl-lime/30 text-cl-lime/80 hover:border-cl-lime/60'
                  }`}
                >
                  Nationalities
                  {filterNat !== 'ALL' && <span className="px-1 rounded bg-cl-lime text-black text-[10px]">{filterNat}</span>}
                  <span className="text-[9px]">{showNatFilter ? '▾' : '▸'}</span>
                </button>
                {showNatFilter && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-72 max-w-[calc(100vw-2rem)] bg-black/95 border border-cl-lime/30 rounded-xl p-3 space-y-2 max-h-64 overflow-y-auto shadow-lg shadow-black/50">
                    <input
                      value={natQuery}
                      onChange={(e) => setNatQuery(e.target.value)}
                      placeholder="Search country…"
                      className="w-full bg-black/40 border border-cl-lime/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {visibleNationalities.map((n) => {
                        const active = filterNat === n.code;
                        return (
                          <button
                            key={n.code}
                            type="button"
                            onClick={() => setFilterNat(active ? 'ALL' : n.code)}
                            title={n.name}
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                              active
                                ? 'border-cl-lime bg-cl-lime/15 text-cl-lime'
                                : 'border-cl-lime/20 text-white/70 hover:border-cl-lime/50'
                            }`}
                          >
                            {n.flagUrl ? (
                              <img src={n.flagUrl} alt={n.name} className="w-4 h-3 rounded-sm object-cover" />
                            ) : null}
                            {n.code}
                          </button>
                        );
                      })}
                      {visibleNationalities.length === 0 && (
                        <span className="text-xs text-text-muted italic">No countries match.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Posición: cuadro estilo cancha (toggleable) */}
            {showPosFilter && (
              <div className="inline-grid grid-cols-3 gap-1">
                {POSITION_ROWS.map((row, ri) =>
                  row.map((pos, ci) =>
                    pos ? (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setFilterPos(filterPos === pos ? 'ALL' : pos)}
                        className={`rounded border px-2 py-1 text-[10px] font-bold transition-colors ${
                          filterPos === pos
                            ? 'bg-cl-lime text-black border-cl-lime'
                            : ROLE_POS_BORDER[positionToRole(pos)]
                        }`}
                      >
                        {pos}
                      </button>
                    ) : (
                      <span key={`${ri}-${ci}`} className="px-2 py-1" />
                    ),
                  ),
                )}
              </div>
            )}

            {/* Precio / OVR / búsqueda */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min (950K)"
                className="w-24 bg-black/40 border border-cl-lime/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
              />
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max (15M)"
                className="w-24 bg-black/40 border border-cl-lime/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="Min OVR"
                className="w-20 bg-black/40 border border-cl-lime/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
                placeholder="Max OVR"
                className="w-20 bg-black/40 border border-cl-lime/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 min-w-[120px] bg-black/40 border border-cl-lime/30 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cl-lime"
              />
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg border border-cl-lime/40 text-cl-lime text-xs font-bold hover:bg-cl-lime/10 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
            {/* Lista */}
            <div className="min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {filtered.map((p) => {
                const disabled = isDisabled(p);
                const r = computePlayerRating(p.skills, p.position);
                const stars = ratingToStars(r);
                return (
                  <div
                    key={p.id}
                    onClick={() => !disabled && selectPlayer(p.id)}
                    title={disabled ? (slotLock ? 'Goalkeeper required here' : 'Over budget') : 'Click to select'}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm border transition-colors ${
                      disabled
                        ? 'border-cl-lime/5 bg-black/30 opacity-40 cursor-not-allowed'
                        : selectedPlayerId === p.id
                          ? 'border-cl-lime bg-cl-lime/10 cursor-pointer'
                          : 'border-cl-lime/10 bg-black/30 cursor-pointer hover:border-cl-lime/50'
                    }`}
                  >
                    {p.flagUrl ? (
                      <img src={p.flagUrl} alt={p.nationality ?? ''} className="w-5 h-3.5 rounded-sm object-cover" />
                    ) : (
                      <span className="w-5 h-3.5 rounded-sm bg-gray-700" />
                    )}
                    <span className={`px-1 rounded text-[9px] font-bold ${ROLE_BADGE[p.role]}`}>{p.position}</span>
                    <span className="flex-1 truncate font-medium text-white">{p.name}</span>
                    <span className="text-[10px] text-cl-lime tabular-nums">{r}</span>
                    <span className="text-[10px] text-yellow-300 tabular-nums">{'★'.repeat(Math.round(stars))}</span>
                    <span className="font-bold text-cl-lime text-xs">{formatPrice(p.price)}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-text-muted italic text-sm py-4 text-center">No players match.</p>
              )}
            </div>

            {/* Preview de la carta */}
            <div className="min-h-0 overflow-y-auto flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">Preview</span>
              {selectedPlayer ? (
                <PlayerCard player={selectedPlayer} />
              ) : (
                <div className="w-[150px] h-[225px] rounded-md border border-dashed border-cl-lime/20 bg-black/10 flex items-center justify-center">
                  <span className="text-[10px] text-text-muted text-center px-3">
                    Click a player to preview their card
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Cancha */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-muted">Formation:</span>
            <select
              value={formation}
              onChange={(e) => {
                setFormation(e.target.value);
                setStarters(Array(STARTERS).fill(null));
              }}
              className="bg-black/40 border border-cl-lime/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cl-lime"
            >
              {Object.keys(FORMATIONS).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Titulares */}
          <div className="bg-gradient-to-b from-black via-cl-black to-black border border-cl-lime/20 rounded-2xl p-5 space-y-4">
            {displayRows.map(({ role, indices }) => (
              <div key={role} className="flex flex-wrap justify-center gap-2.5">
                {indices.map((idx) => renderSlot({ kind: 'starter', index: idx }, 'Starter'))}
              </div>
            ))}
          </div>

          {/* Banca */}
          <div className="bg-surface/40 border border-cl-lime/20 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
              Bench ({BENCH_SIZE}) <span className="text-yellow-400">· GK required in first slot</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {bench.map((_, i) => renderSlot({ kind: 'bench', index: i }, `Bench ${i + 1}`))}
            </div>
          </div>

          {/* Reservas */}
          <div className="bg-surface/40 border border-cl-lime/20 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-3">Reserves ({RESERVA_SIZE} · optional)</p>
            <div className="flex flex-wrap gap-2.5">
              {reservas.map((_, i) => renderSlot({ kind: 'reserva', index: i }, `Reserve ${i + 1}`))}
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runExport('copy')}
              className="px-4 py-2 rounded-lg bg-cl-lime text-black font-bold text-sm hover:bg-white transition-colors"
            >
              Copy export JSON
            </button>
            <button
              type="button"
              onClick={() => runExport('download')}
              className="px-4 py-2 rounded-lg border border-cl-lime/50 text-cl-lime font-bold text-sm hover:bg-cl-lime/10 transition-colors"
            >
              Download
            </button>
          </div>
          {exported && (
            <pre className="bg-black/50 border border-cl-lime/20 rounded-xl p-3 text-xs text-cl-lime overflow-x-auto max-h-56 overflow-y-auto whitespace-pre-wrap">
              {exported}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
