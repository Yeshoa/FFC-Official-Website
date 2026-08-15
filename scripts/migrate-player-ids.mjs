import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const matchesDir = path.join(projectRoot, 'src/data/matches');
const playersDir = path.join(projectRoot, 'src/data/players');
const byTeamDir = path.join(playersDir, 'by-team');

// Load all player data into memory for faster lookup
const playerCache = new Map(); // teamCode/teamName -> { nameToId: Map }
const teamCodeMap = new Map(); // Maps various team identifiers to normalized codes

const loadPlayerCache = () => {
  const files = fs.readdirSync(byTeamDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(byTeamDir, file), 'utf-8'));
    const teamCode = content.teamCode;
    const teamName = content.teamName;
    
    const nameToId = new Map();
    for (const player of content.players) {
      nameToId.set(player.name.toLowerCase(), player.id);
    }
    
    playerCache.set(teamCode, { nameToId, teamName, teamCode });
    playerCache.set(teamName, { nameToId, teamName, teamCode }); // Also cache by team name
    
    // Store mapping for quick lookups
    teamCodeMap.set(teamCode.toUpperCase(), teamCode);
    teamCodeMap.set(teamName.toUpperCase(), teamCode);
    teamCodeMap.set(teamName.toLowerCase(), teamCode);
  }
  
  console.log(`✓ Loaded player data for ${playerCache.size} team entries (${new Set(playerCache.values()).size} unique teams)`);
};

// Get team code from various identifiers
const getTeamCode = (identifier) => {
  if (!identifier) return null;
  
  // Direct lookup
  if (playerCache.has(identifier)) {
    return playerCache.get(identifier).teamCode;
  }
  
  // Try case-insensitive lookup
  const upper = identifier.toUpperCase();
  if (teamCodeMap.has(upper)) {
    return teamCodeMap.get(upper);
  }
  
  // Try lowercase
  const lower = identifier.toLowerCase();
  if (teamCodeMap.has(lower)) {
    return teamCodeMap.get(lower);
  }
  
  // Try first 3 letters as code
  const shortCode = identifier.substring(0, 3).toUpperCase();
  if (teamCodeMap.has(shortCode)) {
    return teamCodeMap.get(shortCode);
  }
  
  return null;
};

// Map player name to ID
const mapNameToId = (teamIdentifier, playerName) => {
  if (!playerName) return null;
  
  const teamCode = getTeamCode(teamIdentifier);
  if (!teamCode) return null;
  
  const team = playerCache.get(teamCode);
  if (!team) return null;
  
  return team.nameToId.get(playerName.toLowerCase()) || null;
};

