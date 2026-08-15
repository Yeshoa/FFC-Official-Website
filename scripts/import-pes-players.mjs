// Importación PES → players.json (FC 2026).
// Fuentes: scripts/import/all_teams_20260501_195001.csv (generado por el generador PES 2021)
// + teams_data.py del generador (nombres completos autoritativos) + scripts/import/bilsan-names.json.
// Merge conservando ids existentes (cruza por apellido + nacionalidad). Nombres:
// firstName/lastName separados; firstName generado SOLO para jugadores sin nombre de pila explícito.
// Uso: node scripts/import-pes-players.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const CSV_PATH = 'D:/HMH/Forest/Forest Cup 2026/generador/PES_2021_Generator/Teams/Players FC26 Pre edit ingame.csv';
const BILSAN_PATH = path.join(__dirname, 'import', 'bilsan-names.json');
const TEAMS_DATA_PATH = 'D:/HMH/Forest/Forest Cup 2026/generador/PES_2021_Generator/teams_data.py';
const MEMBERS_PATH = path.join(root, 'src/data/members.json');
const PLAYERS_PATH = path.join(root, 'src/data/players/players.json');

const dryRun = process.argv.includes('--dry-run');

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const titleCase = (s) =>
  String(s).trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(' ');
// Normaliza a "Palabra" si el token es todo mayúsculas o todo minúsculas; respeta mixto ("McArthur", "D'Elia").
const cleanCase = (n) => (/[a-z]/.test(n) && /[A-Z]/.test(n) ? n : titleCase(n));
const cleanLastName = (n) => cleanCase(n);

// ── Códigos de país PES (COUNTRY_CODES del generador) + overrides de nombres de member ──
const PES_COUNTRY = {
  '191': 'Zerphen', '192': 'Stralla', '193': 'Columbiqash', '194': 'Nardin', '195': 'New Libertalia Kingdom',
  '196': 'Otterland', '197': 'Nordustra', '198': 'Furilisca', '199': 'Jutsa', '200': 'Realize',
  '201': 'Ruinenlust', '202': 'Garbelia', '203': 'Einswenn', '204': 'Cacusia', '205': 'Freistaat Ostpreussen',
  '206': 'Bisofeyr', '207': 'Ecologist Hegemony', '208': 'Roless', '209': 'Zane Farbe Eslanudial',
  '210': 'Anxious and Kevin', '213': 'Chaplin', '214': 'United Malay Federation', '215': 'Lumiose',
  '216': 'Green Empire Karaa', '217': 'Azure Mines', '218': 'Atsvea', '219': 'Valentine Z', '220': 'Chan Island',
  '221': 'ForFishing', '222': 'Sehir', '223': 'Glo', '224': 'Verdant Haven', '225': 'Klaus Devestatorie',
  '229': 'Ownzone', '230': 'Reannia', '231': 'Clown Town City', '232': 'Bextoria', '234': 'Oseao',
  '236': 'Bilsa', '239': 'Woodland Green', '245': 'Mozolephies',
};
const NAME_OVERRIDES = { '219': 'Valentian Kittens', '221': 'Fish', '223': 'Glo XI' };

// ── Posiciones ──
const PES_POS = ['GK', 'CB', 'LB', 'RB', 'DMF', 'CMF', 'LMF', 'RMF', 'AMF', 'LWF', 'RWF', 'SS', 'CF'];
const TO_OUR = { GK: 'GK', CB: 'CB', LB: 'LB', RB: 'RB', DMF: 'DM', CMF: 'CM', LMF: 'LM', RMF: 'RM', AMF: 'AM', LWF: 'LW', RWF: 'RW', SS: 'CF', CF: 'CF' };

// ── Playing styles (basics.py del generador) ──
const PLAYING_STYLES = {
  1: 'Goal Poacher', 2: 'Dummy Runner', 3: 'Fox in the Box', 4: 'Prolific Winger',
  5: 'Classic No. 10', 6: 'Hole Player', 7: 'Box-to-Box', 8: 'Anchor Man',
  9: 'The Destroyer', 10: 'Extra Frontman', 11: 'Offensive Full-back', 12: 'Defensive Full-back',
  13: 'Target Man', 14: 'Creative Playmaker', 15: 'Build Up', 16: 'Offensive Goalkeeper',
  17: 'Defensive Goalkeeper', 18: 'Roaming Flank', 19: 'Cross Specialist',
  20: 'Orchestrator', 21: 'Full-Back Finisher',
};

// ── Nombres de pila por idioma ──
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

// Estilo por código de member (por defecto: international).
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

// Nombres bilsos pre-generados con bilsaNameGenerator.py; filtro los absurdamente largos.
const bilsanNames = JSON.parse(fs.readFileSync(BILSAN_PATH, 'utf8')).filter((n) => n.length <= 10);

