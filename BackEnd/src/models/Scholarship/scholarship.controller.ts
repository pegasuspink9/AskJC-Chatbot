import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateScholarship, UpdateScholarship } from "./scholarship.types";

export const getScholarships = async (req: Request, res: Response) => {
  try {
    const scholarships = await prisma.scholarship.findMany();

    return successResponse(res, scholarships, "Scholarships fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch scholarships");
  }
};

export const getScholarshipById = async (req: Request, res: Response) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!scholarship)
      return errorResponse(res, "Scholarship not found", "Not found", 404);
    return successResponse(res, scholarship, "Scholarship fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch scholarship");
  }
};

export const createScholarship = async (req: Request, res: Response) => {
  try {
    const data: CreateScholarship = req.body;
    const scholarship = await prisma.scholarship.createMany({ data });
    return successResponse(res, scholarship, "Scholarship created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create scholarship");
  }
};

export const updateScholarship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateScholarship = req.body;

    const scholarship = await prisma.scholarship.update({
      where: { id: Number(id) },
      data,
    });
    return successResponse(res, scholarship, "Scholarship updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update scholarship");
  }
};

export const deleteScholarship = async (req: Request, res: Response) => {
  try {
    await prisma.scholarship.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Scholarship deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete scholarship");
  }
};
