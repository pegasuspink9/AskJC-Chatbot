import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

if (!projectId) {
  console.error(
    "Missing DIALOGFLOW_PROJECT_ID environment variable. Please check your .env file."
  );
  throw new Error("Dialogflow project ID is not configured.");
}

const sessionClient = new SessionsClient();

export const getDialogflowResponse = async (userMessage: string) => {
  const sessionId = uuidv4();
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: "en",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult?.fulfillmentText;

    return result || null;
  } catch (error) {
    console.error("Dialogflow error:", error);
    throw new Error("Error in Dialogflow API");
  }
};
