import { getLanguages } from "../services/languageService.js";

export const listLanguages = (_req, res) => {
  res.json({ languages: getLanguages() });
};
