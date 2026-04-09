import axios from "axios";
import { env } from "../../config/env.js";
import { normalizeLanguageCode } from "../languageService.js";

const api = axios.create({
  timeout: env.requestTimeoutMs
});

const toProviderCode = (language) => {
  const normalized = normalizeLanguageCode(language);

  if (normalized === "zh-CN") {
    return "zh";
  }

  return normalized;
};

export const libreTranslateProvider = {
  name: "libretranslate",
  async translate({ text, sourceLanguage, targetLanguage }) {
    const response = await api.post(`${env.translationApiUrl.replace(/\/$/, "")}/translate`, {
      q: text,
      source: sourceLanguage === "auto" ? "auto" : toProviderCode(sourceLanguage),
      target: toProviderCode(targetLanguage),
      format: "text",
      api_key: env.translationApiKey || undefined
    });

    const translatedText = response.data?.translatedText?.trim();
    if (!translatedText) {
      throw new Error("LibreTranslate returned an empty response.");
    }

    return {
      translatedText,
      detectedLanguage: normalizeLanguageCode(
        response.data?.detectedLanguage?.language ?? sourceLanguage
      )
    };
  }
};
