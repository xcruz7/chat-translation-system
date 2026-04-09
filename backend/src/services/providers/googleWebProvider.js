import axios from "axios";
import { env } from "../../config/env.js";
import { normalizeLanguageCode } from "../languageService.js";

const api = axios.create({
  baseURL: "https://translate.googleapis.com",
  timeout: env.requestTimeoutMs
});

const toProviderCode = (language) => {
  const normalized = normalizeLanguageCode(language);
  if (normalized === "zh-CN") {
    return "zh-CN";
  }

  return normalized;
};

export const googleWebProvider = {
  name: "google-web",
  async translate({ text, sourceLanguage, targetLanguage }) {
    const response = await api.get("/translate_a/single", {
      params: {
        client: "gtx",
        sl: sourceLanguage === "auto" ? "auto" : toProviderCode(sourceLanguage),
        tl: toProviderCode(targetLanguage),
        dj: 1,
        dt: "t",
        q: text
      }
    });

    const sentences = Array.isArray(response.data?.sentences) ? response.data.sentences : [];
    const translatedText = sentences.map((sentence) => sentence.trans ?? "").join("").trim();

    if (!translatedText) {
      throw new Error("Translation provider returned an empty response.");
    }

    return {
      translatedText,
      detectedLanguage: normalizeLanguageCode(response.data?.src ?? sourceLanguage)
    };
  }
};
