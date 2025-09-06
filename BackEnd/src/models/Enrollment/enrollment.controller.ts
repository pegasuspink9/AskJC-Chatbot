import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateEnrollment, UpdateEnrollment } from "./enrollment.types";

export const getEnrollment = async (_: Request, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.findMany();
    return successResponse(res, enrollment, "Enrollment fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch enrollment");
  }
};

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const data: CreateEnrollment[] = req.body;
    const enrollment = await prisma.enrollment.createMany({ data });
    return successResponse(res, enrollment, "Enrollment created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create enrollment");
  }
};

export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const data: UpdateEnrollment = req.body;
    const enrollment = await prisma.enrollment.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, enrollment, "Enrollment updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update enrollment");
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    await prisma.enrollment.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "Enrollment deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete enrollment");
  }
};
