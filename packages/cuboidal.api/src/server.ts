import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import leaderboardRoutes from "./routes/leaderboard"; 
import wordsRoutes from "./routes/words"; // ✅ Make sure this import is correct


dotenv.config();
const app = express();
app.use(express.json());
// Register routes correctly
app.use("/leaderboard", leaderboardRoutes);
app.use("/words", wordsRoutes);

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379
});

// Test route
app.get("/", async (req, res) => {
  await redis.set("test", "Hello from Redis!", "EX", 10);
  const message = await redis.get("test");
  res.json({ message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));