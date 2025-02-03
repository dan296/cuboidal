import { Request, Response } from "express";
import Redis from "ioredis";
import { sortPlayersAndConvertTime } from "../services/leaderboardService";

const redis = new Redis();

export async function addPlayer(req: Request, res: Response): Promise<void> {
    const { player, moves, time } = req.body;
    if (!player || moves == null || time == null) res.status(400).json({ error: "Invalid data" });

    // Check if player already exists
    const playerExists = await redis.hexists(`player:${player}`, "moves");
    if (playerExists) {
        res.status(400).json({ error: "Player already exists" });
    }

    // Store player data in a hash
    await redis.hmset(`player:${player}`, { moves, time });

    // Add player to sorted sets
    await redis.zadd("leaderboard:moves", moves, player);
    await redis.zadd("leaderboard:time", time, player);
    res.json({ message: "Score added!" });
}

export async function getPlayers(req: Request, res: Response): Promise<void> {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) res.status(400).json({ error: "Invalid index" });

    // Get top 50 players sorted by moves
    const topPlayersByMoves = await redis.zrange("leaderboard:moves", index, index + 49);

    const topPlayers = await Promise.all(
        topPlayersByMoves.map(async (player, i) => {
            const playerData = await redis.hgetall(`player:${player}`);
            return {
                rank: index + i + 1,
                player,
                moves: parseInt(playerData.moves, 10),
                time: parseInt(playerData.time, 10)
            };
        })
    );

    // Sort by time if moves are equal
    sortPlayersAndConvertTime(topPlayers);

    res.json({ leaderboard: topPlayers });
}