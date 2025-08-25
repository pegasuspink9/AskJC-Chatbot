import { Router } from "express";
import * as SessionController from "./chatbotSession.controller";

const router = Router();

router.get("/", SessionController.getSessions);
router.get("/:id", SessionController.getSessionById);
router.post("/", SessionController.createSession);

export default router;
