import { prisma } from "../../../../prisma/client";
import {
  searchSchoolOfficial,
} from "../../../../helper/services/schoolOfficials.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { tablePrompts, singleLinePrompt } from "../prompts/prompts";

export const schoolOfficialsQuery = async (
  userId: number,
  message: string,
  conversationHistory: string[] = []
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

  let responseText =
    "I'm sorry, I'm having trouble processing your request right now.";
  let responseSource = "error";

  try {
    const dialogflowSessionPath = `projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${userId}`;
    const dialogflowResult = await getDialogflowResponse(
      message,
      dialogflowSessionPath,
      conversationHistory
    );

    if (!dialogflowResult || dialogflowResult.confidence < 0.3) {
      console.log(
        "Low confidence or no Dialogflow result. Using Gemini fallback."
      );
      const { text, apiKey } = await getGenerativeResponse(
        message,
        conversationHistory
      );
      responseText = text;
      responseSource = `generative-fallback (via ${apiKey})`;
    } else {
      const { action, parameters, fulfillmentText, intent } = dialogflowResult;
      console.log(`Dialogflow Intent: ${intent}, Action: ${action}`);
      console.log("Parameters:", parameters);

      if (fulfillmentText && fulfillmentText.trim()) {
        responseText = fulfillmentText;
        responseSource = "dialogflow-direct";
      } else {
        switch (action) {
          case "get_school_official_info":
          case "get_all_officials_with_position": {
            const mappedParameters = {
              position: parameters.position_titles || parameters.position,
              department: parameters.departments || parameters.department,
              query_type: parameters.query_types || parameters.query_type,
            };
            console.log("🔄 Original parameters:", parameters);
            console.log("🔄 Mapped parameters:", mappedParameters);

            const dbResult = await searchSchoolOfficial(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              if (
                dbResult.includes("No officials matched") ||
                dbResult.includes("I need more specific information") ||
                dbResult.includes("I couldn't find any")
              ) {
                prompt = singleLinePrompt(message, dbResult);
              } else if (
                action === "get_all_officials_with_position" ||
                dbResult.includes("Here are all the") ||
                dbResult.includes("Here are the officials") ||
                dbResult.includes("I found multiple")
              ) {
                prompt = tablePrompts(message, dbResult);
              } else {
                // For single official responses
                prompt = singleLinePrompt(message, dbResult);
              }

              if (prompt) {
                const { text, apiKey } = await getGenerativeResponse(
                  prompt,
                  conversationHistory
                );
                if (text && text.trim()) {
                  responseText = text;
                  responseSource = `enhanced-database (via ${apiKey})`;
                }
              }
            } catch (geminiError) {
              console.warn(
                "Gemini enhancement failed, using database result:",
                geminiError
              );
            }
            break;
          }

          default: {
            console.log(`Unknown action: ${action}, using Gemini fallback`);
            const { text, apiKey } = await getGenerativeResponse(
              message,
              conversationHistory
            );
            responseText = text;
            responseSource = `generative-unknown-action (via ${apiKey})`;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in schoolOfficialsQuery:", error);
    try {
      const { text, apiKey } = await getGenerativeResponse(
        message,
        conversationHistory
      );
      responseText = text;
      responseSource = `generative-error-fallback (via ${apiKey})`;
    } catch (geminiError) {
      console.error("Gemini fallback also failed:", geminiError);
      responseText =
        ", but I'm experiencing technical difficulties. Please try again later.";
      responseSource = "error-complete-fallback";
    }
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