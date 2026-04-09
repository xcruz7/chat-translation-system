import { translateText } from "../services/translationService.js";

export const translate = async (req, res, next) => {
  try {
    const { text = "", sourceLanguage = "auto", targetLanguage, includeLearning = true } = req.body;

    if (!text.trim()) {
      return res.status(400).json({ message: "Text is required for translation." });
    }

    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required." });
    }

    const result = await translateText({
      text: text.trim(),
      sourceLanguage,
      targetLanguage,
      includeLearning
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
