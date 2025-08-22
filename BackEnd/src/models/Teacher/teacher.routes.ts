import { Router } from "express";
import * as TeacherController from "./teacher.controller";

const router = Router();

router.get("/", TeacherController.getAllTeachers);
router.get("/:id", TeacherController.getTeacherById);
router.post("/", TeacherController.createTeacher);
router.put("/:id", TeacherController.updateTeacher);
router.delete("/:id", TeacherController.deleteTeacher);

export default router;
