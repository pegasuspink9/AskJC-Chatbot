import { prisma } from "../../../../prisma/client";
import { searchOfficeAndFacilities } from "../../../../helper/services/officeAndFacilities.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { mapPrompt, singleLinePrompt } from "../prompts/prompts";

export const officeFacilitiesQuery = async (
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
      console.log("Low confidence → Using Gemini fallback");

      const { text, apiKey } = await getGenerativeResponse(
        message,
        conversationHistory
      );
      responseText = text;
      responseSource = `generative-fallback (via ${apiKey})`;
    } else {
      const { action, parameters, fulfillmentText, intent } = dialogflow;

      console.log(`Dialogflow Intent: ${intent}, Action: ${action}`);
      console.log(
        "📡 FULL DIALOGFLOW RAW RESPONSE:",
        JSON.stringify(dialogflow, null, 2)
      );

      if (fulfillmentText && fulfillmentText.trim()) {
        responseText = fulfillmentText;
        responseSource = "dialogflow-direct";
      } else {
        switch (action) {
          case "ask_location_info": {
            const originalParameters = {
              offices_name: parameters.offices_name,
              facility_name: parameters.facility_name,
              room_number: parameters.room_number,
              building: parameters.building,
            };

            const mappedParameters = {
              office_name: originalParameters.offices_name,
              facility_name: originalParameters.facility_name,
              room_number: originalParameters.room_number,
              building: originalParameters.building,
            };

            console.log("Original Dialogflow parameters:", originalParameters);
            console.log("Mapped office parameters:", mappedParameters);

            const dbResult = await searchOfficeAndFacilities(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";

              if (
                dbResult.includes("No offices") ||
                dbResult.includes("No facilities") ||
                dbResult.includes("I need the office")
              ) {
                prompt = singleLinePrompt(dbResult, message);
              } else {
                prompt = mapPrompt(dbResult, message);
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
    console.error("Error in officeFacilitiesQuery:", error);
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
