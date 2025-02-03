import { Router, Request, Response } from "express";
import Redis from "ioredis";

const router = Router();
const redis = new Redis();

// Store shuffled words
router.post("/shuffle", async (req: Request, res: Response) => {
  const { words } = req.body;
  if (!Array.isArray(words)) res.status(400).json({ error: "Invalid words array" });

  const shuffleKey = `shuffle:${Date.now()}`;
  await redis.set(shuffleKey, JSON.stringify(words), "EX", 86400);
  res.json({ message: "Shuffle stored!", key: shuffleKey });
});

// Get shuffled words
router.get("/:key", async (req, res) => {
  const data = await redis.get(req.params.key);
  if (!data) res.status(404).json({ error: "Shuffle not found" });

  res.status(404).json({ error: "Shuffle not found" });
});

export default router;
