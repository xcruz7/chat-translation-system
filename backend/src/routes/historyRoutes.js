import { Router } from "express";
import {
  clearHistory,
  getHistory,
  toggleFavorite
} from "../controllers/historyController.js";

const router = Router();

router.get("/", getHistory);
router.patch("/:id/favorite", toggleFavorite);
router.delete("/", clearHistory);

export default router;
