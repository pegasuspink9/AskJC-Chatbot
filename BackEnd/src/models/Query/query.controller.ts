import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { getOrCreateUser } from "../User/user.controller";
import { CreateQuery } from "./query.types";
import { successResponse, errorResponse } from "../../../utils/response";

export const getQueryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = await prisma.query.findUnique({
      where: { id: Number(id) },
      include: { user: true, session: true },
    });

    if (!query) return errorResponse(res, "Query not found", "Not Found", 404);

    return successResponse(res, query, "Query fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch query");
  }
};

export const createQuery = async (req: Request, res: Response) => {
  try {
    const data: CreateQuery = req.body;

    const user = await getOrCreateUser(data.user_id);

    let session;

    if (data.chatbot_session_id) {
      session = await prisma.chatbotSession.findUnique({
        where: { id: data.chatbot_session_id },
      });
    }

    if (!session) {
      session = await prisma.chatbotSession.create({
        data: { user_id: user.id },
      });
    }

    const query = await prisma.query.create({
      data: {
        user_id: user.id,
        chatbot_session_id: session.id,
        query_text: data.query_text,
        created_at: new Date(),
      },
    });

    return successResponse(res, query, "Query created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create query");
  }
};
