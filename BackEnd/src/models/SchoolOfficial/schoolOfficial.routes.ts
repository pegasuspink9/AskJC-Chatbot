import { Router } from "express";
import * as SchoolOfficialController from "./schoolOfficial.controller";

const router = Router();

router.get("/", SchoolOfficialController.getSchoolOfficials);
router.get("/:id", SchoolOfficialController.getSchoolOfficialById);
router.post("/", SchoolOfficialController.createSchoolOfficial);
router.put("/:id", SchoolOfficialController.updateSchoolOfficial);
router.delete("/:id", SchoolOfficialController.deleteSchoolOfficial);

export default router;
