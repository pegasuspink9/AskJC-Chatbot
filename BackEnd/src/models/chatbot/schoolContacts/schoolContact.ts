import { prisma } from "../../../../prisma/client";
import { searchContacts } from "../../../../helper/services/schoolContact.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import {
  singleLinePrompt,
  tablePrompts,
} from "../prompts/prompts";

export const contactQuery = async (
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
          case "get_contact_info": {
            const mappedParameters = {
              contact_name: parameters.contact_names,
              query_type: parameters.query_type,
            };

            console.log("Original Dialogflow parameters:", parameters);
            console.log("Mapped contact parameters:", mappedParameters);

            const dbResult = await searchContacts(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              
              if (
                dbResult.includes("No contacts matched your search criteria.") ||
                dbResult.includes("I need more specific information.")
              ) {
                prompt = singleLinePrompt(dbResult, message, conversationHistory);
              } else if (
                dbResult.includes("Found") && 
                dbResult.split('\n').length >= 4  // 3 or more data lines (plus header = 4+ total lines)
              ) {
                prompt = tablePrompts(dbResult, message, conversationHistory);
              } else if (
                dbResult.includes("Found") || 
                dbResult.split('\n').length > 1
              ) {
                prompt = tablePrompts(dbResult, message, conversationHistory);
              } else {
                prompt = singleLinePrompt(dbResult, message, conversationHistory);
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
    console.error("Error in contactQuery:", error);
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