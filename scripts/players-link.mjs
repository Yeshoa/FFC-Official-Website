// players:link — autocompleta playerId/assistId (y demás referencias a jugador)
// en los JSON de partidos resolviendo por equipo + nombre, y valida consistencia.
//
// Uso (scripts npm; en este repo npm no reenvía `--` a node, usar los aliases):
//   npm run players:link             # autocompleta + valida (pregunta ante homónimos)
//   npm run players:link:dry         # solo reporta, no escribe nada
//   npm run players:link:strict      # CI: falla si quedan referencias sin resolver
//   node scripts/players-link.mjs --dry-run / --strict   # equivalencias directas
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const players = JSON.parse(readFileSync(join(root, 'src/data/players/players.json'), 'utf8'));
const members = Object.values(JSON.parse(readFileSync(join(root, 'src/data/members.json'), 'utf8')));
const clubs = JSON.parse(readFileSync(join(root, 'src/data/clubs/clubs.json'), 'utf8'));

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const dryRun = args.includes('--dry-run');
const interactive = process.stdin.isTTY && !strict;

// Normalización para comparar nombres sin acentos, mayúsculas ni espacios.
const norm = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Nombre compuesto del jugador (antes campo `name`, ahora derivado de firstName/lastName).
const playerNameOf = (p) => [p.firstName, p.lastName].filter(Boolean).join(' ');

// ── Índices ──────────────────────────────────────────────────────────────
const byTeamId = new Map();
const byTeamCode = new Map();
for (const p of players) {
  for (const t of p.teams ?? []) {
    if (t.teamId != null) {
      const list = byTeamId.get(t.teamId) ?? [];
      list.push(p);
      byTeamId.set(t.teamId, list);
    }
    if (t.teamCode) {
      const key = norm(t.teamCode);
      const list = byTeamCode.get(key) ?? [];
      list.push(p);
      byTeamCode.set(key, list);
    }
  }
}

const memberByName = new Map();
const memberByCode = new Map();
for (const m of members) {
  memberByName.set(norm(m.name), m);
  if (m.code) memberByCode.set(norm(m.code), m);
}
const clubByName = new Map();
const clubByCode = new Map();
for (const c of clubs) {
  clubByName.set(norm(c.name), c);
  if (c.code) clubByCode.set(norm(c.code), c);
}

// ── Resolución de equipo ─────────────────────────────────────────────────
// Dado un partido y la etiqueta de equipo de una entrada (gol/tarjeta/...),
// devuelve el lado del partido (o un equipo externo) con id global + code.
function resolveTeam(match, teamLabel) {
  const n = norm(teamLabel);
  const sides = [
    {
      side: 'team1', id: match.team1Id, code: match.team1Code,
      name: match.team1, type: match.team1Type ?? 'national',
    },
    {
      side: 'team2', id: match.team2Id, code: match.team2Code,
      name: match.team2, type: match.team2Type ?? 'national',
    },
  ];
  const byName = sides.find((s) => s.name && norm(s.name) === n);
  if (byName) return byName;
  const byCode = sides.find((s) => s.code && norm(s.code) === n);
  if (byCode) return byCode;

  const mByName = memberByName.get(n);
  if (mByName) return { id: mByName.id, code: mByName.code, name: mByName.name, type: 'national' };
  const mByCode = memberByCode.get(n);
  if (mByCode) return { id: mByCode.id, code: mByCode.code, name: mByCode.name, type: 'national' };
  const cByName = clubByName.get(n);
  if (cByName) return { id: cByName.id, code: cByName.code, name: cByName.name, type: 'club' };
  const cByCode = clubByCode.get(n);
  if (cByCode) return { id: cByCode.id, code: cByCode.code, name: cByCode.name, type: 'club' };
  return null;
}

// Entrada de teams[] de un jugador que corresponde al equipo dado.
function teamEntry(player, teamRef) {
  if (!teamRef) return null;
  if (teamRef.id != null) {
    return (player.teams ?? []).find((t) => t.teamId === teamRef.id) ?? null;
  }
  if (teamRef.code) {
    const c = norm(teamRef.code);
    return (player.teams ?? []).find((t) => t.teamCode && norm(t.teamCode) === c) ?? null;
  }
  return null;
}