// PRNG determinista (semilla por apellido + nacionalidad → reproducible).
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

// ── Skills (derivación aprobada, ver docs/FFC-Website/11-migracion-jugadores-pes) ──
const num = (v) => Number(v) || 0;
const avg = (...vs) => Math.round(vs.reduce((a, b) => a + b, 0) / vs.length);

function deriveSkills(r) {
  const ir = { 1: 30, 2: 60, 3: 90 }[Number(r.InjuryResistance)] ?? 60;
  return {
    shortRange: num(r.Finishing),
    mediumRange: avg(num(r.Finishing), num(r.KickingPower)),
    longRange: num(r.KickingPower),
    heading: num(r.Heading),
    pace: avg(num(r.Speed), num(r.Acceleration)),
    agility: num(r.TightPossession),
    stamina: num(r.Stamina),
    jumping: num(r.Jump),
    dribbling: num(r.Dribbling),
    fakes: avg(num(r.Dribbling), num(r.TightPossession)),
    ballControl: num(r.BallControl),
    stability: num(r.Balance),
    positioning: avg(num(r.OffensiveAwareness), num(r.DefensiveAwareness)),
    vision: avg(num(r.LowPass), num(r.LoftedPass)),
    tackling: num(r.BallWinning),
    sliding: num(r.Aggression),
    clearing: num(r.DefensiveAwareness),
    power: avg(num(r.KickingPower), num(r.PhysicalContact)),
    reflexes: num(r.GKReflexes),
    gkPositioning: num(r.GKAwareness),
    stretch: num(r.GKReach),
    saveClose: num(r.GKClearing),
    catch: num(r.GKCatching),
    injuryResistance: ir,
  };
}

function computePositions(r, mainPos) {
  const set = new Set([mainPos]);
  for (const col of PES_POS) {
    if (String(r[col]).trim() === '1') set.add(TO_OUR[col]);
  }
  return [...set];
}

// ── Parseo CSV ──
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ';') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const csvLines = parseCsv(fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, ''));
const header = csvLines[0];
const csvRows = csvLines.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));

// ── teams_data.py (nombres completos) ──
const teamsSource = fs.readFileSync(TEAMS_DATA_PATH, 'utf8');
const teamsEntries = [];
const objRe = /\{([^{}]*)\}/g;
let om;
while ((om = objRe.exec(teamsSource))) {
  const body = om[1];
  const get = (k) => {
    const mm = body.match(new RegExp(`"${k}"\\s*:\\s*"?([^",}\\s][^",}]*)`));
    return mm ? mm[1] : undefined;
  };
  const name = get('Name');
  if (!name) continue;
  teamsEntries.push({
    id: get('Id'),
    country: get('Country'),
    name: name.trim(),
    shirt: get('ShirtNumber') !== undefined ? Number(get('ShirtNumber')) : undefined,
  });
}
const teamsById = new Map();
const teamsByCountryName = new Map();
for (const e of teamsEntries) {
  if (e.id) teamsById.set(e.id, e);
  if (e.country) {
    const c = norm(e.country);
    if (!teamsByCountryName.has(c)) teamsByCountryName.set(c, new Map());
    teamsByCountryName.get(c).set(norm(e.name), e);
  }
}

// ── Members ──
const members = Object.values(JSON.parse(fs.readFileSync(MEMBERS_PATH, 'utf8')));
const memberByNormName = new Map();
for (const m of members) memberByNormName.set(norm(m.name), m);

const pesToMember = new Map();
for (const [code, name] of Object.entries(PES_COUNTRY)) {
  const m = memberByNormName.get(norm(NAME_OVERRIDES[code] ?? name));
  if (m) pesToMember.set(code, m);
}

// ── players.json actual ──
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));
let nextId = players.reduce((m, p) => Math.max(m, p.id), 0) + 1;

const byNat = new Map();
for (const p of players) {
  const n = norm(p.nationality);
  if (!byNat.has(n)) byNat.set(n, []);
  byNat.get(n).push(p);
}
const surnameOf = (p) =>
  norm(p.lastName ?? (p.name ? String(p.name).trim().split(/\s+/).pop() : ''));

function splitName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  const lastName = parts.pop() ?? '';
  const hasFull = parts.some((x) => !/^[A-Za-z]\.$/.test(x));
  const initial = parts.length > 0 && !hasFull ? parts[0].replace('.', '') : null;
  return { firstName: hasFull ? parts.join(' ') : null, lastName, initial };
}

