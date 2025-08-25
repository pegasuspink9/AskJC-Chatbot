import { prisma } from "../../../prisma/client";
import { Response, Request } from "express";
import { successResponse, errorResponse } from "../../../utils/response";

export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.chatbotSession.findMany({
      include: { user: true, queries: true },
    });

    return successResponse(res, sessions, "Sessions fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch sessions");
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.chatbotSession.findUnique({
      where: { id: Number(id) },
      include: { user: true, queries: true },
    });

    if (!session)
      return errorResponse(res, "Session not found", "Not Found", 404);

    return successResponse(res, session, "Session fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch session");
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    let { user_id } = req.body;

    if (!user_id) {
      const guestUser = await prisma.user.create({
        data: { created_at: new Date() },
      });
      user_id = guestUser.id;
    } else {
      await prisma.user.update({
        where: { id: user_id },
        data: { last_active: new Date() },
      });
    }

    let session = await prisma.chatbotSession.findFirst({
      where: { user_id },
      orderBy: { id: "desc" },
    });

    if (!session) {
      session = await prisma.chatbotSession.create({
        data: {
          user_id,
          total_queries: 0,
          response_time: new Date(),
        },
      });
    }

    return successResponse(res, { session, user_id }, "Session ready");
  } catch (error) {
    return errorResponse(res, error, "Failed to create/get session");
  }
};
