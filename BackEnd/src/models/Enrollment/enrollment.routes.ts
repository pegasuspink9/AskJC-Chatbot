import { Router } from "express";
import * as EnrollmentController from "./enrollment.controller";

const router = Router();

router.get("/", EnrollmentController.getEnrollment);
router.post("/", EnrollmentController.createEnrollment);
router.put("/:id", EnrollmentController.updateEnrollment);
router.delete("/:id", EnrollmentController.deleteEnrollment);

export default router;
