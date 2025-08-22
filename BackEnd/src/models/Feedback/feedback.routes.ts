import { Router } from "express";
import * as FeedbackController from "./feedback.controller";

const router = Router();

router.get("/", FeedbackController.getAllFeedbacks);
router.post("/", FeedbackController.createFeedback);

export default router;
