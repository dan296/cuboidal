import { Router } from "express";
import { addPlayer, getPlayers } from "../controllers/leaderboardController";
import { checkRedisReady } from "../config/redis";

const router = Router();

/**
 * @swagger
 * /leaderboard/add:
 *   post:
 *     summary: Add a player to the leaderboard
 *     tags: [Leaderboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *               moves:
 *                 type: number
 *               time:
 *                 type: number
 *     responses:
 *       200:
 *         description: Player added successfully
 *       400:
 *         description: Invalid data or player already exists
 */
// Add a player to the leaderboard
router.post("/add", checkRedisReady, addPlayer);

/**
 * @swagger
 * /leaderboard/{index}:
 *   get:
 *     summary: Get top 50 players sorted by moves then by time
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *         description: Starting index for the leaderboard
 *     responses:
 *       200:
 *         description: List of top players
 *       400:
 *         description: Invalid index
 */
// Get top 50 players sorted by moves then by time
router.get("/:index",checkRedisReady, getPlayers);

export default router;