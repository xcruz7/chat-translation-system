import { storageService } from "../services/storageService.js";

export const getHistory = async (_req, res, next) => {
  try {
    const history = await storageService.getHistory();
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const entry = await storageService.toggleFavorite(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "History entry not found." });
    }

    return res.json({ entry });
  } catch (error) {
    return next(error);
  }
};

export const clearHistory = async (_req, res, next) => {
  try {
    await storageService.clearHistory();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
