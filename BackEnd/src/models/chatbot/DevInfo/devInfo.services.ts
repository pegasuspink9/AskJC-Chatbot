import { prisma } from "../../../../prisma/client";
import { getDialogflowResponse } from "../../../../helper/dialogflow";
import { getGenerativeResponse } from "../../../../helper/gemini.service";
import { singleLinePrompt, bulletinPrompts } from "../prompts/prompts";
import { searchDevInfo } from "../../../../helper/services/devInfo.database";

export const devInfoQuery = async (
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
          case "get_dev_info": {
            const dbResult = await searchDevInfo({
              dev_name: parameters.dev_name,
              role: parameters.role,
            });

            if (
              dbResult.includes("No developer information found") ||
              dbResult.includes("Developer information is not available")
            ) {
              responseText = dbResult;
              responseSource = "database-empty";
            } else {
              if (parameters.dev_name) {
                responseText = dbResult;
                responseSource = "database-direct";
              } else {
                const useBulletin = (dbResult.match(/\n\n/g) || []).length > 0;
                const prompt = useBulletin
                  ? bulletinPrompts(dbResult, message)
                  : singleLinePrompt(dbResult, message);

                const { text, apiKey } = await getGenerativeResponse(
                  prompt,
                  conversationHistory
                );
                responseText = text;
                responseSource = `generative-dev-info (via ${apiKey})`;
              }
            }
            break;
          }

          case "get_all_devs": {
            const results = await prisma.devInfo.findMany({
              orderBy: { id: "asc" },
            });

            if (!results || results.length === 0) {
              responseText = "No developer information found.";
              responseSource = "database-empty";
            } else if (action === "get_all_devs") {
              const details = results
                .map(
                  (d) => `• **${d.dev_name}** (${d.role})\n  ${d.description}`
                )
                .join("\n\n");

              responseText = `Here’s the full list of our developers:\n\n${details}`;
              responseSource = "database-all-devs";
            } else {
              const devDetails = results
                .map((d) => `${d.dev_name} (${d.role}) - ${d.description}`)
                .join("\n");

              const prompt = `The following are the developers of this chatbot:\n${devDetails}\n\nUser asked: "${message}". Answer naturally in third person, referring to them as the creators of the AI.`;

              const { text, apiKey } = await getGenerativeResponse(
                prompt,
                conversationHistory
              );
              responseText = text;
              responseSource = `generative-creator-info (via ${apiKey})`;
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
    console.error("Error in devInfoQuery:", error);
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
