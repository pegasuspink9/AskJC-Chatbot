import express from "express";
import * as ProgramController from "./program.controller";

const router = express.Router();

router.get("/", ProgramController.getPrograms);
router.get("/:id", ProgramController.getProgramById);
router.post("/", ProgramController.createProgram);
router.put("/:id", ProgramController.updateProgram);
router.delete("/:id", ProgramController.deleteProgram);

export default router;
