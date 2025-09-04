import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import {
  CreateEnrollment,
  UpdateEnrollment,
} from "./enrollmentAndNavigation.types";

export const getEnrollmentAndNavigation = async (_: Request, res: Response) => {
  try {
    const enrollAndNav = await prisma.enrollmentAndNavigation.findMany();
    return successResponse(
      res,
      enrollAndNav,
      "Enrollment and navigation fetched"
    );
  } catch (error) {
    return errorResponse(
      res,
      error,
      "Failed to fetch enrollment and navigation"
    );
  }
};

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const data: CreateEnrollment = req.body;
    const enrollAndNav = await prisma.enrollmentAndNavigation.create({ data });
    return successResponse(
      res,
      enrollAndNav,
      "Enrollment and navigation created"
    );
  } catch (error) {
    return errorResponse(
      res,
      error,
      "Failed to create enrollment and navigation"
    );
  }
};

export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const data: UpdateEnrollment = req.body;
    const enrollAndNav = await prisma.enrollmentAndNavigation.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(
      res,
      enrollAndNav,
      "Enrollment and navigation updated"
    );
  } catch (error) {
    return errorResponse(
      res,
      error,
      "Failed to update enrollment and navigation"
    );
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    await prisma.enrollmentAndNavigation.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "Enrollment and navigation deleted");
  } catch (error) {
    return errorResponse(
      res,
      error,
      "Failed to delete enrollment and navigation"
    );
  }
};