// Process a single match
const processMatch = (match, matchIndex) => {
  const team1Code = getTeamCode(match.team1Code || match.team1) || match.team1;
  const team2Code = getTeamCode(match.team2Code || match.team2) || match.team2;
  
  const stats = {
    team1Code,
    team2Code,
    goalsProcessed: 0,
    goalsWithId: 0,
    cardsProcessed: 0,
    cardsWithId: 0,
    subsProcessed: 0,
    subsWithId: 0,
    penaltiesProcessed: 0,
    penaltiesWithId: 0,
    playersInLineup: 0,
    playersWithId: 0,
    warnings: []
  };
  
  // Process goals
  if (match.goals && Array.isArray(match.goals)) {
    for (const goal of match.goals) {
      stats.goalsProcessed++;
      
      if (goal.player) {
        const teamIdent = goal.team === match.team1 ? match.team1Code || match.team1 : match.team2Code || match.team2;
        const playerId = mapNameToId(teamIdent, goal.player);
        
        if (playerId) {
          goal.playerId = playerId;
          stats.goalsWithId++;
        } else {
          stats.warnings.push(`Goal: Player "${goal.player}" not found in ${goal.team}`);
        }
      }
      
      if (goal.assist) {
        const teamIdent = goal.team === match.team1 ? match.team1Code || match.team1 : match.team2Code || match.team2;
        const playerId = mapNameToId(teamIdent, goal.assist);
        
        if (playerId) {
          goal.assistId = playerId;
        }
      }
    }
  }
  
  // Process cards
  if (match.cards && Array.isArray(match.cards)) {
    for (const card of match.cards) {
      stats.cardsProcessed++;
      
      if (card.player) {
        const teamIdent = card.team === match.team1 ? match.team1Code || match.team1 : match.team2Code || match.team2;
        const playerId = mapNameToId(teamIdent, card.player);
        
        if (playerId) {
          card.playerId = playerId;
          stats.cardsWithId++;
        } else {
          stats.warnings.push(`Card: Player "${card.player}" not found in ${card.team}`);
        }
      }
    }
  }
  
  // Process substitutions
  if (match.substitutions && Array.isArray(match.substitutions)) {
    for (const sub of match.substitutions) {
      stats.subsProcessed += 2; // Count as 2 (out and in)
      
      const teamIdent = sub.team === match.team1 ? match.team1Code || match.team1 : match.team2Code || match.team2;
      
      if (sub.playerOut) {
        const playerId = mapNameToId(teamIdent, sub.playerOut);
        if (playerId) {
          sub.playerOutId = playerId;
          stats.subsWithId++;
        }
      }
      
      if (sub.playerIn) {
        const playerId = mapNameToId(teamIdent, sub.playerIn);
        if (playerId) {
          sub.playerInId = playerId;
          stats.subsWithId++;
        }
      }
    }
  }
  
  // Process penalties
  if (match.penalties && Array.isArray(match.penalties)) {
    for (const penalty of match.penalties) {
      stats.penaltiesProcessed++;
      
      if (penalty.player) {
        const teamIdent = penalty.team === match.team1 ? match.team1Code || match.team1 : match.team2Code || match.team2;
        const playerId = mapNameToId(teamIdent, penalty.player);
        
        if (playerId) {
          penalty.playerId = playerId;
          stats.penaltiesWithId++;
        }
      }
    }
  }
  
  // Process lineups
  if (match.lineup) {
    if (match.lineup.team1 && match.lineup.team1.players) {
      for (const player of match.lineup.team1.players) {
        stats.playersInLineup++;
        
        if (player.name) {
          const teamIdent = match.team1Code || match.team1;
          const playerId = mapNameToId(teamIdent, player.name);
          if (playerId) {
            player.playerId = playerId;
            stats.playersWithId++;
          }
        }
      }
    }
    
    if (match.lineup.team2 && match.lineup.team2.players) {
      for (const player of match.lineup.team2.players) {
        stats.playersInLineup++;
        
        if (player.name) {
          const teamIdent = match.team2Code || match.team2;
          const playerId = mapNameToId(teamIdent, player.name);
          if (playerId) {
            player.playerId = playerId;
            stats.playersWithId++;
          }
        }
      }
    }
  }
  
  return stats;
};

// Main execution
console.log('🔄 Migrating player names to IDs in match data...\n');

// Load player cache
loadPlayerCache();
console.log();

// Process matches
const matchFiles = fs.readdirSync(matchesDir)
  .filter(f => f.endsWith('.json') && f.startsWith('forest-cup-'))
  .map(f => ({
    filename: f,
    path: path.join(matchesDir, f)
  }));

console.log(`Found ${matchFiles.length} match files to process\n`);

const totalStats = {
  filesProcessed: 0,
  matchesProcessed: 0,
  goalsProcessed: 0,
  goalsWithId: 0,
  cardsProcessed: 0,
  cardsWithId: 0,
  subsProcessed: 0,
  subsWithId: 0,
  penaltiesProcessed: 0,
  penaltiesWithId: 0,
  playersInLineup: 0,
  playersWithId: 0,
  warnings: []
};

// Create backup directory
const backupDir = path.join(matchesDir, '_backup_' + new Date().toISOString().split('T')[0]);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`📦 Backup directory created: ${path.basename(backupDir)}\n`);
}

