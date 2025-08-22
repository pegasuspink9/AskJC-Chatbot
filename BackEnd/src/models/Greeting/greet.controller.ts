import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateGreeting, UpdateGreeting } from "./greet.types";

export const getGreetings = async (_: Request, res: Response) => {
  try {
    const greetings = await prisma.greeting.findMany();
    return successResponse(res, greetings, "Greetings fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch greetings");
  }
};

export const createGreeting = async (req: Request, res: Response) => {
  try {
    const data: CreateGreeting = req.body;
    const greeting = await prisma.greeting.create({ data });
    return successResponse(res, greeting, "Greeting created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create greeting");
  }
};

export const updateGreeting = async (req: Request, res: Response) => {
  try {
    const data: UpdateGreeting = req.body;
    const greeting = await prisma.greeting.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, greeting, "Greeting updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update greeting");
  }
};

export const deleteGreeting = async (req: Request, res: Response) => {
  try {
    await prisma.greeting.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Greeting deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete greeting");
  }
};