function ensureNationalEntry(p, member, shirt) {
  let entry = (p.teams ?? []).find((t) => t.teamType === 'national' && t.teamId === member.id);
  if (!entry) entry = (p.teams ?? []).find((t) => t.teamType === 'national' && norm(t.teamCode) === norm(member.code));
  if (entry) {
    entry.teamId = member.id;
    entry.teamCode = member.code;
    entry.status = 'active';
    if (entry.number == null && shirt != null) entry.number = shirt;
  } else {
    p.teams = [...(p.teams ?? []), { teamCode: member.code, teamType: 'national', number: shirt ?? null, from: null, to: null, status: 'active', teamId: member.id }];
  }
}

const report = { merged: 0, created: 0, skipped: 0, generatedFirstNames: 0 };

for (const r of csvRows) {
  const member = pesToMember.get(String(r.Country).trim());
  if (!member) {
    report.skipped++;
    continue;
  }
  const natNorm = norm(member.code);

  const entry = teamsById.get(String(r.Id).trim()) ?? teamsByCountryName.get(norm(member.name))?.get(norm(r.Name));
  const fullName = entry?.name && entry.name.trim() !== '' ? entry.name : r.Name;
  const { firstName, lastName, initial } = splitName(fullName);
  const resolvedFirst = firstName ? cleanCase(firstName) : null;
  const resolvedLast = cleanLastName(lastName);

  const sn = norm(lastName);
  const candidates = (byNat.get(natNorm) ?? []).filter((p) => !p.__consumed && surnameOf(p) === sn);

  let p;
  if (candidates.length === 1) {
    p = candidates[0];
    report.merged++;
  } else {
    p = {
      id: nextId++,
      firstName: resolvedFirst,
      lastName: resolvedLast,
      position: TO_OUR[PES_POS[Number(r.POS)]] ?? 'CF',
      nationality: member.code,
      nationalityId: member.id,
      age: Number(r.Age) || undefined,
      height: Number(r.Height) || undefined,
      foot: r.Foot === 'True' ? 'left' : 'right',
      form: Math.round(((Number(r.Form) || 1) - 1) * 100 / 7),
      playingStyle: PLAYING_STYLES[Number(r.PlayingStyle)],
      positions: computePositions(r, TO_OUR[PES_POS[Number(r.POS)]] ?? 'CF'),
      pesId: Number(r.Id) || undefined,
      skills: deriveSkills(r),
      teams: [],
    };
    if (!p.firstName) p.__initial = initial ?? null;
    players.push(p);
    report.created++;
  }

  p.__consumed = true;

  // Actualizar campos del CSV sobre el jugador (merged o recién creado).
  const legacyInitial = /^([A-Za-z])\./.test(p.name ?? '') ? p.name[0] : null;
  p.firstName = resolvedFirst ?? p.firstName ?? null;
  p.__initial = p.__initial ?? initial ?? (p.firstName ? null : legacyInitial);
  p.lastName = resolvedLast;
  p.position = TO_OUR[PES_POS[Number(r.POS)]] ?? 'CF';
  p.nationality = member.code;
  p.nationalityId = member.id;
  p.age = Number(r.Age) || p.age;
  p.height = Number(r.Height) || p.height;
  p.foot = r.Foot === 'True' ? 'left' : 'right';
  p.form = Math.round(((Number(r.Form) || 1) - 1) * 100 / 7);
  p.playingStyle = PLAYING_STYLES[Number(r.PlayingStyle)];
  p.positions = computePositions(r, p.position);
  p.pesId = Number(r.Id) || undefined;
  p.skills = deriveSkills(r);
  ensureNationalEntry(p, member, entry?.shirt);
}

// Generar firstName para los que aún no tienen (también legacy fuera del CSV).
for (const p of players) {
  if (!p.lastName || !p.firstName) {
    if (!p.lastName) {
      const legacy = splitName(p.name);
      p.lastName = cleanLastName(legacy.lastName);
      if (!p.firstName && legacy.firstName) p.firstName = cleanCase(legacy.firstName);
      if (!p.firstName && !p.__initial) p.__initial = legacy.initial;
    }
    if (!p.firstName) {
      p.firstName = generateGivenName(p.nationality, p.__initial ?? null, p.lastName, p.id);
      report.generatedFirstNames++;
    }
  }
  p.firstName = p.firstName ?? '';
  p.lastName = p.lastName ?? '';
  delete p.name;
  delete p.__initial;
  delete p.__consumed;
}

players.sort((a, b) => a.id - b.id);

console.log(`CSV: ${csvRows.length} filas | teams_data: ${teamsEntries.length} | merged: ${report.merged} | created: ${report.created} | skipped: ${report.skipped}`);
console.log(`Total jugadores: ${players.length} | firstName generados: ${report.generatedFirstNames}`);

if (dryRun) {
  console.log('(dry-run: no se escribe)');
  process.exit(0);
}

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2) + '\n', 'utf8');
console.log(`Escrito: ${PLAYERS_PATH}`);