// Process each file
for (const file of matchFiles) {
  console.log(`📄 Processing: ${file.filename}`);
  
  // Read and backup
  const content = fs.readFileSync(file.path, 'utf-8');
  fs.writeFileSync(path.join(backupDir, file.filename), content);
  
  // Parse and process
  const matches = JSON.parse(content);
  
  for (let i = 0; i < matches.length; i++) {
    const matchStats = processMatch(matches[i], i);
    totalStats.matchesProcessed++;
    
    // Aggregate stats
    totalStats.goalsProcessed += matchStats.goalsProcessed;
    totalStats.goalsWithId += matchStats.goalsWithId;
    totalStats.cardsProcessed += matchStats.cardsProcessed;
    totalStats.cardsWithId += matchStats.cardsWithId;
    totalStats.subsProcessed += matchStats.subsProcessed;
    totalStats.subsWithId += matchStats.subsWithId;
    totalStats.penaltiesProcessed += matchStats.penaltiesProcessed;
    totalStats.penaltiesWithId += matchStats.penaltiesWithId;
    totalStats.playersInLineup += matchStats.playersInLineup;
    totalStats.playersWithId += matchStats.playersWithId;
    
    if (matchStats.warnings.length > 0) {
      totalStats.warnings.push(...matchStats.warnings.map(w => `${file.filename}[match ${i}]: ${w}`));
    }
  }
  
  // Write updated matches
  fs.writeFileSync(file.path, JSON.stringify(matches, null, 2));
  console.log(`   ✓ ${matches.length} matches updated\n`);
  
  totalStats.filesProcessed++;
}

// Print summary
console.log('\n' + '='.repeat(70));
console.log('📊 MIGRATION SUMMARY');
console.log('='.repeat(70) + '\n');

console.log(`Files processed:        ${totalStats.filesProcessed}`);
console.log(`Matches processed:      ${totalStats.matchesProcessed}`);
console.log();

console.log(`Goals:`);
console.log(`  Processed:            ${totalStats.goalsProcessed}`);
console.log(`  With ID assigned:     ${totalStats.goalsWithId}/${totalStats.goalsProcessed}`);
console.log(`  Coverage:             ${totalStats.goalsProcessed > 0 ? ((totalStats.goalsWithId / totalStats.goalsProcessed) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`Cards:`);
console.log(`  Processed:            ${totalStats.cardsProcessed}`);
console.log(`  With ID assigned:     ${totalStats.cardsWithId}/${totalStats.cardsProcessed}`);
console.log(`  Coverage:             ${totalStats.cardsProcessed > 0 ? ((totalStats.cardsWithId / totalStats.cardsProcessed) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`Substitutions:`);
console.log(`  Processed:            ${totalStats.subsProcessed}`);
console.log(`  With ID assigned:     ${totalStats.subsWithId}/${totalStats.subsProcessed}`);
console.log(`  Coverage:             ${totalStats.subsProcessed > 0 ? ((totalStats.subsWithId / totalStats.subsProcessed) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`Penalties:`);
console.log(`  Processed:            ${totalStats.penaltiesProcessed}`);
console.log(`  With ID assigned:     ${totalStats.penaltiesWithId}/${totalStats.penaltiesProcessed}`);
console.log(`  Coverage:             ${totalStats.penaltiesProcessed > 0 ? ((totalStats.penaltiesWithId / totalStats.penaltiesProcessed) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`Lineups:`);
console.log(`  Players processed:    ${totalStats.playersInLineup}`);
console.log(`  With ID assigned:     ${totalStats.playersWithId}/${totalStats.playersInLineup}`);
console.log(`  Coverage:             ${totalStats.playersInLineup > 0 ? ((totalStats.playersWithId / totalStats.playersInLineup) * 100).toFixed(1) : 0}%`);
console.log();

if (totalStats.warnings.length > 0) {
  console.log(`⚠️  Warnings (${totalStats.warnings.length}):`);
  totalStats.warnings.slice(0, 20).forEach(w => {
    console.log(`   - ${w}`);
  });
  if (totalStats.warnings.length > 20) {
    console.log(`   ... and ${totalStats.warnings.length - 20} more`);
  }
} else {
  console.log(`✓ No warnings - all players mapped successfully!`);
}

console.log();
console.log('✅ Migration complete!');
console.log(`\nBackup saved to: ${backupDir}`);
