import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const strict = process.argv.includes('--strict');

// Códigos alias legados que NO existen como code canónico en members/clubs,
// pero que la migración D1 resolvió por nombre (ver docs/FFC-Website/08-plan-implementacion.md, Fase D1).
const LEGACY_ALIAS_CODES = new Set(['XVND', 'RUI', 'XOWN', 'XCHI', 'AKE', 'TRZ', 'ROL']);

const members = read('src/data/members.json');
const clubs = read('src/data/clubs/clubs.json');
const matchesByYear = {
  2020: read('src/data/matches/forest-cup-2020.json'),
  2022: read('src/data/matches/forest-cup-2022.json'),
  2024: read('src/data/matches/forest-cup-2024.json'),
  2026: read('src/data/matches/forest-cup-2026.json'),
};
const tournaments = read('src/data/tournaments.json');
const leagues = read('src/data/leagues/leagues.json');
const players = read('src/data/players/players.json');

const errors = [];
const warnings = [];
const fail = (msg) => {
  errors.push(msg);
  console.error(`  ERROR: ${msg}`);
};
const warn = (msg) => {
  warnings.push(msg);
  console.warn(`  warn: ${msg}`);
};

// ---------------------------------------------------------------------------
// 1. Unicidad global de ids entre members.json y clubs.json
// ---------------------------------------------------------------------------
console.log('[1/4] Unicidad global de ids (members + clubs)...');

const teamById = new Map();
const teamByCode = new Map();
const seenIds = new Map();

for (const [slug, x] of Object.entries(members)) {
  if (!Number.isInteger(x.id)) fail(`member/${slug}: id ${x.id} no es entero`);
  else if (seenIds.has(x.id)) fail(`member/${slug}: id ${x.id} duplicado con ${seenIds.get(x.id)}`);
  else seenIds.set(x.id, `member/${slug}`);
  teamById.set(x.id, { type: 'national', slug });
  if (x.code) {
    const key = x.code.toLowerCase();
    if (teamByCode.has(key)) warn(`código duplicado entre members: ${x.code}`);
    teamByCode.set(key, x.id);
  }
}

for (const c of clubs) {
  if (!Number.isInteger(c.id)) fail(`club/${c.code}: id ${c.id} no es entero`);
  else if (seenIds.has(c.id)) fail(`club/${c.code}: id ${c.id} duplicado con ${seenIds.get(c.id)}`);
  else seenIds.set(c.id, `club/${c.code}`);
  teamById.set(c.id, { type: 'club', code: c.code });
  if (c.code) {
    const key = c.code.toLowerCase();
    if (teamByCode.has(key)) warn(`código duplicado entre clubs: ${c.code}`);
    teamByCode.set(key, c.id);
  }
}

console.log(`  Unicidad global: ${seenIds.size} ids (members=${Object.keys(members).length}, clubs=${clubs.length}).`);

// ---------------------------------------------------------------------------
// 2. Referencias huérfanas en matches (team1Id/team2Id)
// ---------------------------------------------------------------------------
console.log('[2/4] Referencias huérfanas en matches...');

const isOrphan = (id, ctx) => {
  if (id === null || id === undefined) return;
  if (!teamById.has(id)) fail(`${ctx}: id ${id} no corresponde a ningún miembro/club`);
};

for (const [year, matches] of Object.entries(matchesByYear)) {
  for (const m of matches) {
    const ctx = `match ${year}/${m.match_id ?? m.team1}-${m.team2}`;
    isOrphan(m.team1Id, `${ctx} team1Id`);
    isOrphan(m.team2Id, `${ctx} team2Id`);
    for (const side of ['team1', 'team2']) {
      const code = m[`${side}Code`];
      const id = m[`${side}Id`];
      if (code && !teamByCode.has(code.toLowerCase()) && !LEGACY_ALIAS_CODES.has(code.toUpperCase())) {
        warn(`${ctx} ${side}Code "${code}" no está en members/clubs`);
      }
      if (code && teamById.has(id)) {
        const expected = teamByCode.get(code.toLowerCase());
        if (expected !== undefined && expected !== id) {
          fail(`${ctx}: ${side}Code "${code}" -> id ${expected}, pero ${side}Id= ${id}`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Referencias huérfanas en tournaments, leagues y players
// ---------------------------------------------------------------------------
console.log('[3/4] Referencias en tournaments/leagues/players...');

for (const [slug, t] of Object.entries(tournaments)) {
  isOrphan(t.hostId, `tournament ${slug} hostId`);
  isOrphan(t.championId, `tournament ${slug} championId`);
  for (const pot of t.pots ?? []) {
    for (const id of pot.teamIds ?? []) isOrphan(id, `tournament ${slug} pot ${pot.pot} teamId`);
  }
  for (const [prizeName, values] of Object.entries(t.prizes ?? {})) {
    if (Array.isArray(values)) {
      for (const v of values) isOrphan(v.teamId, `tournament ${slug} ${prizeName} teamId`);
    } else if (values?.teamId !== undefined && values.teamId !== null) {
      isOrphan(values.teamId, `tournament ${slug} ${prizeName} teamId`);
    }
  }
}

for (const [fed, league] of Object.entries(leagues)) {
  for (const row of league.standings ?? []) {
    isOrphan(row.clubId, `league ${fed} ${row.club} clubId`);
    if (row.clubCode && !teamByCode.has(row.clubCode.toLowerCase())) {
      warn(`league ${fed} ${row.club}: clubCode "${row.clubCode}" no está en clubs`);
    }
  }
}

for (const p of players) {
  isOrphan(p.nationalityId, `player ${p.id} ${p.name} nationalityId`);
  for (const t of p.teams ?? []) isOrphan(t.teamId, `player ${p.id} ${p.name} teams[].teamId`);
}

// ---------------------------------------------------------------------------
// 4. Códigos usados en data que no resuelven a ningún equipo
// ---------------------------------------------------------------------------
console.log('[4/4] Códigos sin mapear...');

const allCodes = new Set([...teamByCode.keys()]);
for (const [, matches] of Object.entries(matchesByYear)) {
  for (const m of matches) {
    if (m.team1Code && !allCodes.has(m.team1Code.toLowerCase()) && !LEGACY_ALIAS_CODES.has(m.team1Code.toUpperCase())) {
      warn(`match con team1Code "${m.team1Code}" sin miembro/club`);
    }
    if (m.team2Code && !allCodes.has(m.team2Code.toLowerCase()) && !LEGACY_ALIAS_CODES.has(m.team2Code.toUpperCase())) {
      warn(`match con team2Code "${m.team2Code}" sin miembro/club`);
    }
  }
}

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\nFALLÓ: ${errors.length} error(es).`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(`\nOK con ${warnings.length} advertencia(s).`);
  if (strict) {
    console.error('--strict: advertencias tratadas como errores.');
    process.exit(1);
  }
} else {
  console.log('\nOK: ids globales únicos y todas las referencias resuelven.');
}