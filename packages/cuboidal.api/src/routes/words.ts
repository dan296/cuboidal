import { Router } from "express";
import { getWords } from "../controllers/wordsController";
import { checkRedisReady } from "../config/redis";

const router = Router();

/**
 * @swagger
 * /words:
 *   get:
 *     summary: Get the stored words and shuffle
 *     tags: [Words]
 *     responses:
 *       200:
 *         description: Words and shuffle retrieved successfully
 *       404:
 *         description: Words not found
 */
// Get shuffled words
router.get("/", checkRedisReady, getWords);

export default router;
