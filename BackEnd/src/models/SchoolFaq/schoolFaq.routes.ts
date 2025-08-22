import { Router } from "express";
import * as SchoolFaqController from "./schoolFaq.controller";

const router = Router();

router.get("/", SchoolFaqController.getSchoolFaqs);
router.post("/", SchoolFaqController.createSchoolFaq);
router.put("/:id", SchoolFaqController.updateSchoolFaq);
router.delete("/:id", SchoolFaqController.deleteSchoolFaq);

export default router;
