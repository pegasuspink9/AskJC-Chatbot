import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  CreateSchoolOfficial,
  UpdateSchoolOfficial,
} from "./schoolOfficial.types";

export const getSchoolOfficials = async (_: Request, res: Response) => {
  try {
    const officials = await prisma.schoolOfficial.findMany();
    return successResponse(res, officials, "School officials fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch school officials");
  }
};

export const getSchoolOfficialById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const official = await prisma.schoolOfficial.findUnique({ where: { id } });

    if (!official) {
      return errorResponse(res, "Official not found", "Not Found");
    }

    return successResponse(res, official, "School official fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch school official");
  }
};

export const createSchoolOfficial = async (req: Request, res: Response) => {
  try {
    const data: CreateSchoolOfficial = req.body;
    const official = await prisma.schoolOfficial.create({ data });
    return successResponse(res, official, "School official created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create school official");
  }
};

export const updateSchoolOfficial = async (req: Request, res: Response) => {
  try {
    const data: UpdateSchoolOfficial = req.body;
    const official = await prisma.schoolOfficial.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, official, "School official updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update school official");
  }
};

export const deleteSchoolOfficial = async (req: Request, res: Response) => {
  try {
    await prisma.schoolOfficial.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "School official deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete school official");
  }
};
