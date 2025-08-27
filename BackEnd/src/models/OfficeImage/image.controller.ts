import { prisma } from "../../../prisma/client";
import { Response, Request } from "express";
import { CreateOfficeImage, UpdateOfficeImage } from "./image.types";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const images = await prisma.officeImage.findMany({
      include: { office: true },
    });

    return successResponse(res, images, "Office images fetched");
  } catch (error) {
    return errorResponse(res, error, "Office images not found", 404);
  }
};

export const createOfficeImage = async (req: Request, res: Response) => {
  try {
    const data: CreateOfficeImage = req.body;
    const image = await prisma.officeImage.createMany({ data });

    return successResponse(res, image, "Office image created", 201);
  } catch (error) {
    return errorResponse(res, error, "Failed to create office image");
  }
};

export const updateOfficeImage = async (req: Request, res: Response) => {
  try {
    const data: UpdateOfficeImage = req.body;
    const image = await prisma.officeImage.update({
      where: { id: Number(req.params.id) },
      data,
    });

    return successResponse(res, image, "Office image updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update office image");
  }
};

export const deleteOfficialImage = async (req: Request, res: Response) => {
  try {
    await prisma.officeImage.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Office image deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete office image");
  }
};
