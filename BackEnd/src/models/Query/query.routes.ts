import { Router } from "express";
import * as QueryController from "./query.control";

const router = Router();

router.get("/:id", (req, res) => QueryController.getQueryById(req, res));
router.get("/userId/:userId", QueryController.getQueriesByUserId);
router.post("/", (req, res) => QueryController.createQuery(req, res));
router.delete("/back", QueryController.deleteAllUserQueries);

export default router;
