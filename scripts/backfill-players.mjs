// Backfill de jugadores faltantes: crea en players.json (retirados) todos los jugadores
// que aparecen en partidos y premios y no existen, para que sus stats cuenten por id.
// También resuelve playerId en prizes de tournaments.json.
// Uso: node scripts/backfill-players.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MATCHES_DIR = path.join(root, 'src/data/matches');
const TOURNAMENTS_PATH = path.join(root, 'src/data/tournaments.json');
const MEMBERS_PATH = path.join(root, 'src/data/members.json');
const CLUBS_DIR = path.join(root, 'src/data/clubs');
const PLAYERS_PATH = path.join(root, 'src/data/players/players.json');
const BILSAN_PATH = path.join(__dirname, 'import', 'bilsan-names.json');

const dryRun = process.argv.includes('--dry-run');

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const titleCase = (s) =>
  String(s).trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(' ');
const cleanCase = (n) => (/[a-z]/.test(n) && /[A-Z]/.test(n) ? n : titleCase(n));
const playerNameOf = (p) => [p.firstName, p.lastName].filter(Boolean).join(' ');

// Nombres de pila por idioma (misma config que scripts/import-pes-players.mjs).
const POOLS = {
  nordic: ['Anders', 'Bjorn', 'Erik', 'Gustav', 'Henrik', 'Ivar', 'Joakim', 'Knut', 'Lars', 'Leif', 'Magnus', 'Nils', 'Olaf', 'Oskar', 'Ragnar', 'Sven', 'Torvald', 'Ulf', 'Vidar', 'Yngve', 'Aksel', 'Emil', 'Harald', 'Sigurd'],
  icelandic: ['Jon', 'Olafur', 'Einar', 'Snorri', 'Gunnar', 'Hakon', 'Bjarni', 'Aron', 'Baldur', 'Dagur', 'Eirikur', 'Fridrik', 'Gudmundur', 'Hjortur', 'Isak', 'Jokull', 'Kristofer', 'Logi', 'Magnus', 'Orri', 'Runar', 'Stefan', 'Thor', 'Valur', 'Vikingur'],
  german: ['Hans', 'Klaus', 'Lukas', 'Otto', 'Friedrich', 'Karl', 'Johann', 'Maximilian', 'Emil', 'Stefan', 'Dieter', 'Wolfgang', 'Norbert', 'Matthias', 'Jurgen', 'Rainer', 'Helmut', 'Werner', 'Adrian', 'Benedikt', 'Christoph', 'Felix', 'Leon'],
  slavic: ['Dmitri', 'Ivan', 'Nikolai', 'Aleksandar', 'Petr', 'Marek', 'Bogdan', 'Yuri', 'Vladislav', 'Stefan', 'Bojan', 'Dragan', 'Milos', 'Tomas', 'Ondrej', 'Jakub', 'Jozef', 'Denis', 'Artem', 'Sasha', 'Andrei', 'Viktor', 'Lazar'],
  english: ['James', 'Theo', 'Liam', 'Harry', 'Callum', 'Owen', 'Jasper', 'Edward', 'William', 'Henry', 'Oliver', 'George', 'Charlie', 'Jack', 'Archie', 'Stanley', 'Felix', 'Hugo', 'Arthur', 'Finn', 'Leo', 'Elliot'],
  japanese: ['Haruto', 'Kenji', 'Sota', 'Ren', 'Daiki', 'Akira', 'Takumi', 'Kaito', 'Yuto', 'Hiroshi', 'Riku', 'Hayato', 'Shota', 'Tatsuya', 'Koji', 'Naoki', 'Tetsuya', 'Jun', 'Kazuki', 'Ryota'],
  international: ['Alex', 'Daniel', 'Sam', 'Marco', 'Leo', 'Adam', 'Noah', 'Rafael', 'Elias', 'Jonas', 'Tomas', 'Matteo', 'Nikita', 'Omar', 'Amin', 'Luca', 'David', 'Emre', 'Andre', 'Julian'],
  fantasy: ['Thalion', 'Vaelor', 'Caelum', 'Ithril', 'Elowen', 'Soren', 'Darian', 'Kael', 'Rhyan', 'Lyra', 'Fenris', 'Oren', 'Seraph', 'Zephyr', 'Alaric', 'Eirwen', 'Corin', 'Valek', 'Nyra', 'Arden', 'Auren', 'Malek'],
  'joke-veg': ['Tomate', 'Pepino', 'Zanahoria', 'Lechuga', 'Coliflor', 'Espinaca', 'Berenjena', 'Calabaza', 'Alcachofa', 'Apio', 'Remolacha', 'Esparrago', 'Choclo', 'Pimiento', 'Rabano', 'Cebolla', 'Ajo', 'Perejil', 'Calabacin'],
  'joke-clown': ['Bozo', 'Bimbo', 'Giggles', 'Chuckles', 'Snickers', 'Bubbles', 'Doodles', 'Pickles', 'Ziggy', 'Buttons', 'Sunny', 'Fizzy', 'Toodles', 'Wiggles', 'Jolly', 'Happy', 'Rascal', 'Binky', 'Fluffy', 'Squeaky'],
  'joke-fish': ['Finn', 'Marlin', 'Pike', 'Salmon', 'Trout', 'Anchovy', 'Cod', 'Bass', 'Carp', 'Herring', 'Mackerel', 'Shark', 'Whale', 'Dolphin', 'Ray', 'Koi', 'Eel', 'Perch', 'Coral', 'Barracuda'],
  'joke-island': ['Captain', 'Salty', 'Reef', 'Cove', 'Barnacle', 'Anchor', 'Cannon', 'Gale', 'Wave', 'Mango', 'Tropic', 'Pelican', 'Coconut', 'Breeze', 'Sunset', 'Dune', 'Piper', 'Squall', 'Tidal', 'Marlin'],
};

