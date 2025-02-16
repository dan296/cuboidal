import cron from "node-cron";
import redis from "./redis";
import { addWords } from "../controllers/wordsController";

const RETRY_DELAY_MS = 60000; // 60 seconds
const TOTAL_RETRY_TIME_MS = 6000000; // 100 minutes
let total_elapsed_time = 0;

async function flushRedisWithRetry(): Promise<void> {
  while (total_elapsed_time < TOTAL_RETRY_TIME_MS) {
    try {
      await redis.flushall();
      console.log("Redis storage wiped successfully");
      return;
    } catch (error) {
      console.error(`Error wiping Redis storage. Retrying in ${RETRY_DELAY_MS / 1000} seconds...`, error);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      total_elapsed_time += RETRY_DELAY_MS;
    }
  }
}

async function addWordsWithRetry(): Promise<void> {
  while (total_elapsed_time < TOTAL_RETRY_TIME_MS) {
    try {
      await addWords();
      console.log("Words added successfully");
      return;
    } catch (error) {
      console.error(`Error adding words. Retrying in ${RETRY_DELAY_MS / 1000} seconds...`, error);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      total_elapsed_time += RETRY_DELAY_MS;
    }
  }
}

export function scheduleCronJobs() {
  // Schedule a job to run every day at midnight to wipe the Redis storage
  cron.schedule("0 0 * * *", async () => {
    total_elapsed_time = 0;
    try {
      await flushRedisWithRetry();
      await addWordsWithRetry();
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  });
}