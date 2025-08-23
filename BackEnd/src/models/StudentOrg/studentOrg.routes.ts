import { Router } from "express";
import * as StudentOrgController from "./studentOrg.controller";

const router = Router();

router.get("/", StudentOrgController.getAllStudentOrg);
router.get("/:id", StudentOrgController.getStudentOrgById);
router.post("/", StudentOrgController.createStudentOrg);
router.put("/:id", StudentOrgController.updateStudentOrg);
router.delete("/:id", StudentOrgController.deleteStudentOrg);

export default router;
