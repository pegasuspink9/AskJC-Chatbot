import { Router } from "express";
import * as NavigationController from "./navigation.controller";

const router = Router();

router.get("/", NavigationController.getNavigation);
router.post("/", NavigationController.createNavigation);
router.put("/:id", NavigationController.updateNavigation);
router.delete("/:id", NavigationController.deleteNavigation);

export default router;
