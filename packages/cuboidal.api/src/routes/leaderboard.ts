import { Router } from "express";
import { addPlayer, getPlayers } from "../controllers/leaderboardController";

const router = Router();

// Add a player to the leaderboard
router.post("/add", addPlayer);

// Get top 50 players sorted by moves then by time
router.get("/:index", getPlayers);

export default router;