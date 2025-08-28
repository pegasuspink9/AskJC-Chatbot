import { prisma } from "../../../../prisma/client";
import { fetchScholarshipFromDB } from "../../../../helper/services/scholarship.service";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { getDialogflowResponse } from "../../../../helper/dialogflow.service";

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

  let responseText =
    "I apologize, but I'm having a bit of trouble right now. Please try again in a moment.";
  let responseSource = "error";

  try {
    const dialogflowResult = await getDialogflowResponse(message);

    if (!dialogflowResult) {
      console.log("Dialogflow returned null. Falling back to Gemini.");
      const { text, apiKey } = await getGenerativeResponse(message);
      responseText = text;
      responseSource = `generative-critical-fallback (via ${apiKey})`;
    } else {
      const { action, parameters, fulfillmentText } = dialogflowResult;

      console.log(`Dialogflow routed to action: ${action}`);

      if (fulfillmentText) {
        responseText = fulfillmentText;
        responseSource = "dialogflow-direct";
      } else {
        switch (action) {
          case "get_scholarship_detail": {
            const fact = await fetchScholarshipFromDB(parameters);

            responseText = `Here’s what I found for **${parameters["scholarship-name"]}** (${parameters["scholarship-detail"]}):\n\n${fact}`;
            responseSource = "database-detail";

            try {
              const prompt = `
                You are a school chatbot. 
                Do NOT say "the student asked" or "the student wants to know".
                Answer the student's question directly, like you are talking to them.

                Information you can use: ${fact}

                Student's question: 
                "${message}"

                Now respond conversationally and directly.
                `;

              const { text, apiKey } = await getGenerativeResponse(prompt);
              if (text) {
                responseText = text;
                responseSource = `generative-database-detail (via ${apiKey})`;
              }
            } catch {
              console.warn("Gemini unavailable, sticking with DB fallback.");
            }
            break;
          }

          case "list_scholarships_by_category": {
            const category = parameters["scholarship-category"];
            const scholarships = await prisma.scholarship.findMany({
              where: { category: { equals: category, mode: "insensitive" } },
            });

            if (scholarships.length > 0) {
              const scholarshipNames = scholarships
                .map((s) => `- ${s.name}`)
                .join("\n");

              responseText = `Here are the scholarships in the **${category}** category:\n\n${scholarshipNames}`;
              responseSource = "database-list";

              try {
                const prompt = `
                  You are a school chatbot. 
                  Do NOT say "the student asked" or "the student wants to know".
                  Answer the student's question directly, like you are talking to them.

                  Information you can use: 
                  Scholarships in the "${category}" category:
                  ${scholarshipNames}

                  Student's question: 
                  "${message}"

                  Now respond conversationally and directly.
                `;
                const { text, apiKey } = await getGenerativeResponse(prompt);
                if (text) {
                  responseText = text;
                  responseSource = `generative-database-list (via ${apiKey})`;
                }
              } catch {
                console.warn("Gemini unavailable, sticking with DB fallback.");
              }
            } else {
              responseText = `I checked our records, but I couldn't find any scholarships in the "${category}" category. You can ask for another category or a list of all scholarships.`;
              responseSource = "database-list-empty";
            }
            break;
          }

          default: {
            console.log(
              "Action not handled by database logic. Sending to Gemini."
            );
            const { text, apiKey } = await getGenerativeResponse(message);
            responseText = text;
            responseSource = `generative-main (via ${apiKey})`;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in handleChatbotMessage:", error);
  }

  return {
    answer: responseText,
    source: responseSource,
    queryId: query.id,
  };
};
