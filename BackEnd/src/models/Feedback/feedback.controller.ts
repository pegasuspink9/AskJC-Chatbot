import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { Feedback, CreateFeedback } from "./feedback.types";
import { successResponse, errorResponse } from "../../../utils/response";

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const { query_id } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { query_id: Number(query_id) },
      include: { user: true, query: true },
    });

    return successResponse(res, feedbacks, "Feedback fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch feedback");
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const data: CreateFeedback = req.body;

    const query = await prisma.query.findUnique({
      where: { id: data.query_id },
    });

    if (!query) {
      return errorResponse(res, "Query not found", "Invalid query_id", 400);
    }

    const feedback: Feedback = await prisma.feedback.create({
      data,
    });

    return successResponse(res, feedback, "Feedback created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create feedback");
  }
};
