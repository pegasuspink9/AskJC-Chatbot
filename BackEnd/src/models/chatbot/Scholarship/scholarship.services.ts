import { prisma } from "../../../../prisma/client";
import {
  fetchScholarshipFromDB,
  fetchScholarshipsByCategory,
} from "../../../../helper/services/scholarship.service";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { getDialogflowResponse } from "../../../../helper/dialogflow";

export const scholarshipMessage = async (
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

    if (dialogflowResult) {
      const { action, parameters } = dialogflowResult;

      switch (action) {
        case "get_scholarship_detail": {
          const scholarshipData = await fetchScholarshipFromDB(parameters);

          if (!scholarshipData) {
            responseText = "Sorry, I couldn't find any scholarships right now.";
            responseSource = "database-empty";
            break;
          }

          const prompt = `
            You are a friendly school chatbot.
            The student asked: "${message}"

            Here is the scholarship data:
            ${JSON.stringify(scholarshipData, null, 2)}

            Answer conversationally.
          `;

          const { text, apiKey } = await getGenerativeResponse(prompt);

          responseText = text || "Here are the scholarships available at SJC.";
          responseSource = `generative-database-detail (via ${apiKey})`;
          break;
        }

        case "list_scholarships_by_category": {
          const category = parameters["scholarship-category"];
          const scholarships = await fetchScholarshipsByCategory(category);

          if (scholarships.length > 0) {
            const scholarshipNames = scholarships
              .map((s) => `- ${s.name}`)
              .join("\n");

            const prompt = `
              You are a friendly school chatbot.
              The student asked: "${message}"

              Here are the scholarships in category "${category}":
              ${scholarshipNames}

              Answer directly and conversationally.
            `;

            const { text, apiKey } = await getGenerativeResponse(prompt);

            responseText =
              text ||
              `Here are the scholarships in the ${category} category:\n${scholarshipNames}`;
            responseSource = `generative-database-list (via ${apiKey})`;
          } else {
            responseText = `I couldn't find any scholarships in the "${category}" category.`;
            responseSource = "database-list-empty";
          }
          break;
        }

        default: {
          const { text, apiKey } = await getGenerativeResponse(message);
          responseText = text;
          responseSource = `generative-main (via ${apiKey})`;
        }
      }
    } else {
      const { text, apiKey } = await getGenerativeResponse(message);
      responseText = text;
      responseSource = `generative-critical-fallback (via ${apiKey})`;
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
