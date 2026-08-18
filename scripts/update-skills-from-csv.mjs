// Actualiza las skills de los jugadores importados (con pesId) desde el CSV PES correcto
// "Players FC26 Pre edit ingame.csv" (el CSV original del import estaba mal).
// Deriva las 22 skills de rendimiento + injuryResistance (mismo mapeo que import-pes-players.mjs),
// reescala PES 40-99 → nuestro 10-90 y sobreescribe players.json.
// Legacy sin pesId no se tocan.
// Uso: node scripts/update-skills-from-csv.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PLAYERS_PATH = path.join(root, 'src/data/players/players.json');

const CSV_PATH =
  'D:/HMH/Forest/Forest Cup 2026/generador/PES_2021_Generator/Teams/Players FC26 Pre edit ingame.csv';

const dryRun = process.argv.includes('--dry-run');

const PERFORMANCE_SKILLS = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
];

const num = (v) => Number(v) || 0;
const avg = (...vs) => Math.round(vs.reduce((a, b) => a + b, 0) / vs.length);
const rescale = (v) => Math.round(10 + (v - 40) * (80 / 59));

// Mapeo aprobado (ver docs/FFC-Website/11-migracion-jugadores-pes §3).
function deriveSkills(r) {
  const ir = { 1: 30, 2: 60, 3: 90 }[num(r.InjuryResistance)] ?? 60;
  const skills = {
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
  for (const skill of PERFORMANCE_SKILLS) skills[skill] = rescale(skills[skill]);
  return skills;
}

// ── Parseo CSV (mismo parser que import-pes-players.mjs) ──
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
const rows = csvLines.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
const byId = new Map(rows.map((r) => [r.Id, r]));
console.log(`CSV: ${rows.length} filas`);

const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));
let updated = 0;
let notFound = 0;
for (const p of players) {
  if (!p.pesId) continue;
  const row = byId.get(String(p.pesId));
  if (!row) {
    notFound++;
    continue;
  }
  p.skills = deriveSkills(row);
  updated++;
}

console.log(`Jugadores con pesId actualizados: ${updated} | sin fila en CSV: ${notFound}`);

if (dryRun) {
  console.log('(dry-run: no se escribe)');
  process.exit(0);
}

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2) + '\n', 'utf8');
console.log(`Escrito: ${PLAYERS_PATH}`);
