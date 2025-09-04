import { prisma } from "../../../../prisma/client";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import {
  searchSchoolDetails,
  RequirementType,
} from "../../../../helper/services/schoolDetail.database";
import { pickPromptStyle, needsIntro } from "../prompts/promptStyle.helper";

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

    const nameRaw = parameters["school_name"];
    const infoRaw = parameters["school-info"];
    const presidentRaw = parameters["school-president"];
    const eventsRaw = parameters["school-events"];

    const school_name =
      nameRaw && typeof nameRaw === "string" && nameRaw.trim() !== ""
        ? nameRaw.trim()
        : "Saint Joseph College";

    const allRequirements: string[] = [];

    if (Array.isArray(infoRaw)) {
      allRequirements.push(...infoRaw.map(String));
    } else if (infoRaw) {
      allRequirements.push(String(infoRaw));
    }

    if (Array.isArray(presidentRaw) && presidentRaw.length > 0) {
      allRequirements.push("school-president");
    } else if (presidentRaw) {
      allRequirements.push("school-president");
    }

    if (Array.isArray(eventsRaw) && eventsRaw.length > 0) {
      allRequirements.push("school-events");
    } else if (eventsRaw) {
      allRequirements.push("school-events");
    }

    const validRequirementTypes: RequirementType[] = Array.from(
      new Set(allRequirements)
    ).filter((req): req is RequirementType =>
      [
        "history",
        "vision",
        "mission",
        "goals",
        "address",
        "small_details",
        "school-president",
        "school-events",
      ].includes(req)
    );

    console.log("🔍 All Requirements Found:", allRequirements);
    console.log("🔍 Valid Requirement Types:", validRequirementTypes);

    const mappedParameters = {
      school_name,
      requirementType: validRequirementTypes,
    };

    let dbResult = "";
    if (validRequirementTypes.length > 1) {
      const combinedAnswers: string[] = [];
      for (const req of validRequirementTypes) {
        const res = await searchSchoolDetails({
          school_name,
          requirementType: [req],
        });
        if (res && !res.includes("No schools matched")) {
          const intro = needsIntro(req);
          combinedAnswers.push(`${intro ?? ""}${res}`);
        }
      }
      dbResult = combinedAnswers.join("\n\n");
    } else {
      dbResult = await searchSchoolDetails(mappedParameters);

      if (
        validRequirementTypes.length > 0 &&
        needsIntro(validRequirementTypes[0]) &&
        dbResult &&
        !dbResult.startsWith("Here's what I found")
      ) {
        dbResult = `${dbResult}`;
      }
    }

    const looksLikeError =
      !dbResult ||
      dbResult.includes("No schools matched") ||
      dbResult.includes("I need more specific information") ||
      dbResult.includes("error searching") ||
      dbResult.includes("An error occurred");

    if (
      looksLikeError ||
      validRequirementTypes.some((r) =>
        ["history", "school-president", "school-events"].includes(r)
      )
    ) {
      try {
        const promptFn = pickPromptStyle(message, validRequirementTypes);
        const prompt = promptFn(dbResult || "Not available", message);

        const { text, apiKey } = await getGenerativeResponse(
          prompt,
          conversationHistory
        );

        if (text && text.trim()) {
          responseText = text;
          responseSource = `generative-history (via ${apiKey})`;
        } else {
          responseText =
            dbResult || "I'm sorry, I don't have that information.";
          responseSource = "history-db-fallback";
        }
      } catch (geminiError) {
        console.error("Generative response error (history):", geminiError);
        responseText = dbResult || "I'm sorry, I don't have that information.";
        responseSource = "history-db-fallback";
      }
    } else {
      responseText = dbResult;
      responseSource = "database-search";
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
