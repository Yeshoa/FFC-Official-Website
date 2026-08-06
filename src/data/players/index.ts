export interface PlayerEntry {
  id: string;
  name: string;
  position: string;
  number: number | null;
  status: string;
}

interface CurrentSquadFile {
  teamCode: string;
  teamName: string;
  lastUpdated: string;
  playerCount: number;
  players: PlayerEntry[];
}

interface HistoricalSquadFile extends CurrentSquadFile {
  tournament: string;
  tournamentEdition: number;
  snapshotDate: string;
}

const currentSquadFiles = import.meta.glob('./by-team/*.json', { eager: true }) as Record<
  string,
  { default: CurrentSquadFile }
>;

const historicalSquadFiles = import.meta.glob('./historical/**/*.json', { eager: true }) as Record<
  string,
  { default: HistoricalSquadFile }
>;

const playersById = new Map<string, PlayerEntry>();
const currentSquadByTeamCode = new Map<string, PlayerEntry[]>();
const historicalSquadByTeamCode = new Map<string, PlayerEntry[]>();

function indexTeamSquad(teamCode: string, players: PlayerEntry[], target: Map<string, PlayerEntry[]>) {
  const normalized = teamCode.trim().toLowerCase();
  const existing = target.get(normalized) ?? [];
  target.set(normalized, [...existing, ...players]);
}

for (const file of Object.values(currentSquadFiles)) {
  const squad = file.default;
  for (const player of squad.players) {
    if (!playersById.has(player.id.toLowerCase())) {
      playersById.set(player.id.toLowerCase(), player);
    }
  }
  indexTeamSquad(squad.teamCode, squad.players, currentSquadByTeamCode);
}

for (const file of Object.values(historicalSquadFiles)) {
  const squad = file.default;
  for (const player of squad.players) {
    if (!playersById.has(player.id.toLowerCase())) {
      playersById.set(player.id.toLowerCase(), player);
    }
  }
  indexTeamSquad(squad.teamCode, squad.players, historicalSquadByTeamCode);
}

export function getPlayerById(teamCode: string, playerId: string): PlayerEntry | null {
  if (!playerId) return null;

  const direct = playersById.get(playerId.toLowerCase());
  if (direct) return direct;

  const teamSquad = currentSquadByTeamCode.get(teamCode.trim().toLowerCase());
  return teamSquad?.find(player => player.id.toLowerCase() === playerId.toLowerCase()) ?? null;
}

export function loadCurrentSquad(teamCode: string): PlayerEntry[] {
  return currentSquadByTeamCode.get(teamCode.trim().toLowerCase()) ?? [];
}

export function loadHistoricalSquad(teamCode: string): PlayerEntry[] {
  return historicalSquadByTeamCode.get(teamCode.trim().toLowerCase()) ?? [];
}
