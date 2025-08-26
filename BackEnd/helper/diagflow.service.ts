import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

export interface DialogflowResponse {
  intent: string;
  fulfillmentText: string;
}

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
if (!projectId) {
  throw new Error("Dialogflow project ID is not configured.");
}

const sessionClient = new SessionsClient();

export const getDialogflowResponse = async (
  userMessage: string
): Promise<DialogflowResponse | null> => {
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
    const result = responses[0]?.queryResult;

    if (result && result.intent && result.fulfillmentText) {
      return {
        intent: result.intent.displayName || "Unknown Intent",
        fulfillmentText: result.fulfillmentText,
      };
    }

    return null;
  } catch (error) {
    console.error("Dialogflow error:", error);
    throw new Error("Error in Dialogflow API");
  }
};
