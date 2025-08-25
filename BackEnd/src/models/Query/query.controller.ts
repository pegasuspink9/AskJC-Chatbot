import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { CreateQuery } from "./query.types";
import { getOrCreateUserFromRequest } from "../User/user.controller";
import { successResponse, errorResponse } from "../../../utils/response";
import { extractKeywords } from "../../../utils/extractKeywords";
import { getScholarshipFaqAnswer } from "models/chatbot/Scholarship/scholarship.service";
import { measureResponseTime } from "../../../utils/responseTimeCounter";

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

    let session = await prisma.chatbotSession.findFirst({
      where: { user_id: user.id },
    });

    if (!session) {
      session = await prisma.chatbotSession.create({
        data: { user_id: user.id },
      });
    }

    const keywords = extractKeywords(data.query_text);

    const query = await prisma.query.create({
      data: {
        user_id: user.id,
        chatbot_session_id: session.id,
        query_text: data.query_text,
        users_data_inputed: keywords,
        created_at: new Date(),
      },
    });

    const { result: chatbotResponse, duration: responseTime } =
      await measureResponseTime(async () => {
        let response = "";

        const matchedFaqs = await prisma.faq.findMany({
          where: {
            OR: [
              {
                keywords: {
                  some: {
                    keyword: { in: keywords },
                  },
                },
              },
              {
                question: {
                  contains: data.query_text,
                  mode: "insensitive",
                },
              },
            ],
          },
          include: {
            scholarships: true,
            keywords: true,
          },
        });

        if (matchedFaqs.length > 0) {
          for (const faq of matchedFaqs) {
            if (faq.category === "Scholarship") {
              const scholarshipAnswer = await getScholarshipFaqAnswer(
                faq.id,
                data.query_text
              );
              response += scholarshipAnswer + "\n";
            } else {
              response += (faq.answer || "") + "\n";
            }
          }
        } else {
          response = "Sorry, I couldn’t find an answer for that.";
        }

        return response.trim();
      });

    await prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        chatbot_response: chatbotResponse,
        response_time: new Date(),
        total_queries: { increment: 1 },
      },
    });

    return successResponse(
      res,
      { queryId: query.id, chatbotResponse, responseTime },
      "Query created"
    );
  } catch (error) {
    return errorResponse(res, error, "Failed to create query");
  }
};
