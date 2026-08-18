// Wrapper del dev server (FFC):
// 1) Mata dev servers huérfanos de ESTE proyecto antes de arrancar (evita que un
//    node colgado con `astro dev` acumule GB de RAM y haga crashear builds nativos).
// 2) Arranca astro directo (spawn sin npm/cmd) → el Ctrl+C se propaga limpio.
// Uso: `npm run dev` (o `node scripts/dev.mjs --port 4799`), `npm run kill:dev` para solo matar.
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = path.join(projectPath, 'node_modules', 'astro', 'astro.js');

// Mata node.exe huérfanos de este proyecto que corran `astro dev`.
// No toca el propio proceso (su cmdline no contiene 'astro') ni a npm ni a otros proyectos.
function killStaleDevServers() {
  const ps = `
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {
      $_.CommandLine -and
      $_.CommandLine.Contains('${projectPath}') -and
      $_.CommandLine -match 'astro' -and
      $_.CommandLine -match 'dev'
    } | ForEach-Object {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
      Write-Output $_.ProcessId
    }
  `;
  try {
    const out = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
    const pids = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (pids.length) {
      console.log(`[dev] killed stale dev servers: ${pids.join(', ')}`);
    } else {
      console.log('[dev] no stale dev servers found');
    }
  } catch {
    console.log('[dev] could not check for stale dev servers (se ignora)');
  }
}

if (process.argv.includes('--kill')) {
  killStaleDevServers();
  process.exit(0);
}

killStaleDevServers();

const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith('--port'));
console.log(`[dev] starting astro dev${portArg ? ` (${portArg})` : ''} ...`);
const child = spawn(process.execPath, [astroBin, 'dev', ...args], { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
