import { Router } from "express";
import { addWords, getWords } from "../controllers/wordsController";

const router = Router();

/**
 * @swagger
 * /words/add:
 *   post:
 *     summary: Add words to the system
 *     tags: [Words]
 *     responses:
 *       200:
 *         description: Words stored successfully
 *       400:
 *         description: Words already exist or failed to generate words
 */
// Store shuffled words
router.post("/add", addWords);

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
router.get("/", getWords);

export default router;
