import { prisma } from "../../../../prisma/client";
import { searchCourses } from "../../../../helper/services/schoolCourses.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import {
  coursesPrompt,
  singleLinePrompt,
  tablePrompts,
} from "../prompts/prompts";

export const courseQuery = async (
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

  let responseText = "";
  let responseSource = "";

  try {
    const dialogflowSessionPath = `projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${userId}`;

    const dialogflow = await getDialogflowResponse(
      message,
      dialogflowSessionPath,
      conversationHistory
    );

    if (!dialogflow || dialogflow.confidence < 0.3) {
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
      const { action, parameters, fulfillmentText, intent } = dialogflow;

      console.log(`Dialogflow Intent: ${intent}, Action: ${action}`);
      console.log("Parameters:", parameters);

      if (fulfillmentText && fulfillmentText.trim()) {
        responseText = fulfillmentText;
        responseSource = "dialogflow-direct";
      } else {
        switch (action) {
          case "get_course_info": {
            const mappedParameters = {
              year_level: parameters.year_level,
              program: parameters.program_names,
            };

            console.log("Original Dialogflow parameters:", parameters);
            console.log("Mapped course parameters:", mappedParameters);

            const dbResult = await searchCourses(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              
              const numberedEntries = (dbResult.match(/^\d+\./gm) || []).length;
              
              if (
                dbResult.includes("I couldn't find any courses matching your search criteria.") ||
                dbResult.includes("I need more specific information.")
              ) {
                prompt = tablePrompts(dbResult, message, conversationHistory);
              } else if (
                numberedEntries >= 2 ||
                dbResult.includes("Found") && dbResult.split('\n').length >= 4 
              ) {
                prompt = tablePrompts(dbResult, message, conversationHistory);
              } else {
                prompt = tablePrompts(dbResult, message, conversationHistory);
              }

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
            break;
          }

          default: {
            const { text, apiKey } = await getGenerativeResponse(
              message,
              conversationHistory
            );
            responseText = text;
            responseSource = `generative-main (via ${apiKey})`;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in courseQuery:", error);
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