// Plantel activo del equipo según players.json (id global primero, code de fallback).
function rosterOf(teamRef) {
  if (!teamRef) return [];
  let roster = teamRef.id != null ? (byTeamId.get(teamRef.id) ?? []) : [];
  if (roster.length === 0 && teamRef.code) roster = byTeamCode.get(norm(teamRef.code)) ?? [];
  return roster;
}

// ── Reporte ──────────────────────────────────────────────────────────────
const report = {
  auto: { goals: 0, assists: 0, cards: 0, penalties: 0, subsOut: 0, subsIn: 0, lineup: 0 },
  homonymsResolved: 0,
  homonymsSkipped: 0,
  noRoster: 0,
  noMatch: 0,
  noTeam: 0,
  unresolved: [], // referencias con nombre pero sin id (bloquean --strict)
};
const fileChanges = new Map(); // archivo -> descripción de lo escrito

function bumpAuto(key) {
  report.auto[key]++;
}

// Resuelve una referencia: autocompleta si hay 1 candidato exacto; ante
// homónimos pregunta (modo interactivo) o lo deja pendiente.
async function resolveRef(file, ctx, teamRef, playerName, assign) {
  if (!playerName || !norm(playerName)) return;

  if (!teamRef) {
    report.noTeam++;
    report.unresolved.push({ file, ctx, team: null, name: playerName, reason: 'equipo sin resolver' });
    console.warn(`  ? ${ctx}: equipo "${playerName}" no se pudo resolver en "${file}"`);
    return;
  }

  const roster = rosterOf(teamRef);
  if (roster.length === 0) {
    report.noRoster++;
    report.unresolved.push({ file, ctx, team: teamRef.name, name: playerName, reason: 'equipo sin plantel en players.json' });
    console.warn(`  ? ${ctx}: "${teamRef.name}" no tiene jugadores en players.json`);
    return;
  }

  const q = norm(playerName);
  const matches = (p) => {
    const full = norm(playerNameOf(p));
    const last = norm(p.lastName ?? '');
    if (full === q) return true;
    if (last === '') return false;
    if (last === q) return true;
    const refTokens = q.split(' ').filter(Boolean);
    return refTokens[refTokens.length - 1] === last;
  };
  let exact = roster.filter(matches);
  // Desempate de homónimos por inicial de la ref ("O. Vydra" → Ote Vydra, no Lutra).
  if (exact.length > 1) {
    const refInitial = (q.match(/^([a-z])\. /) || [])[1] ?? null;
    if (refInitial) {
      const byInitial = exact.filter((p) => norm(p.firstName ?? '')[0] === refInitial);
      if (byInitial.length > 0) exact = byInitial;
    }
  }

  if (exact.length === 1) {
    assign(String(exact[0].id));
    return;
  }

  if (exact.length > 1) {
    const lines = exact
      .map((p) => {
        const te = teamEntry(p, teamRef);
        return `    ${p.id} · ${playerNameOf(p)} · ${p.position} · dorsal ${te?.number ?? 'sin dorsal'} · ${te?.status ?? '?'}`;
      })
      .join('\n');
    if (interactive) {
      const ans = (await ask(`\n  [homónimo] ${ctx}: "${playerName}" tiene ${exact.length} jugadores en ${teamRef.name}:\n${lines}\n  Elegí el id (o Enter para saltear): `)).trim();
      const picked = exact.find((p) => p.id === Number(ans));
      if (picked) {
        assign(String(picked.id));
        report.homonymsResolved++;
        return;
      }
    } else {
      console.warn(`  ! [homónimo] ${ctx}: "${playerName}" -> ${exact.map((p) => p.id + ':' + playerNameOf(p)).join(', ')}`);
    }
    report.homonymsSkipped++;
    report.unresolved.push({ file, ctx, team: teamRef.name, name: playerName, reason: 'homónimo sin resolver', candidates: exact.map((p) => p.id + ' ' + playerNameOf(p)) });
    return;
  }

  report.noMatch++;
  const suggestions = roster.filter((p) => {
    const n = norm(playerNameOf(p));
    return n !== q && (n.includes(q) || q.includes(n));
  });
  report.unresolved.push({
    file, ctx, team: teamRef.name, name: playerName, reason: 'sin match',
    suggestions: suggestions.map((p) => p.id + ':' + playerNameOf(p)),
  });
  const hint = suggestions.length > 0 ? ` (¿quizás ${suggestions.map((p) => p.id + ':' + playerNameOf(p)).join(', ')}?)` : '';
  console.warn(`  ? ${ctx}: "${playerName}" no matchea ningún jugador de ${teamRef.name}${hint}`);
}

