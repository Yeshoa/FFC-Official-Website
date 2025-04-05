import React from "react";
import type { FC } from "react";

type Match = {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  tournamentId: number;
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
    const teamA = stats[match.teamA];
    const teamB = stats[match.teamB];

    if (!teamA || !teamB) return;

    teamA.played++;
    teamB.played++;

    teamA.goalsFor += match.scoreA;
    teamA.goalsAgainst += match.scoreB;
    teamB.goalsFor += match.scoreB;
    teamB.goalsAgainst += match.scoreA;

    teamA.tournamentsPlayed.add(match.tournamentId);
    teamB.tournamentsPlayed.add(match.tournamentId);

    if (match.scoreA > match.scoreB) {
      teamA.wins++;
      teamB.losses++;
    } else if (match.scoreA < match.scoreB) {
      teamB.wins++;
      teamA.losses++;
    } else {
      teamA.draws++;
      teamB.draws++;
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
            <tr key={team.name} className="text-center odd:bg-green-900 even:bg-green-800">
              <td className="px-4 py-2 font-bold">{index + 1}</td>
              <td className="px-4 py-2">
                <img
                  src={team.flagPath}
                  alt={team.name}
                  className="w-6 h-6 rounded-full mx-auto"
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
