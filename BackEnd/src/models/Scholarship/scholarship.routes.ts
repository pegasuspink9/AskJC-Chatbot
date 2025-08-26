import express from "express";
import * as ScholarshipController from "./scholarship.controller";

const router = express.Router();

router.get("/", ScholarshipController.getScholarships);
router.get("/:id", ScholarshipController.getScholarshipById);
router.post("/", ScholarshipController.createScholarship);
router.put("/:id", ScholarshipController.updateScholarship);
router.delete("/:id", ScholarshipController.deleteScholarship);

export default router;
