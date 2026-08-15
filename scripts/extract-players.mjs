import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const matchesDir = path.join(projectRoot, 'src/data/matches');
const playersDir = path.join(projectRoot, 'src/data/players');
const byTeamDir = path.join(playersDir, 'by-team');
const historicalDir = path.join(playersDir, 'historical');

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(byTeamDir);
ensureDir(historicalDir);

// Read all match files
const getMatchFiles = () => {
  return fs.readdirSync(matchesDir)
    .filter(f => f.endsWith('.json') && f.startsWith('forest-cup-'))
    .map(f => ({
      filename: f,
      path: path.join(matchesDir, f),
      tournament: f.replace('.json', '') // e.g., 'forest-cup-2024'
    }));
};

// Extract tournament year from filename
const getTournamentYear = (tournament) => {
  const match = tournament.match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
};

// Get or create tournament info
const getTournamentInfo = (tournament) => {
  const year = getTournamentYear(tournament);
  const editionMap = {
    'forest-cup-2022': 1,
    'forest-cup-2024': 2,
    'forest-cup-2026': 3,
  };
  
  return {
    tournament,
    year,
    edition: editionMap[tournament] || 0
  };
};

// Extract players from a single match
const extractPlayersFromMatch = (match) => {
  const players = new Map(); // teamCode -> Set of players
  
  const addPlayer = (teamCode, playerName, context = {}) => {
    if (!playerName || typeof playerName !== 'string') return;
    
    const normalized = playerName.trim();
    if (!normalized) return;
    
    if (!players.has(teamCode)) {
      players.set(teamCode, []);
    }
    
    const teamPlayers = players.get(teamCode);
    const existing = teamPlayers.find(p => p.name === normalized);
    
    if (existing) {
      // Merge context info
      existing.contexts = [...new Set([...(existing.contexts || []), context])];
    } else {
      teamPlayers.push({
        name: normalized,
        contexts: [context]
      });
    }
  };
  
  // Extract from goals
  if (match.goals && Array.isArray(match.goals)) {
    match.goals.forEach(goal => {
      if (goal.player) {
        addPlayer(goal.team, goal.player, { type: 'goal', minute: goal.minute });
      }
      if (goal.assist) {
        addPlayer(goal.team, goal.assist, { type: 'assist', minute: goal.minute });
      }
    });
  }
  
  // Extract from cards
  if (match.cards && Array.isArray(match.cards)) {
    match.cards.forEach(card => {
      if (card.player) {
        addPlayer(card.team, card.player, { type: 'card', cardType: card.type, minute: card.minute });
      }
    });
  }
  
  // Extract from substitutions
  if (match.substitutions && Array.isArray(match.substitutions)) {
    match.substitutions.forEach(sub => {
      if (sub.playerOut) {
        addPlayer(sub.team, sub.playerOut, { type: 'substitution', role: 'out', minute: sub.minute });
      }
      if (sub.playerIn) {
        addPlayer(sub.team, sub.playerIn, { type: 'substitution', role: 'in', minute: sub.minute });
      }
    });
  }
  
  // Extract from lineups
  if (match.lineup && match.lineup.team1 && match.lineup.team1.players) {
    const team1Code = match.team1Code || match.team1;
    match.lineup.team1.players.forEach(player => {
      if (player.name) {
        addPlayer(team1Code, player.name, { 
          type: 'lineup', 
          starter: player.starter !== false,
          position: player.position,
          number: player.number 
        });
      }
    });
  }
  
  if (match.lineup && match.lineup.team2 && match.lineup.team2.players) {
    const team2Code = match.team2Code || match.team2;
    match.lineup.team2.players.forEach(player => {
      if (player.name) {
        addPlayer(team2Code, player.name, { 
          type: 'lineup', 
          starter: player.starter !== false,
          position: player.position,
          number: player.number 
        });
      }
    });
  }
  
  return players;
};

// Merge player maps
const mergePlayerMaps = (map1, map2) => {
  const merged = new Map(map1);
  
  for (const [team, players] of map2) {
    if (!merged.has(team)) {
      merged.set(team, []);
    }
    
    const existingPlayers = merged.get(team);
    
    for (const player of players) {
      const existing = existingPlayers.find(p => p.name === player.name);
      if (existing) {
        existing.contexts = [...new Set([...(existing.contexts || []), ...player.contexts])];
      } else {
        existingPlayers.push(player);
      }
    }
  }
  
  return merged;
};

// Generate player ID
const generatePlayerId = (teamCode, index) => {
  return `${teamCode}_${String(index + 1).padStart(3, '0')}`;
};

// Get position from contexts
const inferPosition = (contexts) => {
  for (const ctx of contexts) {
    if (ctx.position) return ctx.position;
  }
  
  // Infer from activity
  for (const ctx of contexts) {
    if (ctx.type === 'goal' || ctx.type === 'assist') return 'FWD';
  }
  
  return null;
};

// Get number from contexts
const inferNumber = (contexts) => {
  for (const ctx of contexts) {
    if (ctx.number) return ctx.number;
  }
  return null;
};

// Normalize team code (use code if available, otherwise derive from name)
const normalizeTeamCode = (code, name) => {
  if (code && code.length <= 5) return code; // Assume 3-letter codes are normalized
  // Otherwise use first 3 letters of name
  return name.substring(0, 3).toUpperCase();
};

// Generate player objects
const generatePlayerObjects = (teamCode, playersList) => {
  return playersList
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((player, index) => ({
      id: generatePlayerId(teamCode, index),
      name: player.name,
      position: inferPosition(player.contexts),
      number: inferNumber(player.contexts),
      status: 'active',
      contexts: player.contexts // for debugging
    }))
    .map(p => {
      // Remove contexts from output
      const { contexts, ...rest } = p;
      return rest;
    });
};

