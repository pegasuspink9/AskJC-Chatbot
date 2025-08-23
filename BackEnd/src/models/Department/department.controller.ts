import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateDepartment, UpdateDepartment } from "./department.types";
import { Department } from "@prisma/client";

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments: Department[] = await prisma.department.findMany({
      include: {
        faqs: true,
        program: true,
      },
    });

    return successResponse(res, departments, "Departments fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch departments");
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
      include: {
        faqs: true,
        program: true,
      },
    });

    if (!department)
      return errorResponse(res, "Not Found", "Department not found", 404);

    return successResponse(res, department, "Department fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch department");
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data: CreateDepartment = req.body;

    const department: Department = await prisma.department.create({
      data,
    });

    return successResponse(res, department, "Department created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create department");
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateDepartment = req.body;

    const department = await prisma.department.update({
      where: { id: Number(id) },
      data,
    });

    return successResponse(res, department, "Department updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update department");
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id: Number(id) },
    });

    return successResponse(res, null, "Department deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete department");
  }
};
