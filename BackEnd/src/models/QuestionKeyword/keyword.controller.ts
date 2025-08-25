import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateQuestionKeyword, UpdateQuestionKeyword } from "./keyword.types";

export const getKeywords = async (_: Request, res: Response) => {
  try {
    const keywords = await prisma.questionKeyword.findMany({
      include: { faq: true },
    });
    return successResponse(res, keywords, "Keywords fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch keywords");
  }
};

export const getKeywordById = async (req: Request, res: Response) => {
  try {
    const keyword = await prisma.questionKeyword.findUnique({
      where: { id: Number(req.params.id) },
      include: { faq: true },
    });
    if (!keyword)
      return errorResponse(res, "Keyword not found", "Not Found", 404);
    return successResponse(res, keyword, "Keyword fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch keyword");
  }
};

export const createQuestionKeyword = async (req: Request, res: Response) => {
  try {
    const data: CreateQuestionKeyword = req.body;
    const keyword = await prisma.questionKeyword.createMany({ data });
    return successResponse(res, keyword, "Keyword created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create keyword");
  }
};

export const updateKeyword = async (req: Request, res: Response) => {
  try {
    const data: UpdateQuestionKeyword = req.body;
    const keyword = await prisma.questionKeyword.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, keyword, "Keyword updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update keyword");
  }
};

export const deleteKeyword = async (req: Request, res: Response) => {
  try {
    await prisma.questionKeyword.delete({
      where: { id: Number(req.params.id) },
    });
    return successResponse(res, null, "Keyword deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete keyword");
  }
};
