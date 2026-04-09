import { Router } from "express";
import translationRoutes from "./translationRoutes.js";
import historyRoutes from "./historyRoutes.js";
import languageRoutes from "./languageRoutes.js";
import speechRoutes from "./speechRoutes.js";
import llmTranslationRoutes from "./llmTranslationRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.use("/translate", translationRoutes);
router.use("/llm-translate", llmTranslationRoutes);
router.use("/history", historyRoutes);
router.use("/languages", languageRoutes);
router.use("/speech", speechRoutes);

export default router;
