import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import {
  getLanguageByCode,
  isSupportedLanguage,
  normalizeLanguageCode
} from "./languageService.js";
import { storageService } from "./storageService.js";

const supportedTones = new Set([
  "Professional",
  "Polite",
  "Friendly",
  "Diplomatic",
  "Simple",
  "Confident",
  "Apologetic"
]);

const buildPrompt = ({ sourceLanguage, targetLanguage, selectedTone, userMessage }) => `You are an advanced Bilingual Social Mediator and Translator.

Your task is to:
1. Rewrite the given message in the source language to match a specific social tone.
2. Then translate that rewritten message into the target language.
3. Return ONLY the final translated message.

INPUT:
- Source Language: ${sourceLanguage}
- Target Language: ${targetLanguage}
- Selected Tone: ${selectedTone}
- User Message: "${userMessage}"

TONE GUIDELINES:
- Professional: formal and structured
- Polite: respectful and indirect
- Friendly: warm and casual
- Diplomatic: neutral and soft
- Simple: easy and clear language
- Confident: assertive and direct
- Apologetic: express regret politely

OUTPUT RULE:
Return ONLY the final translated text.`;

const extractOutputText = (payload) => {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
};

export const llmTranslateText = async ({
  sourceLanguage = "auto",
  targetLanguage,
  selectedTone = "Professional",
  userMessage
}) => {
  if (!env.openaiApiKey) {
    const error = new Error("OPENAI_API_KEY is not configured on the backend.");
    error.statusCode = 500;
    throw error;
  }

  const normalizedSource = normalizeLanguageCode(sourceLanguage);
  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  const normalizedTone = supportedTones.has(selectedTone) ? selectedTone : "Professional";

  if (normalizedSource !== "auto" && !isSupportedLanguage(normalizedSource)) {
    const error = new Error("Please choose a supported source language.");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedTarget === "auto" || !isSupportedLanguage(normalizedTarget)) {
    const error = new Error("Please choose a supported target language.");
    error.statusCode = 400;
    throw error;
  }

  const prompt = buildPrompt({
    sourceLanguage: normalizedSource === "auto" ? "Auto Detect" : getLanguageByCode(normalizedSource).name,
    targetLanguage: getLanguageByCode(normalizedTarget).name,
    selectedTone: normalizedTone,
    userMessage: userMessage.trim()
  });

  let translatedText = "";

  try {
    const response = await axios.post(
      `${env.openaiApiUrl}/responses`,
      {
        model: env.openaiModel,
        input: prompt,
        store: false
      },
      {
        headers: {
          Authorization: `Bearer ${env.openaiApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: env.requestTimeoutMs
      }
    );

    translatedText = extractOutputText(response.data);
  } catch (error) {
    const nextError = new Error(
      error.response?.data?.error?.message ??
        error.response?.data?.message ??
        error.message ??
        "Tone-enhanced translation failed."
    );
    nextError.statusCode = error.response?.status ?? 502;
    throw nextError;
  }

  if (!translatedText) {
    const error = new Error("OpenAI returned an empty translation.");
    error.statusCode = 502;
    throw error;
  }

  await storageService.saveTranslation({
    id: uuidv4(),
    sourceText: userMessage.trim(),
    translatedText,
    sourceLanguage: normalizedSource,
    targetLanguage: normalizedTarget,
    detectedLanguage: normalizedSource,
    targetLanguageLabel: getLanguageByCode(normalizedTarget).name,
    detectedLanguageLabel:
      normalizedSource === "auto" ? "Auto Detect" : getLanguageByCode(normalizedSource).name,
    favorite: false,
    createdAt: new Date().toISOString(),
    learning: null
  });

  return {
    translated_text: translatedText
  };
};
