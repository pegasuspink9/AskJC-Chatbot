import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateProgram, UpdateProgram } from "./program.types";

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      include: { department: true, courses: true },
    });

    return successResponse(res, programs, "Programs fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch programs");
  }
};

export const getProgramById = async (req: Request, res: Response) => {
  try {
    const program = await prisma.program.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!program)
      return errorResponse(res, "Program not found", "Not found", 404);
    return successResponse(res, program, "Program fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch program");
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const data: CreateProgram = req.body;
    const program = await prisma.program.create({ data });
    return successResponse(res, program, "Program created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create program");
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const data: UpdateProgram = req.body;
    const program = await prisma.program.update({
      where: { id: Number(req.params.body) },
      data,
    });
    return successResponse(res, program, "Program updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update program");
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    await prisma.program.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Program deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete program");
  }
};
