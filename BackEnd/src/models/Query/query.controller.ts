import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { CreateQuery } from "./query.types";
import { getOrCreateUserFromRequest } from "../User/user.controller";
import { successResponse, errorResponse } from "../../../utils/response";
import { extractKeywords } from "../../../utils/extractKeywords";
import { getScholarshipFaqAnswer } from "models/chatbot/Scholarship/scholarship.service";
import { measureResponseTime } from "../../../utils/responseTimeCounter";
import { handleChatbotMessage } from "models/chatbot/Scholarship/scholarship.service";

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

export const getQueriesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const queries = await prisma.query.findMany({
      where: { user_id: Number(userId) },
      select: {
        id: true,
        user_id: true,
        query_text: true,
        session: {
          select: {
            chatbot_response: true,
          },
        },
      },
    });

    if (!queries || queries.length === 0) {
      return errorResponse(
        res,
        "No queries found for this user",
        "Not Found",
        404
      );
    }

    const formattedQueries = queries.map((q) => ({
      queryId: q.id,
      userId: q.user_id,
      queryText: q.query_text,
      chatbotResponse: q.session?.chatbot_response ?? null,
    }));

    return successResponse(res, formattedQueries, "User queries fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch user queries");
  }
};

export const createQuery = async (req: Request, res: Response) => {
  try {
    const data: CreateQuery = req.body;
    const user = await getOrCreateUserFromRequest(req, res);

    const { result: chatbotData, duration: responseTime } =
      await measureResponseTime(async () => {
        return await handleChatbotMessage(user.id, data.query_text);
      });

    const chatbotResponse = chatbotData.answer;
    const queryId = chatbotData.queryId;

    await prisma.chatbotSession.updateMany({
      where: { user_id: user.id },
      data: {
        chatbot_response: chatbotResponse,
        response_time: new Date(),
      },
    });

    return successResponse(
      res,
      {
        queryId,
        chatbotResponse,
        responseTime: responseTime,
      },
      "Query created"
    );
  } catch (error) {
    console.error("Error in createQuery:", error);
    return errorResponse(res, error, "Failed to create query");
  }
};
