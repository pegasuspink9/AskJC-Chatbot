import { prisma } from "../../../prisma/client";
import { Response, Request } from "express";
import {
  CreateFacilities,
  UpdateFacilities,
} from "./officeAndFacilities.types";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await prisma.officeAndFacilities.findMany({
      include: { office: true },
    });

    return successResponse(res, facilities, "Facilities fetched");
  } catch (error) {
    return errorResponse(res, error, "Facilities not found", 404);
  }
};

export const createFacilities = async (req: Request, res: Response) => {
  try {
    const data: CreateFacilities[] = req.body;
    const facility = await prisma.officeAndFacilities.createMany({ data });

    return successResponse(res, facility, "Facilities created", 201);
  } catch (error) {
    return errorResponse(res, error, "Failed to Facilities");
  }
};

export const updateFacilities = async (req: Request, res: Response) => {
  try {
    const data: UpdateFacilities = req.body;
    const image = await prisma.officeAndFacilities.update({
      where: { id: Number(req.params.id) },
      data,
    });

    return successResponse(res, image, "Facilities updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to facilities image");
  }
};

export const deleteFacilities = async (req: Request, res: Response) => {
  try {
    await prisma.officeAndFacilities.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "Facilities deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to facilities");
  }
};
