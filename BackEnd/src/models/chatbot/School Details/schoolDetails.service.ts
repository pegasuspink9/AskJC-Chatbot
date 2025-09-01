import { prisma } from "../../../../prisma/client";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { searchSchoolDetails } from "../../../../helper/services/schoolDetail.database";
import {
  tablePrompts,
  singleLinePrompt,
  bulletinPrompts,
} from "../prompts/prompts";

type DFParams = Record<string, any>;

export const schoolDetailQuery = async (
  userId: number,
  message: string,
  conversationHistory: string[] = [],
  dfParams?: DFParams
): Promise<{ answer: string; source: string; queryId: number }> => {
  const session = await prisma.chatbotSession.upsert({
    where: { user_id: userId },
    update: { response_time: new Date() },
    create: { user_id: userId, response_time: new Date(), total_queries: 0 },
  });

  const query = await prisma.query.create({
    data: {
      user_id: userId,
      chatbot_session_id: session.id,
      query_text: message,
      users_data_inputed: [],
      created_at: new Date(),
    },
  });

  let responseText = "";
  let responseSource = "";

  try {
    let parameters: DFParams = dfParams || {};
    if (!dfParams) {
      const dialogflowSessionPath = `projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${userId}`;
      const dialogflow = await getDialogflowResponse(
        message,
        dialogflowSessionPath,
        conversationHistory
      );
      parameters = dialogflow?.parameters || {};
    }

    const nameRaw = parameters["school-name"];
    const infoRaw = parameters["school-info"];

    const name =
      (typeof nameRaw === "string" && nameRaw.trim()) || "Saint Joseph College";

    const requirementType: string[] = Array.isArray(infoRaw)
      ? Array.from(new Set(infoRaw.map(String)))
      : infoRaw
      ? [String(infoRaw)]
      : [];

    const paramPriority = [
      "history",
      "vision",
      "mission",
      "goals",
      "address",
      "small_details",
    ];

    function pickBestParam(reqTypes: string[]): string | null {
      for (const p of paramPriority) {
        if (reqTypes.includes(p)) return p;
      }
      return null;
    }

    let chosenParam = pickBestParam(requirementType);

    const mappedParameters = {
      name,
      requirementType: chosenParam ? [chosenParam] : [],
    };
    console.log("Mapped school parameters (to DB):", mappedParameters);

    let dbResult = "";

    if (requirementType.length > 1) {
      const combinedAnswers: string[] = [];
      for (const req of requirementType) {
        const res = await searchSchoolDetails({ name, requirementType: [req] });
        if (res && !res.includes("No schools matched")) {
          combinedAnswers.push(`${req.toUpperCase()}:\n${res}`);
        }
      }
      dbResult = combinedAnswers.join("\n\n");
    } else {
      dbResult = await searchSchoolDetails(mappedParameters);
    }

    responseText = dbResult;
    responseSource = "database-search";

    const looksLikeError =
      !dbResult ||
      dbResult.includes("No schools matched") ||
      dbResult.includes("I need more specific information") ||
      dbResult.includes("error searching") ||
      dbResult.includes("An error occurred");

    if (looksLikeError) {
      try {
        const prompt = singleLinePrompt(dbResult || "Not available", message);
        const { text, apiKey } = await getGenerativeResponse(
          prompt,
          conversationHistory
        );
        if (text && text.trim()) {
          responseText = text;
          responseSource = `generative-database-detail (via ${apiKey})`;
        }
      } catch (geminiError) {
        console.error("Generative response error:", geminiError);
      }
    }
  } catch (error) {
    console.error("Error in schoolDetailQuery:", error);
    responseText = "An error occurred while processing your request.";
    responseSource = "error-handler";
  }

  await prisma.chatbotSession.update({
    where: { id: session.id },
    data: { total_queries: { increment: 1 } },
  });

  return {
    answer: responseText,
    source: responseSource,
    queryId: query.id,
  };
};
