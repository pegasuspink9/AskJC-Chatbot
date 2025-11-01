import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { CreateQuery } from "./query.types";
import { correctGrammar, isSignificantlyDifferent } from '../chatbot/prompts/grammarCorrector';
import { getOrCreateUserFromRequest } from "../User/user.controller";
import { successResponse, errorResponse } from "../../../utils/response";
import { measureResponseTime } from "../../../utils/responseTimeCounter";
import { schoolOfficialsQuery } from "../chatbot/Shool Official/schoolOfficials";
import { scholarshipQuery } from "../chatbot/Scholarship/scholarship.services";
import { getDialogflowResponse } from "../../../helper/dialogflow";
import { departmentOfficialsQuery } from "../../models/chatbot/School Department/schoolDepartment";
import { contactQuery } from "../../models/chatbot/schoolContacts/schoolContact";
import { officeQuery } from "../../models/chatbot/schoolOffices/schoolOffices";
import { schoolDetailQuery } from "../../models/chatbot/School Details/schoolDetails.service";
import { organizationQuery } from "../../models/chatbot/schoolOrganization/schoolOrganization";
import { programQuery } from "../../models/chatbot/schoolProgram/schoolProgram";
import { navigationQuery } from "../../models/chatbot/Navigation/navigation";
import { officeFacilitiesQuery } from "../../models/chatbot/Office and Facilities/officeAndFacilities.service";
import { courseQuery } from "../chatbot/schoolCourses/schoolCourses";
import { devInfoQuery } from "../../models/chatbot/DevInfo/devInfo.services";
import { enrollmentQuery } from "../chatbot/schoolEnrollment/schoolEnrollment";

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

    let chatbotSession = await prisma.chatbotSession.findUnique({
      where: { user_id: user.id },
    });

    if (!chatbotSession) {
      chatbotSession = await prisma.chatbotSession.create({
        data: {
          user_id: user.id,
          chatbot_response: [],
          response_time: new Date(),
          total_queries: 0,
        },
      });
    }

    const CONTEXT_WINDOW_SIZE = 6;
    const conversationHistory: string[] = chatbotSession.chatbot_response.slice(
      -CONTEXT_WINDOW_SIZE
    );

    // 🚀 ADD GRAMMAR CORRECTION HERE
    let correctedQueryText = query_text;
    let wasCorrected = false;

    try {
      correctedQueryText = await correctGrammar(query_text);
      wasCorrected = isSignificantlyDifferent(query_text, correctedQueryText);
      
      if (wasCorrected) {
        console.log(`✏️ Grammar corrected: "${query_text}" → "${correctedQueryText}"`);
      }
    } catch (correctionError) {
      console.error('⚠️ Grammar correction failed, using original:', correctionError);
      correctedQueryText = query_text;
    }

    const query = await prisma.query.create({
      data: {
        user_id: user.id,
        chatbot_session_id: chatbotSession.id,
        query_text: correctedQueryText, // 🚀 Use corrected text
        users_data_inputed: [query_text], // 🚀 Keep original in inputed
        chatbot_response: [],
        created_at: new Date(),
      },
    });

    const { result: chatbotData, duration: responseTime } =
      await measureResponseTime(async () => {
        try {
          const dialogflowSessionPath = `projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${user.id}`;

          // 🚀 Use corrected text for Dialogflow
          const dialogflowResponse = await getDialogflowResponse(
            correctedQueryText, // 🚀 Changed from query_text
            dialogflowSessionPath,
            conversationHistory
          );

          if (!dialogflowResponse) {
            console.log("No Dialogflow response, using default service");
            return await schoolOfficialsQuery(
              user.id,
              correctedQueryText, // 🚀 Changed from query_text
              conversationHistory
            );
          }

          console.log(`Detected intent: ${dialogflowResponse.intent}`);
          console.log(`Confidence: ${dialogflowResponse.confidence}`);
          console.log(`Parameters:`, dialogflowResponse.parameters);

          const intentName = dialogflowResponse.intent.toLowerCase();

          if (
            intentName.includes("scholarship") ||
            intentName.includes("financial") ||
            intentName.includes("funding") ||
            intentName.includes("grant")
          ) {
            console.log(
              "Routing to scholarship service based on intent:",
              dialogflowResponse.intent
            );
            return await scholarshipQuery(
              user.id,
              correctedQueryText, // 🚀 Use corrected everywhere
              conversationHistory
            );
          }  else if (
            intentName.includes("office") ||
            intentName.includes("offices") ||
            intentName.includes("building") ||
            intentName.includes("location") ||
            intentName.includes("floor")
          ) {
            console.log(
              "Routing to school office service based on intent:",
              dialogflowResponse.intent
            );
            return await officeQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("program") ||
            intentName.includes("course") ||
            intentName.includes("courses") ||
            intentName.includes("tuition")
          ) {
            console.log(
              "Routing to school program service based on intent:",
              dialogflowResponse.intent
            );
            return await programQuery(user.id, correctedQueryText, conversationHistory);
          } 
          // ... continue with all other intents using correctedQueryText ...
          else if (
            intentName.includes("department") ||
            intentName.includes("departments") ||
            intentName.includes("head") ||
            intentName.includes("heads") ||
            intentName.includes("faculty") ||
            intentName.includes("faculty members")
          ) {
            return await departmentOfficialsQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("contact") ||
            intentName.includes("contacts") ||
            intentName.includes("email") ||
            intentName.includes("phone") ||
            intentName.includes("facebook")
          ) {
            return await contactQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("organization") ||
            intentName.includes("organizations") ||
            intentName.includes("student org") ||
            intentName.includes("club") ||
            intentName.includes("society")
          ) {
            return await organizationQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("detail") ||
            intentName.includes("details") ||
            intentName.includes("history") ||
            intentName.includes("mission") ||
            intentName.includes("vision") ||
            intentName.includes("goal") ||
            intentName.includes("address") ||
            intentName.includes("accreditation")
          ) {
            return await schoolDetailQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("facility") ||
            intentName.includes("facilities") ||
            intentName.includes("classroom") ||
            intentName.includes("room")
          ) {
            return await officeFacilitiesQuery(user.id, correctedQueryText, conversationHistory);
          }  else if(
            intentName.includes("course") ||
            intentName.includes("classes") ||
            intentName.includes("schedule") ||
            intentName.includes("subject")
          ){
            return await courseQuery(user.id, correctedQueryText, conversationHistory);
          }else if (
            intentName.includes("enroll") ||
            intentName.includes("enrollment") ||
            intentName.includes("admission") ||
            intentName.includes("apply") ||
            intentName.includes("registration")
          ) {
            return await enrollmentQuery(user.id, correctedQueryText, conversationHistory);
          }      
          else if (
            intentName.includes("navigation") ||
            intentName.includes("menu") ||
            intentName.includes("home") ||
            intentName.includes("page") ||
            intentName.includes("link")
          ) {
            return await navigationQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("dean") ||
            intentName.includes("principal") ||
            intentName.includes("director") || 
            intentName.includes("chancellor") ||
            intentName.includes("president") ||
            intentName.includes("official")
          ) {
            return await schoolOfficialsQuery(user.id, correctedQueryText, conversationHistory);
          } else if (
            intentName.includes("developer") ||
            intentName.includes("created")
          ) {
            return await devInfoQuery(user.id, correctedQueryText, conversationHistory);
          } else {
            return await schoolOfficialsQuery(user.id, correctedQueryText, conversationHistory);
          }
        } catch (dialogflowError) {
          console.error("Dialogflow processing failed:", dialogflowError);
          console.log(
            "Dialogflow failed, using default school official service"
          );
          return await schoolOfficialsQuery(
            user.id,
            correctedQueryText,
            conversationHistory
          );
        }
      });

    await prisma.chatbotSession.update({
      where: { id: chatbotSession.id },
      data: {
        chatbot_response: {
          push: [correctedQueryText, chatbotData.answer], // 🚀 Use corrected
        },
        response_time: new Date(),
        total_queries: { increment: 1 },
      },
    });

    await prisma.query.update({
      where: { id: query.id },
      data: {
        chatbot_response: [chatbotData.answer],
      },
    });

    return successResponse(
      res,
      {
        queryId: query.id,
        chatbotResponse: chatbotData.answer,
        responseTime,
        wasCorrected, // 🚀 Include correction info
        originalQuery: wasCorrected ? query_text : undefined, // 🚀 Show original if corrected
      },
      "Query created"
    );
  } catch (error) {
    console.error("Error in createQuery:", error);
    return errorResponse(res, error, "Failed to create query");
  }
};

export const deleteAllUserQueries = async (req: Request, res: Response) => {
  try {
    const user = await getOrCreateUserFromRequest(req, res);
    if (!user) {
      return errorResponse(
        res,
        "Could not identify or create user.",
        "Server Error",
        500
      );
    }

    await prisma.query.deleteMany({
      where: { user_id: user.id },
    });

    await prisma.chatbotSession.updateMany({
      where: { user_id: user.id },
      data: {
        chatbot_response: [],
        total_queries: 0,
        response_time: new Date(),
      },
    });

    return successResponse(res, null, "All user queries deleted successfully");
  } catch (error) {
    console.error("Error deleting user queries:", error);
    return errorResponse(res, error, "Failed to delete queries");
  }
};
