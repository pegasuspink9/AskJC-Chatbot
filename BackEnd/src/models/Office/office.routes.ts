import { Router } from "express";
import * as OfficeController from "./office.controller";

const router = Router();

router.get("/", OfficeController.getOffice);
router.post("/", OfficeController.createOffice);
router.put("/:id", OfficeController.updateOffice);
router.delete("/:id", OfficeController.deleteOffice);

export default router;
