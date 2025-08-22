import { Router } from "express";
import * as QueryController from "./query.controller";

const router = Router();

router.get("/:id", (req, res) => QueryController.getQueryById(req, res));
router.post("/", (req, res) => QueryController.createQuery(req, res));

export default router;