// Main execution
console.log('🔍 Extracting players from match data...\n');

const matchFiles = getMatchFiles();
console.log(`Found ${matchFiles.length} match files:\n`);
matchFiles.forEach(f => console.log(`  - ${f.filename}`));
console.log();

// Read and extract all matches
const allPlayers = new Map(); // teamCode -> players
const playersByTournament = new Map(); // tournament -> (teamCode -> players)

for (const file of matchFiles) {
  console.log(`\n📖 Processing: ${file.filename}`);
  
  const content = fs.readFileSync(file.path, 'utf-8');
  const matches = JSON.parse(content);
  
  console.log(`   Found ${matches.length} matches`);
  
  const tournamentInfo = getTournamentInfo(file.tournament);
  
  // Extract players from all matches in this file
  let matchCount = 0;
  for (const match of matches) {
    const extractedPlayers = extractPlayersFromMatch(match);
    
    // Merge into all-time players
    const merged = mergePlayerMaps(allPlayers, extractedPlayers);
    
    for (const [team, players] of merged) {
      allPlayers.set(team, players);
    }
    
    // Track by tournament
    if (!playersByTournament.has(file.tournament)) {
      playersByTournament.set(file.tournament, new Map());
    }
    
    const tournamentPlayers = playersByTournament.get(file.tournament);
    for (const [team, players] of extractedPlayers) {
      if (!tournamentPlayers.has(team)) {
        tournamentPlayers.set(team, []);
      }
      
      const existing = tournamentPlayers.get(team);
      for (const player of players) {
        const found = existing.find(p => p.name === player.name);
        if (!found) {
          existing.push(player);
        }
      }
    }
    
    matchCount++;
  }
  
  console.log(`   ✓ Extracted players from ${matchCount} matches`);
}

// Generate by-team JSONs (using all-time data)
console.log('\n\n📝 Generating by-team player files...\n');

const teamCodeToName = new Map();
const uniqueTeamCodes = new Set();

// Build team code to name mapping
for (const [_, players] of allPlayers) {
  // This is just for reference in later processing
}

// Read team codes from matches to get team names
for (const file of matchFiles) {
  const content = fs.readFileSync(file.path, 'utf-8');
  const matches = JSON.parse(content);
  
  for (const match of matches) {
    if (match.team1Code) {
      uniqueTeamCodes.add(match.team1Code);
      if (!teamCodeToName.has(match.team1Code)) {
        teamCodeToName.set(match.team1Code, match.team1);
      }
    }
    if (match.team2Code) {
      uniqueTeamCodes.add(match.team2Code);
      if (!teamCodeToName.has(match.team2Code)) {
        teamCodeToName.set(match.team2Code, match.team2);
      }
    }
  }
}

// Generate by-team files
for (const [teamCode, playersList] of allPlayers) {
  const teamName = teamCodeToName.get(teamCode) || teamCode;
  const normalizedCode = normalizeTeamCode(teamCode, teamName);
  const playerObjects = generatePlayerObjects(normalizedCode, playersList);
  
  const teamData = {
    teamCode: normalizedCode,
    teamName,
    lastUpdated: new Date().toISOString().split('T')[0],
    playerCount: playerObjects.length,
    players: playerObjects
  };
  
  const filename = path.join(byTeamDir, `${normalizedCode.toLowerCase()}.json`);
  fs.writeFileSync(filename, JSON.stringify(teamData, null, 2));
  
  console.log(`  ✓ ${normalizedCode}: ${playerObjects.length} players → ${path.basename(filename)}`);
}

// Generate historical snapshots
console.log('\n\n📚 Generating historical tournament snapshots...\n');

for (const [tournament, tournamentPlayers] of playersByTournament) {
  const tournamentDir = path.join(historicalDir, tournament);
  ensureDir(tournamentDir);
  
  const tournamentInfo = getTournamentInfo(tournament);
  
  console.log(`  ${tournament} (Edition ${tournamentInfo.edition}):`);
  
  for (const [teamCode, playersList] of tournamentPlayers) {
    const teamName = teamCodeToName.get(teamCode) || teamCode;
    const normalizedCode = normalizeTeamCode(teamCode, teamName);
    const playerObjects = generatePlayerObjects(normalizedCode, playersList);
    
    const teamData = {
      teamCode: normalizedCode,
      teamName,
      tournament,
      tournamentEdition: tournamentInfo.edition,
      snapshotDate: new Date().toISOString().split('T')[0],
      playerCount: playerObjects.length,
      players: playerObjects
    };
    
    const filename = path.join(tournamentDir, `${normalizedCode.toLowerCase()}.json`);
    fs.writeFileSync(filename, JSON.stringify(teamData, null, 2));
    
    console.log(`    ✓ ${normalizedCode}: ${playerObjects.length} players`);
  }
}

console.log('\n\n✅ Player extraction complete!');
console.log('\nSummary:');
console.log(`  • Teams extracted: ${allPlayers.size}`);
console.log(`  • Total players: ${Array.from(allPlayers.values()).reduce((sum, p) => sum + p.length, 0)}`);
console.log(`  • By-team files: ${allPlayers.size}`);
console.log(`  • Historical snapshots: ${playersByTournament.size} tournaments`);
console.log(`\nOutput directories:`);
console.log(`  • By-team: ${byTeamDir}`);
console.log(`  • Historical: ${historicalDir}`);
