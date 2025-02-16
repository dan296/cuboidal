import { Request, Response } from "express";
import Redis from "ioredis";
import { generateWordsAndShuffle } from "../services/wordsService";

const redis = new Redis();
const WORDS_KEY = "words:fixed";
const SHUFFLE_KEY = "shuffle:fixed";

export async function addWords(): Promise<void> {
    if(redis.status != "ready"){
        throw new Error("Redis is not ready");
    }

    // Check if the words already exist
    const wordsExist = await redis.exists(WORDS_KEY);
    if (wordsExist) return;

    const { cubeMap, shuffle } = generateWordsAndShuffle();

    if (cubeMap == null || shuffle == null){
        throw new Error("Failed to generate words");
    }

    // Store the words
    await redis.set(WORDS_KEY, JSON.stringify(cubeMap), "EX", 86400);
    await redis.set(SHUFFLE_KEY, JSON.stringify(shuffle), "EX", 86400);
}

export async function getWords(req: Request, res: Response) {
    if(redis.status != "ready"){
        res.status(500).json({ error: "Redis is not ready" });
        return;
    }

    let words = await redis.get(WORDS_KEY);
    let shuffle = await redis.get(SHUFFLE_KEY);
    if (!words || !shuffle){
        try {
            await addWords();
            words = await redis.get(WORDS_KEY);
            shuffle = await redis.get(SHUFFLE_KEY);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
            return;
        }
    }

    res.json({ words: JSON.parse(words ?? ""), shuffle: JSON.parse(shuffle ?? "") });
}