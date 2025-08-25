import { Router } from "express";
import * as CourseController from "./course.controller";

const router = Router();

router.get("/", CourseController.getCourses);
router.get("/:id", CourseController.getCourseById);
router.post("/", CourseController.createCourse);
router.put("/:id", CourseController.updateCourse);
router.delete("/:id", CourseController.deleteCourse);

export default router;
