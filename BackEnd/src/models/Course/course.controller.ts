import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateCourse, UpdateCourse } from "./course.types";

export const getCourses = async (_: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: { program: true },
    });
    return successResponse(res, courses, "Courses fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch courses");
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(req.params.id) },
      include: { program: true },
    });
    if (!course)
      return errorResponse(res, "Course not found", "Not Found", 404);
    return successResponse(res, course, "Course fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch course");
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const data: CreateCourse[] = req.body;
    const course = await prisma.course.createMany({ data });
    return successResponse(res, course, "Course created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create course");
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const data: UpdateCourse = req.body;
    const course = await prisma.course.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, course, "Course updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update course");
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Course deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete course");
  }
};
