import express from "express";
import * as DevInfoController from "./devInfo.controller";

const router = express.Router();

router.get("/", DevInfoController.getAllDevInfo);
router.post("/", DevInfoController.createDevInfo);
router.put("/:id", DevInfoController.updateDevInfo);
router.delete("/:id", DevInfoController.deleteDevInfo);

export default router;
