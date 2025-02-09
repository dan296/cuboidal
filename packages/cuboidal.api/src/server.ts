import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import leaderboardRoutes from "./routes/leaderboard"; 
import wordsRoutes from "./routes/words";
import cron from "node-cron";
import { addWords } from "./controllers/wordsController";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerConfig";

dotenv.config();
const app = express();
app.use(express.json());
// Register routes correctly
app.use("/leaderboard", leaderboardRoutes);
app.use("/words", wordsRoutes);

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: 6379
});

// Schedule a job to run every day at midnight to wipe the Redis storage
cron.schedule("0 0 * * *", async () => {
  try {
    await redis.flushall();
    console.log("Redis storage wiped successfully");
    // Call addWords function
    // Create mock request and response objects
    const mockReq = {
      body: {}
    } as express.Request;
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => console.log(`Response: ${code}`, data)
      }),
      json: (data: any) => console.log("Response:", data)
    } as unknown as express.Response;

    await addWords(mockReq, mockRes);
  } catch (error) {
    console.error("Error wiping Redis storage:", error);
  }
});

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Test route
app.get("/", async (req, res) => {
  await redis.set("test", "Hello from Redis!", "EX", 10);
  const message = await redis.get("test");
  res.json({ message });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));