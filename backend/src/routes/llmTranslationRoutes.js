import { Router } from "express";
import { llmTranslate } from "../controllers/llmTranslationController.js";

const router = Router();

router.post("/", llmTranslate);

export default router;
