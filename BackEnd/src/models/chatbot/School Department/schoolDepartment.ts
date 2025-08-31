import { prisma } from "../../../../prisma/client";
import { searchSchoolDepartment } from "../../../../helper/services/schoolDepartment.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import {
  tablePrompts,
  singleLinePrompt,
  bulletinPrompts,
} from "../prompts/prompts";

export const departmentOfficialsQuery = async (
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
          case "get_department_info": {
            const mappedParameters = {
              name: parameters.department_name || parameters.name,
              head_name: parameters["departments-head-names"],
            };
            console.log("Original parameters:", parameters);
            console.log("Mapped parameters:", mappedParameters);

            const dbResult = await searchSchoolDepartment(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              const prompt = bulletinPrompts(message, dbResult);
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
            responseText = "Sorry, I couldn’t understand your request.";
            responseSource = "dialogflow-unknown";
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in departmentOfficialsQuery:", error);
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
