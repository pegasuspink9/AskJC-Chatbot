import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateSchoolFaq, UpdateSchoolFaq } from "./schoolFaq.types";

export const getSchoolFaqs = async (_: Request, res: Response) => {
  try {
    const faqs = await prisma.schoolFaq.findMany({
      include: { school_detail: true },
    });
    return successResponse(res, faqs, "School FAQs fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch school FAQs");
  }
};

export const createSchoolFaq = async (req: Request, res: Response) => {
  try {
    const data: CreateSchoolFaq = req.body;
    const faq = await prisma.schoolFaq.create({ data });
    return successResponse(res, faq, "School FAQ created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create school FAQ");
  }
};

export const updateSchoolFaq = async (req: Request, res: Response) => {
  try {
    const data: UpdateSchoolFaq = req.body;
    const faq = await prisma.schoolFaq.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, faq, "School FAQ updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update school FAQ");
  }
};

export const deleteSchoolFaq = async (req: Request, res: Response) => {
  try {
    await prisma.schoolFaq.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "School FAQ deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete school FAQ");
  }
};
