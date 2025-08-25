import { Router } from "express";
import * as FaqController from "./faq.controller";

const router = Router();

router.get("/", FaqController.getFaqs);
router.get("/:id", FaqController.getFaqById);
router.post("/", FaqController.createFaq);
router.put("/:id", FaqController.updateFaq);
router.delete("/:id", FaqController.deleteFaq);

export default router;
