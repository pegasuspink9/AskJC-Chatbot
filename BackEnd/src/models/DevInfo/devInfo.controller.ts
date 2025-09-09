import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { CreateDevInfo, UpdateDevInfo } from "./devInfo.types";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllDevInfo = async (req: Request, res: Response) => {
  try {
    const devInfo = await prisma.devInfo.findMany();
    return successResponse(res, devInfo, "Dev infos fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch dev infos");
  }
};

export const createDevInfo = async (req: Request, res: Response) => {
  try {
    const data: CreateDevInfo[] = req.body;
    const devInfo = await prisma.devInfo.createMany({ data });

    return successResponse(res, devInfo, "Dev info created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create dev info");
  }
};

export const updateDevInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data: UpdateDevInfo = req.body;
    const devInfo = await prisma.devInfo.update({
      where: { id: Number(id) },
      data,
    });

    return successResponse(res, devInfo, "Dev info updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update dev info");
  }
};

export const deleteDevInfo = async (req: Request, res: Response) => {
  try {
    await prisma.devInfo.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Dev info deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete dev info");
  }
};
