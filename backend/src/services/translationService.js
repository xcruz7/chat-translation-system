import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { getTranslationProvider } from "./providerFactory.js";
import {
  getLanguageByCode,
  normalizeLanguageCode,
  isSupportedLanguage
} from "./languageService.js";
import { storageService } from "./storageService.js";
import { buildLearningBundle } from "./learningService.js";

const cache = new Map();

const createCacheKey = ({ text, sourceLanguage, targetLanguage }) =>
  `${sourceLanguage}::${targetLanguage}::${text.trim().toLowerCase()}`;

export const translateText = async ({
  text,
  sourceLanguage = "auto",
  targetLanguage,
  includeLearning = true
}) => {
  const normalizedSource = normalizeLanguageCode(sourceLanguage);
  const normalizedTarget = normalizeLanguageCode(targetLanguage);

  if (!isSupportedLanguage(normalizedTarget) || normalizedTarget === "auto") {
    throw new Error("Please choose a supported target language.");
  }

  const cacheKey = createCacheKey({
    text,
    sourceLanguage: normalizedSource,
    targetLanguage: normalizedTarget
  });

  if (cache.has(cacheKey)) {
    const cachedEntry = cache.get(cacheKey);
    const isFresh = Date.now() - cachedEntry.timestamp < env.cacheTtlMs;

    if (isFresh) {
      return {
        ...cachedEntry.payload,
        cached: true
      };
    }

    cache.delete(cacheKey);
  }

  const provider = getTranslationProvider();

  try {
    const providerResult = await provider.translate({
      text,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget
    });

    const detectedLanguage = normalizeLanguageCode(
      providerResult.detectedLanguage ?? normalizedSource
    );

    const learning =
      includeLearning && text.trim().length > 0
        ? await buildLearningBundle({
            text,
            translatedText: providerResult.translatedText,
            detectedLanguage,
            targetLanguage: normalizedTarget,
            provider
          })
        : null;

    const historyEntry = await storageService.saveTranslation({
      id: uuidv4(),
      sourceText: text,
      translatedText: providerResult.translatedText,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget,
      detectedLanguage,
      targetLanguageLabel: getLanguageByCode(normalizedTarget).name,
      detectedLanguageLabel: getLanguageByCode(detectedLanguage).name,
      favorite: false,
      createdAt: new Date().toISOString(),
      learning
    });

    const payload = {
      translatedText: providerResult.translatedText,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget,
      detectedLanguage,
      detectedLanguageLabel: getLanguageByCode(detectedLanguage).name,
      targetLanguageLabel: getLanguageByCode(normalizedTarget).name,
      provider: provider.name,
      learning,
      historyEntry
    };

    cache.set(cacheKey, {
      payload,
      timestamp: Date.now()
    });
    return payload;
  } catch (error) {
    const fallback = await storageService.findMatchingTranslation({
      sourceText: text,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget
    });

    if (fallback) {
      return {
        translatedText: fallback.translatedText,
        sourceLanguage: fallback.sourceLanguage,
        targetLanguage: fallback.targetLanguage,
        detectedLanguage: fallback.detectedLanguage,
        detectedLanguageLabel: fallback.detectedLanguageLabel,
        targetLanguageLabel: fallback.targetLanguageLabel,
        provider: "cached-history",
        learning: fallback.learning ?? null,
        historyEntry: fallback,
        cached: true
      };
    }

    throw new Error(error.response?.data?.error ?? error.message ?? "Translation failed.");
  }
};
