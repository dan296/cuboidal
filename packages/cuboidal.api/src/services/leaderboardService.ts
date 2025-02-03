import { Player } from "../interfaces/Player";

function convertTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}m ${seconds}s`;
}

function sortPlayers(players: Player[]) {
    players.sort((a: Player, b: Player) => {
        if (a.moves === b.moves) {
            return a.time - b.time;
        }
        return a.moves - b.moves;
    });
}

export function sortPlayersAndConvertTime(players: Player[]) {
    sortPlayers(players);
    players.forEach((player: Player, i) => {
        player.rank = i + 1;
        player.timeString = convertTime(player.time);
    });
}