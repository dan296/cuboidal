import { Request, Response } from "express";
import Redis from "ioredis";
import { generateWordsAndShuffle } from "../services/wordsService";

const redis = new Redis();
const WORDS_KEY = "words:fixed";
const SHUFFLE_KEY = "shuffle:fixed";

export async function addWords(req: Request, res: Response): Promise<void> {
    // Check if the words already exist
    const wordsExist = await redis.exists(WORDS_KEY);
    if (wordsExist) { 
        res.status(400).json({ error: "Words already exist" });
        return;
    }

    const { cubeMap, shuffle } = generateWordsAndShuffle();

    if (cubeMap == null || shuffle == null){
        res.status(400).json({ error: "Failed to generate words" });
        return;
    }

    // Store the words
    await redis.set(WORDS_KEY, JSON.stringify(cubeMap), "EX", 86400);
    await redis.set(SHUFFLE_KEY, JSON.stringify(shuffle), "EX", 86400);
    res.json({ message: "Words stored!" });
}

export async function getWords(req: Request, res: Response) {
    const words = await redis.get(WORDS_KEY);
    const shuffle = await redis.get(SHUFFLE_KEY);
    if (!words || !shuffle){
        await addWords(req, res);
        return await getWords(req, res);
    }

    res.json({ words: JSON.parse(words ?? ""), shuffle: JSON.parse(shuffle ?? "") });
}