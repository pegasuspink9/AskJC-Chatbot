import { Router } from "express";
import * as EnrollmentAndNavigationController from "./enrollmentAndNavigation.controller";

const router = Router();

router.get("/", EnrollmentAndNavigationController.getEnrollmentAndNavigation);
router.post("/", EnrollmentAndNavigationController.createEnrollment);
router.put("/:id", EnrollmentAndNavigationController.updateEnrollment);
router.delete("/:id", EnrollmentAndNavigationController.deleteEnrollment);

export default router;
