import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { getOrCreateUserFromRequest } from "../User/user.controller";
import { successResponse, errorResponse } from "../../../utils/response";
import { measureResponseTime } from "../../../utils/responseTimeCounter";
import { handleChatbotMessage } from "models/chatbot/Scholarship/scholarship.services";

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
    const { query_text } = req.body;
    if (!query_text) {
      return errorResponse(res, "query_text is required.", "Bad Request", 400);
    }

    const user = await getOrCreateUserFromRequest(req, res);
    if (!user) {
      return errorResponse(
        res,
        "Could not identify or create user.",
        "Server Error",
        500
      );
    }

    const { result: chatbotData, duration: responseTime } =
      await measureResponseTime(async () => {
        return await handleChatbotMessage(user.id, query_text);
      });

    await prisma.chatbotSession.updateMany({
      where: { user_id: user.id },
      data: {
        chatbot_response: chatbotData.answer,
        response_time: new Date(),
        total_queries: { increment: 1 },
      },
    });

    return successResponse(
      res,
      {
        queryId: chatbotData.queryId,
        chatbotResponse: chatbotData.answer,
        responseTime,
      },
      "Query created"
    );
  } catch (error) {
    console.error("Error in createQuery:", error);
    return errorResponse(res, error, "Failed to create query");
  }
};
