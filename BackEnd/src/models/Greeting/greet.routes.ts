import { Router } from "express";
import * as GreetController from "./greet.controller";

const router = Router();

router.get("/", GreetController.getGreetings);
router.post("/", GreetController.createGreeting);
router.put("/:id", GreetController.updateGreeting);
router.delete("/:id", GreetController.deleteGreeting);

export default router;
