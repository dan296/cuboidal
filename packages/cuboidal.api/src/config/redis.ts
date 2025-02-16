import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: 6379
});

export function checkRedisReady(req: Request, res: Response, next: NextFunction) {
    if (redis.status !== "ready") {
        res.status(500).json({ error: "Redis is not ready" });
    } else {
        next();
    }
}

export default redis;