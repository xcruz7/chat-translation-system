import { synthesizeSpeech } from "../services/speechService.js";

export const createSpeech = async (req, res, next) => {
  try {
    const { text = "", languageCode = "en" } = req.body ?? {};

    if (!text.trim()) {
      return res.status(400).json({ message: "Text is required for speech synthesis." });
    }

    const { audioBuffer, contentType, languageCode: resolvedLanguageCode } =
      await synthesizeSpeech({
        text,
        languageCode
      });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-Speech-Language", resolvedLanguageCode);
    return res.send(audioBuffer);
  } catch (error) {
    return next(error);
  }
};
