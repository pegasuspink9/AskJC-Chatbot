import express from "express";
import * as OfficeAndFacilities from "./officeAndFacilities.controller";

const router = express.Router();

router.get("/", OfficeAndFacilities.getAllFacilities);
router.post("/", OfficeAndFacilities.createFacilities);
router.put("/:id", OfficeAndFacilities.updateFacilities);
router.delete("/:id", OfficeAndFacilities.deleteFacilities);

export default router;
