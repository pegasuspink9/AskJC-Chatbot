import { Router } from "express";
import * as KeywordController from "./keyword.controller";

const router = Router();

router.get("/", KeywordController.getKeywords);
router.get("/:id", KeywordController.getKeywordById);
router.post("/", KeywordController.createQuestionKeyword);
router.put("/:id", KeywordController.updateKeyword);
router.delete("/:id", KeywordController.deleteKeyword);

export default router;
