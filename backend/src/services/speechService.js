import axios from "axios";
import { env } from "../config/env.js";
import { normalizeLanguageCode } from "./languageService.js";

const googleTtsClient = axios.create({
  baseURL: "https://translate.google.com",
  timeout: env.requestTimeoutMs,
  responseType: "arraybuffer",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
  }
});

const toSpeechLanguageCode = (languageCode) => {
  const normalized = normalizeLanguageCode(languageCode);

  switch (normalized) {
    case "zh-CN":
      return "zh-CN";
    case "auto":
      return "en";
    default:
      return normalized.split("-")[0];
  }
};

const chunkText = (text, maxLength = 180) => {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (word.length <= maxLength) {
      currentChunk = word;
      continue;
    }

    for (let index = 0; index < word.length; index += maxLength) {
      chunks.push(word.slice(index, index + maxLength));
    }

    currentChunk = "";
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length ? chunks : [text.trim().slice(0, maxLength)];
};

export const synthesizeSpeech = async ({ text, languageCode }) => {
  const normalizedText = text?.trim();

  if (!normalizedText) {
    throw new Error("Text is required for speech synthesis.");
  }

  const speechLanguageCode = toSpeechLanguageCode(languageCode);
  const chunks = chunkText(normalizedText);

  const buffers = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await googleTtsClient.get("/translate_tts", {
        params: {
          ie: "UTF-8",
          client: "tw-ob",
          tl: speechLanguageCode,
          q: chunk
        }
      });

      return Buffer.from(response.data);
    })
  );

  return {
    audioBuffer: Buffer.concat(buffers),
    contentType: "audio/mpeg",
    languageCode: speechLanguageCode
  };
};
