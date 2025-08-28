import { prisma } from "../../../../prisma/client";
import {
  fetchDeanInfo,
  fetchAllDeans,
  fetchOfficialsByCategory,
  searchSchoolOfficial,
} from "../../../../helper/services/schoolOfficials.database";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";

export const handleChatbotMessage = async (
  userId: number,
  message: string
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

  let responseText = "I'm sorry, I'm having trouble processing your request right now.";
  let responseSource = "error";

  try {
    const dialogflowResult = await getDialogflowResponse(message);

    if (!dialogflowResult || dialogflowResult.confidence < 0.3) {
      console.log("Low confidence or no Dialogflow result. Using Gemini fallback.");
      const { text, apiKey } = await getGenerativeResponse(message);
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
          case "get_school_official_info": {
            // Map Dialogflow parameters to expected format
            const mappedParameters = {
              position: parameters.position_titles || parameters.position,
              department: parameters.departments || parameters.department,
              query_type: parameters.query_types || parameters.query_type
            };
            
            console.log("🔄 Original parameters:", parameters);
            console.log("🔄 Mapped parameters:", mappedParameters);
            
            const dbResult = await searchSchoolOfficial(mappedParameters);
            responseText = dbResult;
            responseSource = "database-search";

            // Enhance with Gemini if available
            try {
              const prompt = `
                Student asked: "${message}"
                
                Database result: "${dbResult}"

                Talk like a front desk assistant, conversational way as a helpful school assistant. Keep it concise and natural. Make the highlight answer bold ** ** with new line. Also continue the conversation by giving a related question or suggestion. Put the suggestion inside the brackets [ ] make a 2 suggestions in short.
              `;
              const { text, apiKey } = await getGenerativeResponse(prompt);
              if (text && text.trim()) {
                responseText = text;
                responseSource = `enhanced-database (via ${apiKey})`;
              }
            } catch (geminiError) {
              console.warn("Gemini enhancement failed, using database result:", geminiError);
            }
            break;
          }

          case "get_dean_info": {
            const deanInfo = await fetchDeanInfo(parameters);
            responseText = deanInfo;
            responseSource = "database-dean";

            // Enhance with Gemini
            try {
              const prompt = `
                Student asked: "${message}"
                Dean information: "${deanInfo}"
                
                Please respond naturally and conversationally as a school assistant.
              `;
              const { text, apiKey } = await getGenerativeResponse(prompt);
              if (text && text.trim()) {
                responseText = text;
                responseSource = `enhanced-dean (via ${apiKey})`;
              }
            } catch (geminiError) {
              console.warn("Gemini enhancement failed:", geminiError);
            }
            break;
          }

          case "get_all_deans": {
            const allDeans = await fetchAllDeans();
            responseText = allDeans;
            responseSource = "database-all-deans";
            break;
          }

          case "get_officials_by_category": {
            const category = parameters.category || parameters.department;
            if (category) {
              const categoryOfficials = await fetchOfficialsByCategory(category);
              responseText = categoryOfficials;
              responseSource = "database-category";
            } else {
              responseText = "Please specify which category of officials you'd like to know about.";
              responseSource = "validation-error";
            }
            break;
          }

          case "greeting": {
            responseText = "Hello! I'm here to help you find information about school officials. You can ask me about deans, directors, principals, and other staff members. What would you like to know?";
            responseSource = "dialogflow-greeting";
            break;
          }

          case "help": {
            responseText = `I can help you find information about school officials! Here are some examples:

            • "Who is the dean of Criminology?"
            • "Tell me about the school president"
            • "Who are the officials in Computer Studies?"
            • "Show me all deans"
            • "List Board of Trustees members"

            What would you like to know?`;
            responseSource = "dialogflow-help";
            break;
          }

          default: {
            console.log("Unhandled action, using Gemini fallback");
            const { text, apiKey } = await getGenerativeResponse(message);
            responseText = text;
            responseSource = `generative-unhandled (via ${apiKey})`;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in handleChatbotMessage:", error);
    
    // Final fallback to Gemini
    try {
      const { text, apiKey } = await getGenerativeResponse(message);
      responseText = text;
      responseSource = `generative-error-fallback (via ${apiKey})`;
    } catch (geminiError) {
      console.error("Gemini fallback also failed:", geminiError);
      responseText = "I apologize, but I'm experiencing technical difficulties. Please try again later.";
      responseSource = "error-complete-fallback";
    }
  }

  // Update session
  await prisma.chatbotSession.update({
    where: { id: session.id },
    data: { total_queries: { increment: 1 } }
  });

  return {
    answer: responseText,
    source: responseSource,
    queryId: query.id,
  };
};