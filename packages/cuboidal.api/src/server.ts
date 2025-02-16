import dotenv from "dotenv";
import app from "./config/app";
import { scheduleCronJobs } from "./config/cron";

dotenv.config();

// Schedule the daily cron job
scheduleCronJobs();

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));