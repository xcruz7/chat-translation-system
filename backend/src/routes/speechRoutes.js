import { Router } from "express";
import { createSpeech } from "../controllers/speechController.js";

const router = Router();

router.post("/", createSpeech);

export default router;
