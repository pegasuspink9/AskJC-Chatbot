import { Router } from "express";
import { getOrCreateUser } from "./user.controller";

const router = Router();

router.post("/get-or-create", getOrCreateUser);

export default router;
