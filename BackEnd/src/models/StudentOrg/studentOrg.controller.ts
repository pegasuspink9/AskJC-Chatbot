import { Request, Response } from "express";
import {
  StudentOrg,
  CreateStudentOrg,
  UpdateStudentOrg,
} from "./studentOrg.types";
import { prisma } from "../../../prisma/client";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllStudentOrg = async (req: Request, res: Response) => {
  try {
    const teachers: StudentOrg[] = await prisma.studentOrg.findMany({
      include: { faqs: true },
    });

    return successResponse(res, teachers, "Student organizations fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch student organization");
  }
};

export const getStudentOrgById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const studentOrg = await prisma.studentOrg.findUnique({
      where: { id: Number(id) },
      include: { faqs: true },
    });

    if (!studentOrg)
      return errorResponse(
        res,
        "Not Found",
        "Student organization not found",
        404
      );

    return successResponse(res, studentOrg, "Teacher fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch student organization");
  }
};

export const createStudentOrg = async (req: Request, res: Response) => {
  try {
    const data: CreateStudentOrg[] = req.body;

    const organization = await prisma.studentOrg.createMany({
      data,
    });

    return successResponse(res, organization, "Student organization created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create student organization");
  }
};

export const updateStudentOrg = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateStudentOrg = req.body;

    const studentOrg = await prisma.studentOrg.update({
      where: { id: Number(id) },
      data,
    });

    return successResponse(res, studentOrg, "Student organization updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update student organization");
  }
};

export const deleteStudentOrg = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.studentOrg.delete({
      where: { id: Number(id) },
    });

    return successResponse(res, null, "Student organization deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete student organization");
  }
};
