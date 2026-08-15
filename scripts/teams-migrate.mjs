import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const write = (p, data) =>
  writeFileSync(join(root, p), JSON.stringify(data, null, 2) + '\n', 'utf8');

// ---------------------------------------------------------------------------
// 1. Renumeración determinista de members y clubs (ids globales únicos)
// ---------------------------------------------------------------------------
const members = read('src/data/members.json');
const clubs = read('src/data/clubs/clubs.json');

// Mismo orden que produce getMembers(): file order estable ordenado por id.
const memberOrder = Object.entries(members).sort((a, b) => a[1].id - b[1].id);

const memberByCode = new Map();
const memberByName = new Map();
for (const [slug, x] of Object.entries(members)) {
  if (x.code) memberByCode.set(x.code, x);
  memberByName.set(x.name, x);
}

// nextId itera toda la secuencia global (miembros primero, luego clubes).
let nextId = 1;
const oldToNewMember = new Map();
for (const [, x] of memberOrder) {
  oldToNewMember.set(x.id, nextId);
  if (!Number.isInteger(x.id) || x.id >= 10000) {
    // los 9999 marcaban "sin id asignado": se reasigna y se documenta.
  }
  x.id = nextId++;
}
write('src/data/members.json', members);

for (const club of clubs) {
  club.id = nextId++;
}
write('src/data/clubs/clubs.json', clubs);

console.log(`Renumerados: members=${memberOrder.length} clubs=${clubs.length} (secuencia global 1..${nextId - 1})`);

// ---------------------------------------------------------------------------
// Índice global: code/name -> { id, type }
// ---------------------------------------------------------------------------
const teamById = new Map();
const teamByCode = new Map();
const teamByName = new Map();
for (const [slug, x] of Object.entries(members)) {
  teamById.set(x.id, { id: x.id, type: 'national', slug });
  if (x.code) teamByCode.set(x.code.toLowerCase(), x.id);
  teamByName.set(x.name.toLowerCase(), x.id);
}
for (const club of clubs) {
  teamById.set(club.id, { id: club.id, type: 'club', code: club.code });
  if (club.code) teamByCode.set(club.code.toLowerCase(), club.id);
  teamByName.set(club.name.toLowerCase(), club.id);
}

const resolveTeam = (code, name) => {
  if (code && teamByCode.has(code.toLowerCase())) return teamByCode.get(code.toLowerCase());
  return teamByName.get(name.toLowerCase()) ?? null;
};

// ---------------------------------------------------------------------------
// 2. Matches: team1Id/team2Id
// ---------------------------------------------------------------------------
for (const f of ['2020', '2022', '2024', '2026']) {
  const path = `src/data/matches/forest-cup-${f}.json`;
  const matches = read(path);
  for (const m of matches) {
    m.team1Id = resolveTeam(m.team1Code, m.team1);
    m.team2Id = resolveTeam(m.team2Code, m.team2);
  }
  write(path, matches);
}

// ---------------------------------------------------------------------------
// 3. Tournaments: hostId / championId / pots teamIds / prizes teamId
// ---------------------------------------------------------------------------
const noResolve = [];
const tournaments = read('src/data/tournaments.json');
for (const t of Object.values(tournaments)) {
  t.hostId = resolveTeam(t.hostCode, t.host);
  t.championId = resolveTeam(t.championCode, t.champion);
  for (const pot of t.pots ?? []) {
    pot.teamIds = (pot.teamCodes ?? pot.teams ?? []).map((name, i) => {
      const code = pot.teamCodes?.[i];
      return resolveTeam(code, name);
    });
  }
  for (const prize of Object.entries(t.prizes ?? {})) {
    const [, values] = prize;
    if (Array.isArray(values)) {
      for (const v of values) {
        v.teamId = resolveTeam(undefined, v.team);
        if (!v.teamId) noResolve.push(`prize ${t.name} ${prize[0]}: ${v.team}`);
      }
    } else if (values?.team) {
      values.teamId = resolveTeam(undefined, values.team);
      if (!values.teamId) noResolve.push(`prize ${t.name} ${prize[0]}: ${values.team}`);
    }
  }
}
write('src/data/tournaments.json', tournaments);

// ---------------------------------------------------------------------------
// 4. Leagues: clubId por club name/code
// ---------------------------------------------------------------------------
const leagues = read('src/data/leagues/leagues.json');
for (const league of Object.values(leagues)) {
  for (const row of league.standings ?? []) {
    row.clubId = resolveTeam(row.clubCode, row.club);
  }
}
write('src/data/leagues/leagues.json', leagues);

// ---------------------------------------------------------------------------
// 5. Players: teams[].teamId + nationality -> id global
// ---------------------------------------------------------------------------
const playerPath = 'src/data/players/players.json';
const players = read(playerPath);
for (const p of players) {
  p.nationalityId = resolveTeam(p.nationality, undefined);
  for (const t of p.teams ?? []) {
    t.teamId = resolveTeam(t.teamCode, undefined);
  }
}
write(playerPath, players);

// ---------------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------------
if (noResolve.length > 0) {
  console.error('Sin resolver (tournaments prizes):');
  for (const r of noResolve) console.error('  ' + r);
} else {
  console.log('OK: tournaments prizes resuelven por club/member.');
}

// Validación de unicidad global
const seen = new Map();
for (const [slug, x] of Object.entries(members)) seen.set(x.id, `member/${slug}`);
for (const c of clubs) {
  if (seen.has(c.id)) {
    console.error(`COLISIÓN: club ${c.name} id ${c.id} ya lo tiene ${seen.get(c.id)}`);
    process.exit(1);
  }
  seen.set(c.id, `club/${c.code}`);
}
console.log(`Unicidad global OK (${seen.size} ids).`);