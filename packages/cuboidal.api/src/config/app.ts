import express from "express";
import cors from "cors";
import leaderboardRoutes from "../routes/leaderboard";
import wordsRoutes from "../routes/words";
import { scheduleCronJobs } from "./cron";
import { swaggerUi, specs } from "./swagger";

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// Register routes
app.use("/leaderboard", leaderboardRoutes);
app.use("/words", wordsRoutes);

// Schedule cron jobs
scheduleCronJobs();

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

export default app;