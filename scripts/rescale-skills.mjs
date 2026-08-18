// Reescala las skills de rendimiento de los jugadores con pesId (del CSV PES).
// PES usa escala 40-99; la nuestra es 0-100. Mapeo 40→10 y 99→90 (lineal), dejando
// 90+ y <10 libres (buffer para el simulador y futuras leyendas).
// injuryResistance NO se toca (ya está en escala nuestra: 30/60/90).
// Legacy sin pesId NO se toca (skills ya en escala nuestra).
// Uso: node scripts/rescale-skills.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PLAYERS_PATH = path.join(root, 'src/data/players/players.json');

const dryRun = process.argv.includes('--dry-run');

const PERFORMANCE_SKILLS = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
];

const rescale = (v) => Math.round(10 + (v - 40) * (80 / 59));

const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));
let changed = 0;
for (const p of players) {
  if (!p.pesId || !p.skills) continue;
  for (const skill of PERFORMANCE_SKILLS) {
    const v = p.skills[skill];
    if (typeof v === 'number' && v >= 40) {
      p.skills[skill] = rescale(v);
      changed++;
    }
  }
}

// Verificación: rango de las skills de rendimiento reescaladas.
const values = [];
for (const p of players) {
  if (!p.pesId || !p.skills) continue;
  for (const skill of PERFORMANCE_SKILLS) {
    const v = p.skills[skill];
    if (typeof v === 'number') values.push(v);
  }
}
console.log(`Jugadores con pesId reescalados. Skills de rendimiento: min=${Math.min(...values)} max=${Math.max(...values)} (rango esperado 10-90)`);

if (dryRun) {
  console.log('(dry-run: no se escribe)');
  process.exit(0);
}

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2) + '\n', 'utf8');
console.log(`Escrito: ${PLAYERS_PATH}`);
