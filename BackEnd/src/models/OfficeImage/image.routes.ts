import express from "express";
import * as OfficeImageController from "./image.controller";

const router = express.Router();

router.get("/", OfficeImageController.getAllImages);
router.post("/", OfficeImageController.createOfficeImage);
router.put("/:id", OfficeImageController.updateOfficeImage);
router.delete("/:id", OfficeImageController.deleteOfficialImage);

export default router;
