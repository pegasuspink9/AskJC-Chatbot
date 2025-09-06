import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateNavigation, UpdateNavigation } from "./navigation.types";

export const getNavigation = async (_: Request, res: Response) => {
  try {
    const navigation = await prisma.navigation.findMany();
    return successResponse(res, navigation, "Navgation fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch navigation");
  }
};

export const createNavigation = async (req: Request, res: Response) => {
  try {
    const data: CreateNavigation[] = req.body;
    const navigation = await prisma.navigation.createMany({ data });
    return successResponse(res, navigation, "Navigation created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create navigation");
  }
};

export const updateNavigation = async (req: Request, res: Response) => {
  try {
    const data: UpdateNavigation = req.body;
    const navigation = await prisma.navigation.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, navigation, "Navigation updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update navigation");
  }
};

export const deleteNavigation = async (req: Request, res: Response) => {
  try {
    await prisma.navigation.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "Navigation deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete navigation");
  }
};
