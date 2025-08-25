import { Router } from "express";
import { getOrCreateUserFromRequest } from "./user.controller";

const router = Router();

router.post("/get-or-create", getOrCreateUserFromRequest);

export default router;
