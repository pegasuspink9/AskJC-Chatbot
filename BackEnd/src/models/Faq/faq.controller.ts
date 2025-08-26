import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateFaq, UpdateFaq } from "./faq.types";

export const getFaqs = async (_: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({
      include: { keywords: true, department: true },
    });
    return successResponse(res, faqs, "FAQs fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch FAQs");
  }
};

export const getFaqById = async (req: Request, res: Response) => {
  try {
    const faq = await prisma.faq.findUnique({
      where: { id: Number(req.params.id) },
      include: { department: true, keywords: true },
    });
    if (!faq) return errorResponse(res, "FAQ not found", "Not Found", 404);
    return successResponse(res, faq, "FAQ fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch FAQ");
  }
};

export const createFaq = async (req: Request, res: Response) => {
  try {
    const data: CreateFaq = req.body;
    const faq = await prisma.faq.createMany({ data });
    return successResponse(res, faq, "FAQ created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create FAQ");
  }
};

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const data: UpdateFaq = req.body;
    const faq = await prisma.faq.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, faq, "FAQ updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update FAQ");
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    await prisma.faq.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "FAQ deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete FAQ");
  }
};
