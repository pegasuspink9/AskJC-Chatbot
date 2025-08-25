import { Router } from "express";
import * as DetailController from "./schoolDetail.controller";

const router = Router();

router.get("/", DetailController.getSchoolDetails);
router.get("/:id", DetailController.getSchoolDetailById);
router.post("/", DetailController.createSchoolDetail);
router.put("/:id", DetailController.updateSchoolDetail);
router.delete("/:id", DetailController.deleteSchoolDetail);

export default router;