const STYLE_BY_NATION = {
  BIL: 'bilsan', STR: 'bilsan',
  'A&K': 'nordic', GFF: 'nordic', SEH: 'nordic', NOR: 'nordic',
  FUR: 'icelandic',
  EIN: 'german', RUN: 'german',
  NAR: 'slavic', BEX: 'slavic', ZFE: 'slavic',
  RLS: 'english', CAC: 'english', CHP: 'english', KDV: 'english', LUM: 'english',
  GRB: 'japanese',
  VEZ: 'international', ETC: 'international', GEK: 'international', WLG: 'international', OZO: 'international',
  OSE: 'fantasy', AZR: 'fantasy', BSF: 'fantasy', MOZ: 'fantasy', JUT: 'fantasy',
  RLZ: 'joke-veg', CTC: 'joke-clown', FSH: 'joke-fish', CI: 'joke-island',
};

const bilsanNames = JSON.parse(fs.readFileSync(BILSAN_PATH, 'utf8')).filter((n) => n.length <= 10);

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.codePointAt(i)) >>> 0;
  return h;
}
function pickFrom(pool, key) {
  return pool[hashCode(key) % pool.length];
}
function generateGivenName(natCode, initial, lastName, id) {
  const style = STYLE_BY_NATION[natCode] ?? 'international';
  const pool = style === 'bilsan' ? bilsanNames : (POOLS[style] ?? POOLS.international);
  const key = `${lastName ?? ''}|${natCode}|${id ?? ''}`;
  if (initial) {
    const byLetter = pool.filter((n) => n[0].toUpperCase() === initial.toUpperCase());
    if (byLetter.length > 0) return pickFrom(byLetter, key);
  }
  return pickFrom(pool, key);
}

function splitName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  const lastName = parts.pop() ?? '';
  const hasFull = parts.some((x) => !/^[A-Za-z]\.$/.test(x));
  const initial = parts.length > 0 && !hasFull ? parts[0].replace('.', '') : null;
  return { firstName: hasFull ? parts.join(' ') : null, lastName, initial };
}

// ── Carga ──
const members = Object.values(JSON.parse(fs.readFileSync(MEMBERS_PATH, 'utf8')));
const memberByName = new Map();
const memberByCode = new Map();
for (const m of members) {
  memberByName.set(norm(m.name), m);
  if (m.code) memberByCode.set(norm(m.code), m);
}

// Clubes por nombre (los códigos de club pueden colisionar con códigos de miembro, ej "NOR").
const clubs = Object.values(
  fs.readdirSync(CLUBS_DIR)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(CLUBS_DIR, f), 'utf8'))),
);
const clubByName = new Map();
for (const c of clubs) clubByName.set(norm(c.name), c);

const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));
let nextId = players.reduce((m, p) => Math.max(m, p.id), 0) + 1;

const playersByNat = new Map();
for (const p of players) {
  const n = norm(p.nationality);
  if (!playersByNat.has(n)) playersByNat.set(n, []);
  playersByNat.get(n).push(p);
}

// Encuentra un jugador por apellido dentro de un miembro (preferencia a nombre completo exacto).
function findPlayerId(member, name) {
  const last = norm(String(name).trim().split(/\s+/).pop() ?? '');
  const cands = (playersByNat.get(norm(member.code)) ?? []).filter((p) => norm(p.lastName) === last);
  if (cands.length === 0) return null;
  if (cands.length === 1) return cands[0].id;
  const full = norm(name);
  const exact = cands.filter((p) => norm(playerNameOf(p)) === full);
  if (exact.length === 1) return exact[0].id;
  return cands[0].id;
}

// Recolecta refs únicos (miembro, nombre) desde partidos y premios.
const refs = new Map(); // key -> { member, name, number }
const addRef = (member, name, number) => {
  const k = norm(member.code) + '|' + norm(name);
  if (!refs.has(k)) refs.set(k, { member, name: String(name).trim(), number: number ?? null });
  else if (refs.get(k).number == null && number != null) refs.get(k).number = number;
};

