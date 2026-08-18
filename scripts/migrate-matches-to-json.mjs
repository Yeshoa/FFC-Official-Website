import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const membersDir = path.join(rootDir, 'src', 'content', 'members');
const matchesSourceDir = path.join(rootDir, 'src', 'content', '_legacy-matches');
const matchesOutputDir = path.join(rootDir, 'src', 'data', 'matches');

function extractFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  return yaml.load(match[1]) ?? {};
}

async function walkFiles(directory, extension, acc = []) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, extension, acc);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(extension)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

async function buildMemberCodeMap() {
  const memberFiles = await walkFiles(membersDir, '.md');
  const memberMap = new Map();

  for (const filePath of memberFiles) {
    const raw = await readFile(filePath, 'utf8');
    const data = extractFrontmatter(raw);
    if (typeof data?.name === 'string' && typeof data?.code === 'string') {
      memberMap.set(data.name, data.code);
    }
  }

  return memberMap;
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  return value;
}

async function main() {
  const memberCodes = await buildMemberCodeMap();
  const matchFiles = await walkFiles(matchesSourceDir, '.md');

  await rm(matchesOutputDir, { recursive: true, force: true });
  const matchesByEdition = new Map();

  for (const filePath of matchFiles) {
    const raw = await readFile(filePath, 'utf8');
    const data = extractFrontmatter(raw);

    data.date = normalizeDate(data.date);

    if (typeof data.team1 === 'string') {
      data.team1Code = memberCodes.get(data.team1);
    }

    if (typeof data.team2 === 'string') {
      data.team2Code = memberCodes.get(data.team2);
    }

    const editionKey = `forest-cup-${data.date instanceof Date ? data.date.getUTCFullYear() : new Date(data.date).getUTCFullYear()}`;
    const editionMatches = matchesByEdition.get(editionKey) ?? [];
    editionMatches.push(data);
    matchesByEdition.set(editionKey, editionMatches);
  }

  for (const [editionKey, editionMatches] of matchesByEdition.entries()) {
    editionMatches.sort((a, b) => {
      if (typeof a.match_id === 'number' && typeof b.match_id === 'number') {
        return a.match_id - b.match_id;
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const targetPath = path.join(matchesOutputDir, `${editionKey}.json`);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, `${JSON.stringify(editionMatches, null, 2)}\n`, 'utf8');
  }

  const outputStats = await stat(matchesOutputDir);
  if (!outputStats.isDirectory()) {
    throw new Error('The matches output directory was not created.');
  }

  console.log(`Converted ${matchFiles.length} match files to JSON.`);
}

await main();
