// qualify-cl.mjs: llena los pots del torneo CL actual (última temporada) con los clubes
// clasificados a la Champions League. La clasificación se deriva de las ligas domésticas:
// cada liga define `championsLeaguePositions` (posiciones que clasifican) → clubIds de esas
// posiciones en su `standings`. Escribe `pots[0].teamIds/teamCodes/teams` en tournaments-cl.json.
// Uso: `npm run qualify:cl`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadLeagues() {
  const leaguesDir = path.join(root, 'src/data/leagues');
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.startsWith('division-') && e.name.endsWith('.json')) files.push(full);
    }
  };
  walk(leaguesDir);
  return files.map(loadJson);
}

function loadClubs() {
  const clubsDir = path.join(root, 'src/data/clubs');
  const clubs = [];
  for (const f of fs.readdirSync(clubsDir)) {
    if (f.endsWith('.json')) clubs.push(...loadJson(path.join(clubsDir, f)));
  }
  return clubs;
}

// Clubes clasificados desde las posiciones CL de cada liga.
const qualified = new Set();
for (const league of loadLeagues()) {
  const positions = league.championsLeaguePositions ?? [];
  if (positions.length === 0) continue;
  for (const row of league.standings) {
    if (positions.includes(row.position)) qualified.add(row.clubId);
  }
}

const clubById = new Map(loadClubs().map((c) => [c.id, c]));
const ids = [...qualified].sort((a, b) => a - b);
const names = ids.map((id) => clubById.get(id)?.name ?? `#${id}`);
const codes = ids.map((id) => clubById.get(id)?.code ?? '');

// Torneo CL más reciente.
const tclPath = path.join(root, 'src/data/tournaments-cl.json');
const tcl = loadJson(tclPath);
const latestKey = Object.entries(tcl).sort((a, b) => b[1].season - a[1].season)[0]?.[0];
if (!latestKey) {
  console.log('[qualify:cl] no CL tournament found');
  process.exit(1);
}
const tournament = tcl[latestKey];
tournament.pots = tournament.pots?.length ? tournament.pots : [{ pot: 1, teams: [], teamCodes: [], teamIds: [] }];
tournament.pots[0].teamIds = ids;
tournament.pots[0].teamCodes = codes;
tournament.pots[0].teams = names;

fs.writeFileSync(tclPath, JSON.stringify(tcl, null, 2) + '\n');
console.log(`[qualify:cl] ${ids.length} clubs qualified into ${latestKey} pots[0]: ${names.join(', ')}`);
