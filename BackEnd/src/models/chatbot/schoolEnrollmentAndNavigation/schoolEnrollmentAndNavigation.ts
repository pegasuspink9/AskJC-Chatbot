import { prisma } from "../../../../prisma/client";
import { searchSchoolEnrollmentAndNavigation } from "../../../../helper/services/schoolEnrollmentAndNavigation.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import {
  tablePrompts,
  singleLinePrompt,
  stepByStepPrompt,
} from "../prompts/prompts";

export const enrollmentAndNavigationQuery = async (
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
          case "get_enrollment_info": {
            const mappedParameters = {
              enrollment_process: parameters.enrollment_process || parameters.enrollment,
              query_type: "enrollment"
            };

            console.log("Original Dialogflow parameters:", parameters);
            console.log("Mapped enrollment parameters:", mappedParameters);

            const dbResult = await searchSchoolEnrollmentAndNavigation(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              
              const numberedEntries = (dbResult.match(/^\d+\./gm) || []).length;
              
              if (
                dbResult.includes("No enrollment or navigation information matched") ||
                dbResult.includes("I need more specific information.")
              ) {
                prompt = stepByStepPrompt(dbResult, message);
              } else if (
                numberedEntries >= 2 || 
                dbResult.includes("Found") && dbResult.split('\n').length >= 4 
              ) {
                prompt = stepByStepPrompt(dbResult, message);
              } else {
                prompt = singleLinePrompt(dbResult, message);
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

          case "get_navigation_info": {
            const mappedParameters = {
              navigation: parameters.navigation || parameters.location || parameters.place,
              query_type: "navigation"
            };

            console.log("Original Dialogflow parameters:", parameters);
            console.log("Mapped navigation parameters:", mappedParameters);

            const dbResult = await searchSchoolEnrollmentAndNavigation(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              
              const numberedEntries = (dbResult.match(/^\d+\./gm) || []).length;
              
              if (
                dbResult.includes("No enrollment or navigation information matched") ||
                dbResult.includes("I need more specific information.")
              ) {
                prompt = singleLinePrompt(dbResult, message);
              } else if (
                numberedEntries >= 2 || 
                dbResult.includes("Found") && dbResult.split('\n').length >= 4 
              ) {
                prompt = tablePrompts(dbResult, message);
              } else {
                prompt = singleLinePrompt(dbResult, message);
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

          case "get_all_enrollment_navigation": {
            const mappedParameters = {}; // Empty object to get ALL enrollment and navigation info
            
            console.log("Getting all enrollment and navigation information");
            
            const dbResult = await searchSchoolEnrollmentAndNavigation(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              // Always use tablePrompts for comprehensive display
              const prompt = tablePrompts(dbResult, message);
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

          case "get_enrollment_and_navigation": {
            const mappedParameters = {
              enrollment_process: parameters.enrollment_process || parameters.enrollment,
              navigation: parameters.navigation || parameters.location || parameters.place,
            };

            console.log("Original Dialogflow parameters:", parameters);
            console.log("Mapped enrollment & navigation parameters:", mappedParameters);

            const dbResult = await searchSchoolEnrollmentAndNavigation(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            try {
              let prompt = "";
              
              const numberedEntries = (dbResult.match(/^\d+\./gm) || []).length;
              
              if (
                dbResult.includes("No enrollment or navigation information matched") ||
                dbResult.includes("I need more specific information.")
              ) {
                prompt = singleLinePrompt(dbResult, message);
              } else if (
                numberedEntries >= 2 || 
                dbResult.includes("Found") && dbResult.split('\n').length >= 4 
              ) {
                prompt = tablePrompts(dbResult, message);
              } else {
                prompt = singleLinePrompt(dbResult, message);
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
    console.error("Error in enrollmentAndNavigationQuery:", error);
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