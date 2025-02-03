import { Router } from "express";
import Redis from "ioredis";

const router = Router();
const redis = new Redis();

// Add a player to the leaderboard
router.post("/add", async (req, res)=> {
  const { player, moves, time } = req.body;
  if (!player || moves == null || time == null) res.status(400).json({ error: "Invalid data" });

  await redis.zadd("leaderboard", moves, time, player);
  res.json({ message: "Score added!" });
});

// Get top players
router.get("/", async (req, res) => {
  const topPlayers = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");
  res.json({ leaderboard: topPlayers });
});

export default router;
