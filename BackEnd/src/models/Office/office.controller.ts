import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { Office, CreateOffice, UpdateOffice } from "./office.types";

export const getOffice = async (_: Request, res: Response) => {
  try {
    const offices: Office[] = await prisma.office.findMany({
      include: { faqs: true },
    });
    return successResponse(res, offices, "Offices fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch offices");
  }
};

export const createOffice = async (req: Request, res: Response) => {
  try {
    const data: CreateOffice[] = req.body;
    const office = await prisma.office.createMany({ data });
    return successResponse(res, office, "Office created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create office");
  }
};

export const updateOffice = async (req: Request, res: Response) => {
  try {
    const data: UpdateOffice = req.body;
    const office = await prisma.office.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, office, "Office updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update office");
  }
};

export const deleteOffice = async (req: Request, res: Response) => {
  try {
    await prisma.office.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Office deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete office");
  }
};
