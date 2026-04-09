import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  provider: process.env.TRANSLATION_PROVIDER ?? "google-web",
  translationApiUrl: process.env.TRANSLATION_API_URL ?? "https://libretranslate.com",
  translationApiKey: process.env.TRANSLATION_API_KEY ?? "",
  openaiApiUrl: process.env.OPENAI_API_URL ?? "https://api.openai.com/v1",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-5",
  historyLimit: toNumber(process.env.HISTORY_LIMIT, 50),
  cacheTtlMs: toNumber(process.env.CACHE_TTL_MS, 86_400_000),
  requestTimeoutMs: toNumber(process.env.REQUEST_TIMEOUT_MS, 15_000),
  storagePath: path.join(backendRoot, "data", "translations.json")
};
