import { llmTranslateText } from "../services/llmTranslationService.js";

export const llmTranslate = async (req, res, next) => {
  try {
    const {
      source_lang: sourceLanguage = "auto",
      target_lang: targetLanguage,
      selected_tone: selectedTone = "Professional",
      user_message: userMessage = ""
    } = req.body;

    if (!userMessage.trim()) {
      return res.status(400).json({ message: "User message is required." });
    }

    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required." });
    }

    const result = await llmTranslateText({
      sourceLanguage,
      targetLanguage,
      selectedTone,
      userMessage
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
