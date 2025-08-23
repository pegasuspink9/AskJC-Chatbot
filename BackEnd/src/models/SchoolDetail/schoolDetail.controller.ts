import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateSchoolDetail, UpdateSchoolDetail } from "./schoolDetail.types";

export const getSchoolDetails = async (_: Request, res: Response) => {
  try {
    const schools = await prisma.schoolDetail.findMany({
      include: { school_faqs: true },
    });
    return successResponse(res, schools, "School details fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch school details");
  }
};

export const getSchoolDetailById = async (req: Request, res: Response) => {
  try {
    const school = await prisma.schoolDetail.findUnique({
      where: { id: Number(req.params.id) },
      include: { school_faqs: true },
    });
    if (!school)
      return errorResponse(res, "School detail not found", "Not Found", 404);
    return successResponse(res, school, "School detail fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch school detail");
  }
};

export const createSchoolDetail = async (req: Request, res: Response) => {
  try {
    const data: CreateSchoolDetail = req.body;
    const school = await prisma.schoolDetail.create({ data });
    return successResponse(res, school, "School detail created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create school detail");
  }
};

export const updateSchoolDetail = async (req: Request, res: Response) => {
  try {
    const data: UpdateSchoolDetail = req.body;
    const school = await prisma.schoolDetail.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, school, "School detail updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update school detail");
  }
};

export const deleteSchoolDetail = async (req: Request, res: Response) => {
  try {
    await prisma.schoolDetail.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "School detail deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete school detail");
  }
};