for (const file of fs.readdirSync(MATCHES_DIR).filter((f) => f.endsWith('.json'))) {
  const matches = JSON.parse(fs.readFileSync(path.join(MATCHES_DIR, file), 'utf8'));
  for (const m of matches) {
    const sides = [
      { type: m.team1Type, code: m.team1Code, name: m.team1 },
      { type: m.team2Type, code: m.team2Code, name: m.team2 },
    ];
    for (const s of sides) {
      // Equipos de club (CL): los jugadores ya existen en players.json; no se backfillean.
      if (s.type === 'club' || clubByName.has(norm(s.name))) continue;
      const member = memberByName.get(norm(s.name)) ?? memberByCode.get(norm(s.code));
      if (!member) continue;
      for (const g of m.goals ?? []) {
        if (g.team === s.name) {
          if (g.player) addRef(member, g.player);
          if (g.assist) addRef(member, g.assist);
        }
      }
      for (const pen of m.penalties ?? []) if (pen.team === s.name && pen.player) addRef(member, pen.player);
      for (const c of m.cards ?? []) if (c.team === s.name && c.player) addRef(member, c.player);
      for (const sub of m.substitutions ?? []) {
        if (sub.team !== s.name) continue;
        if (sub.playerOut) addRef(member, sub.playerOut);
        if (sub.playerIn) addRef(member, sub.playerIn);
      }
      const lu = m.lineup && (s.code === m.team1Code ? m.lineup.team1 : m.lineup.team2);
      for (const p of lu?.players ?? []) if (p.name) addRef(member, p.name, p.number);
    }
  }
}

const tournaments = JSON.parse(fs.readFileSync(TOURNAMENTS_PATH, 'utf8'));
const PRIZE_KEYS = ['topScorer', 'bestPlayer', 'bestGoalkeeper', 'bestGoal'];
for (const t of Object.values(tournaments)) {
  const prizes = t.prizes;
  if (!prizes) continue;
  for (const key of PRIZE_KEYS) {
    const entries = key === 'topScorer' ? (prizes.topScorer ?? []) : prizes[key] ? [prizes[key]] : [];
    for (const e of entries) {
      const member = memberByName.get(norm(e.team)) ?? (e.teamId != null ? members.find((m) => m.id === e.teamId) : null);
      if (member && e.player) addRef(member, e.player);
    }
  }
}

// Crea los jugadores que faltan (retirados).
const report = { refs: refs.size, created: 0, existing: 0, unresolved: 0, prizeLinked: 0 };
for (const ref of refs.values()) {
  const existingId = findPlayerId(ref.member, ref.name);
  if (existingId != null) {
    ref.id = existingId;
    report.existing++;
    continue;
  }
  const { firstName, lastName, initial } = splitName(ref.name);
  const p = {
    id: nextId++,
    firstName: firstName ? cleanCase(firstName) : '',
    lastName: cleanCase(lastName),
    nationality: ref.member.code,
    nationalityId: ref.member.id,
    teams: [{ teamCode: ref.member.code, teamType: 'national', number: ref.number ?? null, from: null, to: null, status: 'retired', teamId: ref.member.id }],
    skills: {},
  };
  if (!p.firstName) p.firstName = generateGivenName(p.nationality, initial ?? null, p.lastName, p.id);
  ref.id = p.id;
  players.push(p);
  const n = norm(p.nationality);
  if (!playersByNat.has(n)) playersByNat.set(n, []);
  playersByNat.get(n).push(p);
  report.created++;
}

// Resuelve playerId en premios.
for (const t of Object.values(tournaments)) {
  const prizes = t.prizes;
  if (!prizes) continue;
  const link = (e) => {
    if (!e || e.player == null) return;
    const member = memberByName.get(norm(e.team)) ?? (e.teamId != null ? members.find((m) => m.id === e.teamId) : null);
    if (!member) return;
    const key = norm(member.code) + '|' + norm(e.player);
    const ref = refs.get(key);
    e.playerId = ref?.id ?? findPlayerId(member, e.player) ?? undefined;
    if (e.playerId != null) report.prizeLinked++;
  };
  for (const e of prizes.topScorer ?? []) link(e);
  link(prizes.bestPlayer);
  link(prizes.bestGoalkeeper);
  link(prizes.bestGoal);
}

players.sort((a, b) => a.id - b.id);

console.log(`refs únicos: ${report.refs} | existentes: ${report.existing} | creados: ${report.created} | premios linkeados: ${report.prizeLinked}`);
console.log(`Total jugadores: ${players.length}`);

if (dryRun) {
  console.log('(dry-run: no se escribe)');
  process.exit(0);
}

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2) + '\n', 'utf8');
fs.writeFileSync(TOURNAMENTS_PATH, JSON.stringify(tournaments, null, 2) + '\n', 'utf8');
console.log(`Escrito: ${PLAYERS_PATH}`);
console.log(`Escrito: ${TOURNAMENTS_PATH}`);
