import React from "react";
import type { FC } from "react";

type Match = {
  team1: string;
  team2: string;
  score: Score;
  tournamentId: number;
};

type Score = {
  team1_goals: number;
  team2_goals: number;
};

type Member = {
  name: string;
  flagPath: string;
  slug: string;
};

type Props = {
  members: Member[];
  matches: Match[];
};
const HistoricalTable: FC<Props> = ({ members, matches }) => {
  // 1. Inicializamos el estado base de cada team
  const stats = Object.fromEntries(
    members.map((m) => [
      m.name,
      {
        name: m.name,
        flagPath: m.flagPath,
        slug: m.slug,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        tournamentsPlayed: new Set<number>(), // para contar los distintos torneos
      },
    ])
  );

  // 2. Recorremos los matches y actualizamos el estado
  matches.forEach((match) => {
    const team1 = stats[match.team1];
    const team2 = stats[match.team2];
    if (!team1 || !team2) return;
    
    team1.played++;
    team2.played++;
    
    team1.goalsFor += match.score.team1_goals;
    team1.goalsAgainst += match.score.team2_goals;
    team2.goalsFor += match.score.team2_goals;
    team2.goalsAgainst += match.score.team1_goals;
    
    team1.tournamentsPlayed.add(match.tournamentId);
    team2.tournamentsPlayed.add(match.tournamentId);
    
    if (match.score.team1_goals > match.score.team2_goals) {
      team1.wins++;
      team2.losses++;
    } else if (match.score.team1_goals < match.score.team2_goals) {
      team2.wins++;
      team1.losses++;
    } else {
      team1.draws++;
      team2.draws++;
    }
  });
  
  // 3. Convertimos el objeto en array y calculamos stats adicionales
  const table = Object.values(stats).map((team) => {
    const points = team.wins * 3 + team.draws;
    const goalDiff = team.goalsFor - team.goalsAgainst;
    const performance = team.played > 0 ? points / team.played : 0;
    return {
      ...team,
      points,
      goalDiff,
      performance,
      tournamentsCount: team.tournamentsPlayed.size,
    };
  });

  // 4. Ordenamos la tabla según reglas
  const sorted = [...table].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.performance !== a.performance) return b.performance - a.performance;
    if (b.tournamentsCount !== a.tournamentsCount)
      return b.tournamentsCount - a.tournamentsCount;
    return b.goalDiff - a.goalDiff;
  });

  return (
    <div className="container mx-auto p-6 flex flex-col justify-center items-center border-t border-green-600">
      <h1 className="text-7xl font-bold mb-6">Historical Table</h1>
      <table className="min-w-full w-full table-auto border-collapse">
        <thead className="bg-green-800 text-white">
          <tr>
            <th className="px-4 py-2 text-center rounded-tl-2xl">Pos</th>
            <th className="px-4 py-2 text-center"></th>
            <th className="px-4 py-2 text-center">Team</th>
            <th className="px-4 py-2 text-center">TP</th>
            <th className="px-4 py-2 text-center">Pts</th>
            <th className="px-4 py-2 text-center">Pld</th>
            <th className="px-4 py-2 text-center">W</th>
            <th className="px-4 py-2 text-center">D</th>
            <th className="px-4 py-2 text-center">L</th>
            <th className="px-4 py-2 text-center">GF</th>
            <th className="px-4 py-2 text-center">GA</th>
            <th className="px-4 py-2 text-center">GD</th>
            <th className="px-4 py-2 text-center rounded-tr-2xl">PR</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, index) => (
            <tr key={team.name} className="text-center odd:bg-green-900/30 even:bg-green-950/30">
              <td className="px-4 py-2 font-bold">{index + 1}</td>
              <td className="py-2 w-fit">
                <img
                  src={team.flagPath}
                  alt={team.name}
                  className="h-6 w-auto rounded-xl object-cover ring-1 ring-green-700 inline-block"
                />
              </td>
              <td className="px-4 py-2">
                <a href={`/members/${team.slug}`} className="text-white hover:underline">
                  {team.name}
                </a>
              </td>
              <td className="px-4 py-2">{team.tournamentsCount}</td>
              <td className="px-4 py-2">{team.points}</td>
              <td className="px-4 py-2">{team.played}</td>
              <td className="px-4 py-2">{team.wins}</td>
              <td className="px-4 py-2">{team.draws}</td>
              <td className="px-4 py-2">{team.losses}</td>
              <td className="px-4 py-2">{team.goalsFor}</td>
              <td className="px-4 py-2">{team.goalsAgainst}</td>
              <td className="px-4 py-2">{team.goalDiff}</td>
              <td className="px-4 py-2">{team.performance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricalTable;
