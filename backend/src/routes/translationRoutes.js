import { Router } from "express";
import { translate } from "../controllers/translationController.js";

const router = Router();

router.post("/", translate);

export default router;
