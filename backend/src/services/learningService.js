const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

const extractWordTokens = (text) => {
  const segments = Array.from(segmenter.segment(text));
  return segments
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment.trim())
    .filter(Boolean);
};

export const buildLearningBundle = async ({
  text,
  translatedText,
  detectedLanguage,
  targetLanguage,
  provider
}) => {
  const uniqueTokens = [...new Set(extractWordTokens(text))].slice(0, 8);

  const wordMappings = [];
  for (const token of uniqueTokens) {
    try {
      const result = await provider.translate({
        text: token,
        sourceLanguage: detectedLanguage === "auto" ? "auto" : detectedLanguage,
        targetLanguage
      });

      wordMappings.push({
        sourceWord: token,
        translatedWord: result.translatedText
      });
    } catch {
      wordMappings.push({
        sourceWord: token,
        translatedWord: "Unavailable"
      });
    }
  }

  return {
    originalSentence: text,
    translatedSentence: translatedText,
    wordMappings,
    note:
      wordMappings.length > 0
        ? "Word mappings are best-effort hints for learning and may not fully preserve sentence context."
        : "No word-level hints were generated for this sentence."
  };
};