// ── Procesamiento de partidos ────────────────────────────────────────────
const matchesDir = join(root, 'src/data/matches');
const files = readdirSync(matchesDir).filter((f) => f.endsWith('.json'));

const rl = createInterface({ input: process.stdin, output: process.stdout });
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

if (!dryRun) console.log('Autocompletando playerId/assistId en partidos...');

// Escribe el JSON preservando los saltos de línea originales del archivo (CRLF/LF).
function writeJson(filePath, data, originalRaw) {
  const json = JSON.stringify(data, null, 2) + '\n';
  const text = originalRaw.includes('\r\n') ? json.replace(/\n/g, '\r\n') : json;
  writeFileSync(filePath, text);
}

for (const f of files) {
  const filePath = join(matchesDir, f);
  const raw = readFileSync(filePath, 'utf8');
  const matches = JSON.parse(raw);
  let changed = false;
  const stats = { goals: 0, assists: 0, cards: 0, penalties: 0, subsOut: 0, subsIn: 0, lineup: 0 };

  for (const m of matches) {
    const sides = {
      team1: { id: m.team1Id, code: m.team1Code, name: m.team1, type: m.team1Type ?? 'national' },
      team2: { id: m.team2Id, code: m.team2Code, name: m.team2, type: m.team2Type ?? 'national' },
    };

    for (const g of m.goals ?? []) {
      if (g.player && !g.playerId) {
        const team = resolveTeam(m, g.team);
        await resolveRef(f, `gol "${g.player}" (${g.minute ?? '?'}')`, team, g.player, (v) => {
          g.playerId = v; changed = true; stats.goals++; bumpAuto('goals');
        });
      }
      if (g.assist && !g.assistId) {
        const team = resolveTeam(m, g.team);
        await resolveRef(f, `asistencia "${g.assist}" (gol de ${g.player ?? '?'})`, team, g.assist, (v) => {
          g.assistId = v; changed = true; stats.assists++; bumpAuto('assists');
        });
      }
    }
    for (const c of m.cards ?? []) {
      if (c.player && !c.playerId) {
        const team = resolveTeam(m, c.team);
        await resolveRef(f, `tarjeta "${c.player}" (${c.minute}' ${c.type})`, team, c.player, (v) => {
          c.playerId = v; changed = true; stats.cards++; bumpAuto('cards');
        });
      }
    }
    for (const p of m.penalties ?? []) {
      if (p.player && !p.playerId) {
        const team = resolveTeam(m, p.team);
        await resolveRef(f, `penal "${p.player}"`, team, p.player, (v) => {
          p.playerId = v; changed = true; stats.penalties++; bumpAuto('penalties');
        });
      }
    }
    for (const s of m.substitutions ?? []) {
      const team = resolveTeam(m, s.team);
      if (s.playerOut && !s.playerOutId) {
        await resolveRef(f, `cambio sale "${s.playerOut}" (${s.minute}')`, team, s.playerOut, (v) => {
          s.playerOutId = v; changed = true; stats.subsOut++; bumpAuto('subsOut');
        });
      }
      if (s.playerIn && !s.playerInId) {
        await resolveRef(f, `cambio entra "${s.playerIn}" (${s.minute}')`, team, s.playerIn, (v) => {
          s.playerInId = v; changed = true; stats.subsIn++; bumpAuto('subsIn');
        });
      }
    }
    for (const side of ['team1', 'team2']) {
      for (const pl of m.lineup?.[side]?.players ?? []) {
        if (pl.name && !pl.playerId) {
          await resolveRef(f, `lineup ${side} "${pl.name}"`, sides[side], pl.name, (v) => {
            pl.playerId = v; changed = true; stats.lineup++; bumpAuto('lineup');
          });
        }
      }
    }
  }

  if (changed) {
    const desc = Object.entries(stats)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${n} ${k}`)
      .join(', ');
    fileChanges.set(f, desc);
    if (!dryRun) writeJson(filePath, matches, raw);
  }
}
rl.close();

// ── Validación de huérfanos (ids que no apuntan a ningún jugador) ────────
const idSet = new Set(players.map((p) => p.id));
const orphanIds = new Map(); // id -> context[]
const isOrphan = (id, ctx) => {
  if (!id) return;
  const n = Number(id);
  if (Number.isNaN(n) || !idSet.has(n)) {
    orphanIds.set(id, [...(orphanIds.get(id) ?? []), ctx]);
  }
};

for (const f of files) {
  const matches = JSON.parse(readFileSync(join(matchesDir, f), 'utf8'));
  for (const m of matches) {
    for (const g of m.goals ?? []) {
      isOrphan(g.playerId, `${f} gol`);
      isOrphan(g.assistId, `${f} asistencia`);
    }
    for (const c of m.cards ?? []) isOrphan(c.playerId, `${f} tarjeta`);
    for (const p of m.penalties ?? []) isOrphan(p.playerId, `${f} penal`);
    for (const s of m.substitutions ?? []) {
      isOrphan(s.playerOutId, `${f} sustitucion out`);
      isOrphan(s.playerInId, `${f} sustitucion in`);
    }
    for (const side of ['team1', 'team2']) {
      for (const pl of m.lineup?.[side]?.players ?? []) isOrphan(pl.playerId, `${f} lineup`);
    }
  }
}

// ── Regla: todas las skills, sin importar la posición ────────────────────
const ALL_SKILLS = [
  'shortRange', 'mediumRange', 'longRange', 'heading',
  'pace', 'agility', 'stamina', 'jumping',
  'dribbling', 'fakes', 'ballControl',
  'stability', 'positioning', 'vision',
  'tackling', 'sliding', 'clearing', 'power',
  'reflexes', 'gkPositioning', 'stretch', 'saveClose', 'catch',
  'injuryResistance',
];

const missingSkills = players.filter((p) =>
  ALL_SKILLS.some((s) => typeof p.skills?.[s] !== 'number'),
);

// ── Salida ───────────────────────────────────────────────────────────────
for (const [f, desc] of fileChanges) {
  console.log(`  ${dryRun ? '[dry-run] ' : ''}✓ ${f}: ${desc}`);
}

console.log('\nResumen:');
console.log(`  Autocompletados: ${report.auto.goals} playerId + ${report.auto.assists} assistId (goles)` +
  `, ${report.auto.cards} tarjetas, ${report.auto.penalties} penales, ${report.auto.subsOut} subs out, ${report.auto.subsIn} subs in, ${report.auto.lineup} lineup.`);
console.log(`  Homónimos: ${report.homonymsResolved} resueltos, ${report.homonymsSkipped} sin resolver.`);
console.log(`  Sin resolver (con nombre pero sin id): ${report.unresolved.length}` +
  ` (${report.noMatch} sin match, ${report.noRoster} sin plantel, ${report.noTeam} equipo sin resolver).`);

if (orphanIds.size > 0) {
  console.error(`\nERROR: ${orphanIds.size} ids sin jugador en players.json:`);
  for (const [id, ctxs] of orphanIds) {
    console.error(`  ${id} -> ${ctxs.join(', ')}`);
  }
  process.exit(1);
}

if (strict && report.unresolved.length > 0) {
  console.error(`\nSTRICT: ${report.unresolved.length} referencias con nombre pero sin playerId sin resolver.`);
  for (const u of report.unresolved.slice(0, 10)) {
    console.error(`  - ${u.ctx} (${u.reason})${u.suggestions?.length ? `: ${u.suggestions.join(', ')}` : ''}`);
  }
  process.exit(1);
}

if (missingSkills.length > 0) {
  const examples = missingSkills.slice(0, 3).map((p) => `${p.id} ${playerNameOf(p)}`).join(', ');
  const msg = `\nWARN: ${missingSkills.length}/${players.length} jugadores sin TODAS las habilidades: ${examples}...`;
  if (strict) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(msg);
}

console.log(`\nOK: todos los playerId/assistId de ${files.length} archivos resuelven a players.json (${players.length} jugadores).`);
