import { Request, Response } from "express";
import { Teacher, CreateTeacher, UpdateTeacher } from "./teacher.types";
import { prisma } from "../../../prisma/client";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers: Teacher[] = await prisma.teacher.findMany({
      include: { department: true },
    });

    return successResponse(res, teachers, "Teachers fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch teachers");
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(id) },
      include: { department: true },
    });

    if (!teacher)
      return errorResponse(res, "Not Found", "Teacher not found", 404);

    return successResponse(res, teacher, "Teacher fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch teacher");
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const data: CreateTeacher = req.body;

    const teacher: Teacher = await prisma.teacher.create({
      data,
    });

    return successResponse(res, teacher, "Teacher created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create teacher");
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateTeacher = req.body;

    const teacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data,
    });

    return successResponse(res, teacher, "Teacher updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update teacher");
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.teacher.delete({
      where: { id: Number(id) },
    });

    return successResponse(res, null, "Teacher deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete teacher");
  }
};
