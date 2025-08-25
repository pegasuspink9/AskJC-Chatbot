import { Router } from "express";
import * as ContactController from "./contact.controller";

const router = Router();

router.get("/", ContactController.getContacts);
router.post("/", ContactController.createContact);
router.put("/:id", ContactController.updateContact);
router.delete("/:id", ContactController.deleteContact);

export default router;
